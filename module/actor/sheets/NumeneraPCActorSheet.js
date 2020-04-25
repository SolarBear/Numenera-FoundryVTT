import { NUMENERA } from "../../config.js";
import { NumeneraWeaponItem } from "../../item/NumeneraWeaponItem.js";

/**
 * Function generator for handling click controls. Will handle dynamic tables
 * row creation and deletion. Just call it with the required name and assign
 * it to a class property.
 *
 * - Creation: expects the table to have an embedded <template> tag as a direct child
 * which contains the HTML structure to use as a row (ie. <tr> tag).
 * - Deletion: expects an anchor with the "XYZ-control" class somewhere inside the
 * rows, where "XYZ" is the control parameter.
 *
 * @param {string} control The kind of control to look for (eg. "ability", "skill", etc.)
 *
 * @
 */
function onClickControlGenerator(control) {
  return async function (event) {
    event.preventDefault();

    const a = event.currentTarget;
    const action = a.dataset.action;

    switch (action) {
      case "create":
        const table = a.closest("table");
        const template = table.getElementsByTagName("template")[0];
        const body = table.getElementsByTagName("tbody")[0];

        if (!template)
          throw new Error(`No row template found in ${control} table`);

        const newRow = template.content.cloneNode(true);
        body.appendChild(newRow);
        await this._onSubmit(event);
        break;

      case "delete":
        const row = a.closest("." + control);
        row.parentElement.removeChild(row);
        await this._onSubmit(event);
        break;

      default:
        return;
    }
  };
}

/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class NumeneraPCActorSheet extends ActorSheet {
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [
        "form.numenera table.weapons",
        "form.numenera table.skills",
        "form.numenera table.abilities",
      ],
      width: 900,
      height: 1000,
    });
  }

  static get advances() {
    return NUMENERA.advances;
  }

  constructor(...args) {
    super(...args);

    //Call generator function to assign table event handlers
    this.onClickSkillControl = onClickControlGenerator("skill");
    this.onClickAbilityControl = onClickControlGenerator("ability");
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/characterSheet.html";
  }

  /**
   * Provides the data objects provided to the character sheet. Use that method
   * to insert new values or mess with existing ones.
   */
  getData() {
    const sheetData = super.getData();

    const actorType = sheetData.actor.data.characterType || "";

    //Copy labels to be used as is
    if (actorType)
      sheetData.abilitiesName = NUMENERA.typePowers[actorType];
    else
      sheetData.abilitiesName = "Abilities";

    sheetData.ranges = NUMENERA.ranges;
    sheetData.stats = NUMENERA.stats;
    sheetData.weaponTypes = NUMENERA.weaponTypes;
    sheetData.weights = NUMENERA.weightClasses;

    //"Augment" the types objects with a new "isActorType" property
    sheetData.types = NUMENERA.types.map((value) => {
      return {
        ...value,
        isActorType: value.abbrev === actorType,
      };
    });

    sheetData.advances = Object.entries(sheetData.actor.data.advances).map(
      ([key, value]) => {
        return {
          name: key,
          label: NUMENERA.advances[key],
          isChecked: value,
        };
      }
    );

    const currentDamageTrack = this.actor.damageTrackLevel();
    sheetData.damageTrackData = Object.values(NUMENERA.damageTrack).map(
      (trackLevel) => {
        return {
          ...trackLevel,
          checked: trackLevel.index === currentDamageTrack,
        };
      }
    );
    sheetData.damageTrackDescription = sheetData.damageTrackData.filter(
      (d) => d.checked
    )[0].description;

    sheetData.recoveriesData = Object.entries(
      sheetData.actor.data.recoveries
    ).map(([key, value]) => {
      return {
        key,
        label: NUMENERA.recoveries[key],
        checked: value,
      };
    });

    //Skills section
    sheetData.skills = Object.values(sheetData.actor.data.skills).forEach(
      (skill) => {
        skill.stats = NUMENERA.stats.map((stat) => {
          return {
            label: stat,
            checked: stat === skill.stat,
          };
        });
      }
    );

    //Weapons section
    sheetData.data.items = sheetData.actor.items || {};

    const items = sheetData.data.items;
    if (!sheetData.data.items.weapons)
      sheetData.data.items.weapons = items.filter(i => i.type === "weapon");

    return sheetData;
  }

  /**
   * Add character sheet-specific event listeners.
   *
   * @param {*} html
   * @memberof ActorSheetNumeneraPC
   */
  activateListeners(html) {
    super.activateListeners(html);

    const skillsTable = html.find("table.skills");
    skillsTable.on(
      "click",
      ".skill-control",
      this.onClickSkillControl.bind(this)
    );
    skillsTable.on(
      "blur",
      "tbody input,select,textarea",
      this.onSkillNameChange.bind(this)
    );

    const weaponsTable = html.find("table.weapons");
    weaponsTable.on("click", ".weapon-create", this.onWeaponCreate.bind(this));
    weaponsTable.on("click", ".weapon-delete", this.onWeaponDelete.bind(this));
    weaponsTable.on("blur", "input,select,textarea", this.onWeaponEdit.bind(this));

    const abilityTable = html.find("table.abilities");
    abilityTable.on(
      "click",
      ".ability-control",
      this.onClickAbilityControl.bind(this)
    );
    abilityTable.on(
      "blur",
      "tbody input,select,textarea",
      this.onAbilityNameChange.bind(this)
    ); 
  }

  onWeaponCreate(event) {
    event.preventDefault();

    const count = this.actor.getEmbeddedCollection("OwnedItem")
      .filter(i => i.name.startsWith("New Weapon"))
      .length;
    const weaponData = {
      name: "New Weapon " + (count + 1),
      type: "weapon",
      data: new NumeneraWeaponItem({}),
    };

    return this.actor.createOwnedItem(weaponData);
  }

  onWeaponDelete(event) {
    event.preventDefault();

    const tr = event.currentTarget.closest(".weapon");
    this.actor.deleteOwnedItem(tr.dataset.itemId);
  }

  async onWeaponEdit(event) {
    event.preventDefault();

    const row = event.currentTarget.closest(".weapon");
    const item = this.actor.getOwnedItem(row.dataset.itemId);
    const updated = duplicate(item.data); //duplicate item

    const name = event.currentTarget.name.split(".").pop();
    //The "name" property is not at the same hierarchy levels as "regular" properties
    if (name === "name")
      updated.name = event.currentTarget.value
    else
      updated.data[name] = event.currentTarget.value;

    await this.actor.updateEmbeddedEntity("OwnedItem", updated);
    this.actor.render();
  }

  /**
   * Event handler for the "blur" (ie. focus lost) event on ability names. Sets the current
   * name as ability name to all other inputs inside the row.
   *
   * @param {Event} event
   * @memberof ActorSheetNumeneraPC
   */
  async onAbilityNameChange(event) {
    event.preventDefault();

    const input = event.currentTarget;

    //TODO Hello! I'm a hack. Please obliterate me as violently as possible! Thank you! :)
    const row = event.currentTarget.closest(".ability");
    row.children[0].children[0].name = `data.abilities.${input.value}.name`;
    row.children[1].children[0].name = `data.abilities.${input.value}.cost.amount`;
    row.children[1].children[1].name = `data.abilities.${input.value}.cost.pool`;
    row.children[2].children[0].name = `data.abilities.${input.value}.description`;
  }

  /**
   * Event handler for the "blur" (ie. focus lost) event on skill names. Sets the current
   * name as skill name to all other inputs inside the row.
   *
   * @param {Event} event
   * @memberof ActorSheetNumeneraPC
   */
  async onSkillNameChange(event) {
    event.preventDefault();

    const input = event.currentTarget;

    //TODO Hello! I'm a hack. Please obliterate me as violently as possible! Thank you! :)
    const row = event.currentTarget.closest(".skill");
    row.children[0].children[0].name = `data.skills.${input.value}.name`;
    row.children[1].children[0].name = `data.skills.${input.value}.stat`;
    row.children[2].children[0].name = `data.skills.${input.value}.inability`;
    row.children[3].children[0].name = `data.skills.${input.value}.trained`;
    row.children[4].children[0].name = `data.skills.${input.value}.specialized`;
  }

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   *
   * Mostly handles the funky behavior of dynamic tables inside the form.
   *
   * @private
   */
  async _updateObject(event, formData) {
    //TODO this works A-OK but it's ugly... find a cleaner way to handle this
    if (event.currentTarget && event.currentTarget.closest(".weapon")) {
      return;
    }

    const fd = expandObject(formData);

    const formSkills = fd.data.skills || {};
    const formAbilities = fd.data.abilities || {};

    const formDataReduceFunction = function (obj, v) {
      if (v.hasOwnProperty("name")) {
        const name = v["name"].trim();
        if (name) obj[name] = v;
      }

      return obj;
    };

    const skills = Object.values(formSkills).reduce(formDataReduceFunction, {});
    const abilities = Object.values(formAbilities).reduce(
      formDataReduceFunction,
      {}
    );

    // Remove skills which are no longer used
    for (let sk of Object.keys(this.object.data.data.skills)) {
      if (sk && !skills.hasOwnProperty(sk)) skills[`-=${sk}`] = null;
    }
    for (let ab of Object.keys(this.object.data.data.abilities)) {
      if (ab && !abilities.hasOwnProperty(ab)) abilities[`-=${ab}`] = null;
    }

    // Re-combine formData
    formData = Object.entries(formData)
      .filter(
        (e) =>
          !e[0].startsWith("data.skills") &&
          !e[0].startsWith("data.abilities")
      )
      .reduce(
        (obj, e) => {
          obj[e[0]] = e[1];
          return obj;
        },
        {
          _id: this.object._id,
          "data.skills": skills,
          "data.abilities": abilities,
        }
      );

    // Update the Actor
    await this.object.update(formData);
  }
}
