import { NUMENERA } from "../../config.js";
import { NumeneraWeaponItem } from "../../item/NumeneraWeaponItem.js";

import  "../../../lib/dragula/dragula.js";

//Common Dragula options
const dragulaOptions = {
  moves: function (el, container, handle) {
    return handle.classList.contains('handle');
  }
};

//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

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

function onItemEditGenerator(editClass) {
  return async function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(editClass);

    if (!elem)
      throw new Error(`Missing ${editClass} class element`);
    else if (!elem.dataset.itemId)
      throw new Error(`No itemID on ${editClass} element`);

    const item = this.actor.getOwnedItem(elem.dataset.itemId);

    if (!item)
      throw new Error(`No such item ID ${elem.dataset.itemId}`)

    const updated = duplicate(item.data);

    const name = event.currentTarget.name.split(".").pop();
    //The "name" property is not at the same hierarchy levels as "regular" properties
    if (name === "name")
      updated.name = event.currentTarget.value
    else
      updated.data[name] = event.currentTarget.value;

    await this.actor.updateEmbeddedEntity("OwnedItem", updated);
    this.actor.render();
  }
}

function onItemDeleteGenerator(deleteClass) {
  return function (event) {
    event.preventDefault();
  
    const elem = event.currentTarget.closest(deleteClass);
    const itemId = elem.dataset.itemId;
    this.actor.deleteOwnedItem(itemId);
  }
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
        "form.numenera ul.artifacts",
        "form.numenera ul.cyphers",
        "form.numenera ul.oddities",
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

    //Edit event handlers
    this.onArtifactEdit = onItemEditGenerator(".artifact");
    this.onCypherEdit = onItemEditGenerator(".cypher");
    this.onWeaponEdit = onItemEditGenerator(".weapon");

    //Delete event handlers
    this.onArtifactDelete = onItemDeleteGenerator(".artifact");
    this.onCypherDelete = onItemDeleteGenerator(".cypher");
    this.onOddityDelete = onItemDeleteGenerator(".oddity");
    this.onWeaponDelete = onItemDeleteGenerator(".weapon");
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
      (skill, index) => {
        if (!skill.hasOwnProperty("data.order"))
          skill.data = { order: index};

        skill.stats = NUMENERA.stats.map((stat) => {
          return {
            label: stat,
            checked: stat === skill.stat,
          };
        });
      }
    );
    
    if (sheetData.skills)
      sheetData.skills.sort(sortFunction);

    //Weapons section
    sheetData.data.items = sheetData.actor.items || {};

    const items = sheetData.data.items;
    if (!sheetData.data.items.artifacts)
      sheetData.data.items.artifacts = items.filter(i => i.type === "artifact").sort(sortFunction);
    if (!sheetData.data.items.cyphers)
      sheetData.data.items.cyphers = items.filter(i => i.type === "cypher").sort(sortFunction);
    if (!sheetData.data.items.oddities)
      sheetData.data.items.oddities = items.filter(i => i.type === "oddity").sort(sortFunction);
    if (!sheetData.data.items.weapons)
      sheetData.data.items.weapons = items.filter(i => i.type === "weapon").sort(sortFunction);

    //Make it so that unidentified artifacts and cyphers appear as blank items
    //TODO extract this in the Item class if possible (perhaps as a static method?)
    sheetData.data.items.artifacts = sheetData.data.items.artifacts.map(artifact => {
      if (game.user.isGM) {
        artifact.editable = true;
      } else if (!artifact.data.identified) {
        artifact.name = "Unidentified Artifact";
        artifact.data.level = "Unknown";
        artifact.data.effect = "Unknown";
        artifact.data.depletion = null;
      }
      return artifact;
    });

    sheetData.data.items.cyphers = sheetData.data.items.cyphers.map(cypher => {
      if (game.user.isGM) {
        cypher.editable = true;
      } else if (!cypher.data.identified) {
        cypher.name = "Unidentified Cypher";
        cypher.data.level = "Unknown";
        cypher.data.effect = "Unknown";
      }
      return cypher;
    });

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

    html.find("ul.artifacts").on("click", ".artifact-delete", this.onArtifactDelete.bind(this));
    html.find("ul.cyphers").on("click", ".cypher-delete", this.onCypherDelete.bind(this));

    if (game.user.isGM) {
      html.find("ul.artifacts").on("change", "input", this.onArtifactEdit.bind(this));
      html.find("ul.cyphers").on("change", "input", this.onCypherEdit.bind(this));
    }
    
    html.find("ul.oddities").on("click", ".oddity-delete", this.onOddityDelete.bind(this));

    //Make sure to make a copy of the options object, otherwise only the first call
    //to Dragula seems to work
    const drakes = [];
    drakes.push(dragula([document.querySelector("table.weapons > tbody")], Object.assign({}, dragulaOptions)));

    drakes.push(dragula([document.querySelector("ul.artifacts")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("ul.cyphers")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("ul.oddities")], Object.assign({}, dragulaOptions)));

    //Handle reordering on all these nice draggable elements
    //Assumes they all have a "order" property: should be the case since it's defined in the template.json
    drakes.map(drake => drake.on("drop", this.reorderElements.bind(this)));
  }

  async reorderElements(el, target, source, sibling) {
    const update = [];

    for (let i = 0; i < source.children.length; i++) {
      source.children[i].dataset.order = i;

      //In case we're dealing with plain objects, they won't have an ID
      if (source.children[i].dataset.itemId)
        update.push({_id: source.children[i].dataset.itemId, "data.order": i});
    }

    //updateManyEmbeddedEntities is deprecated now and this function now accepts an array of data
    if (update.length > 0)
      await this.object.updateEmbeddedEntity("OwnedItem", update);
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
    if (event.currentTarget &&
      (
        event.currentTarget.closest(".weapon")
        || event.currentTarget.closest(".artifact")
        || event.currentTarget.closest(".cypher"))
      ) {
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
