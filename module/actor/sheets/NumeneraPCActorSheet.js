import  "../../../lib/dragula/dragula.js";

import { NUMENERA } from "../../config.js";

import { confirmDeletion } from "../../apps/ConfirmationDialog.js";
import { EffortDialog } from "../../apps/EffortDialog.js";
import { RecoveryDialog } from "../../apps/RecoveryDialog.js";

import { NumeneraAbilityItem } from "../../item/NumeneraAbilityItem.js";
import { NumeneraArtifactItem } from "../../item/NumeneraArtifactItem.js";
import { NumeneraArmorItem } from "../../item/NumeneraArmorItem.js";
import { NumeneraCypherItem } from "../../item/NumeneraCypherItem.js";
import { NumeneraEquipmentItem } from "../../item/NumeneraEquipmentItem.js";
import { NumeneraOddityItem } from "../../item/NumeneraOddityItem.js";
import { NumeneraSkillItem } from "../../item/NumeneraSkillItem.js";
import { NumeneraWeaponItem } from "../../item/NumeneraWeaponItem.js";
import { StrangeRecursionItem } from "../../item/StrangeRecursionItem.js";

//Common Dragula options
const dragulaOptions = {
  moves: function (el, container, handle) {
    return handle.classList.contains('handle');
  }
};

//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

// Stolen from https://stackoverflow.com/a/34064434/20043
function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

//Function to remove any HTML markup from eg. item descriptions
function removeHtmlTags(str) {
  // Replace any HTML tag ('<...>') by an empty string
  // and then un-escape any HTML escape codes (eg. &lt;)
  return htmlDecode(str.replace(/<.+?>/gi, ""));
}

/**
 * Higher order function that generates an item creation handler.
 *
 * @param {String} itemType The type of the Item (eg. 'ability', 'cypher', etc.)
 * @param {*} itemClass
 * @param {*} [callback=null]
 * @returns
 */
function onItemCreate(itemType, itemClass, callback = null) {
  return async function(event = null) {
    if (event)
    event.preventDefault();

    const newName = game.i18n.localize(`NUMENERA.item.${itemType}.new${itemType.capitalize()}`);

    const itemData = {
      name: newName,
      type: itemType,
      data: new itemClass({}),
    };

    const newItem = await this.actor.createOwnedItem(itemData);
    if (callback)
      callback(newItem);

    return newItem;
  }
}

function onItemEditGenerator(editClass, callback = null) {
  return async function (event) {
    event.preventDefault();
    event.stopPropagation(); //Important! otherwise we get double rendering

    const elem = event.currentTarget.closest(editClass);

    if (!elem)
      throw new Error(`Missing ${editClass} class element`);
    else if (!elem.dataset.itemId)
      throw new Error(`No itemID on ${editClass} element`);

    const updated = {_id: elem.dataset.itemId};

    const splitName = event.currentTarget.name.split(".");
    const idIndex = splitName.indexOf(updated._id);
    const parts = splitName.splice(idIndex + 1);

    //Add the newly added property to the object
    //This next block is necessary to support properties at various depths
    //e.g support actor.name as well as actor.data.cost.pool

    let previous = updated;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];

      if (i === parts.length - 1) {
        //Last part, the actual property
        if (event.target.type === "checkbox") {
          previous[name] = event.currentTarget.checked;
        } else if (event.target.dataset.dtype === "Boolean") {
          previous[name] = (event.currentTarget.value === "true");
        } else {
          previous[name] = event.currentTarget.value;
        }
      } else {
        previous[name] = {};
        previous = previous[name];
      }
    }

    const updatedItem = await this.actor.updateEmbeddedEntity("OwnedItem", updated);
    if (callback)
      callback(updatedItem);
  }
}

function onItemDeleteGenerator(deleteType, callback = null) {
  return async function (event) {
    event.preventDefault();

    if (await confirmDeletion(deleteType)) {
      const elem = event.currentTarget.closest("." + deleteType);
      const itemId = elem.dataset.itemId;
      const toDelete = this.actor.data.items.find(i => i._id === itemId);
      this.actor.deleteOwnedItem(itemId);

      if (callback)
        callback(toDelete);
    }
  }
}

/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class NumeneraPCActorSheet extends ActorSheet {
  static get inputsToIntercept() {
    return [
      "table.abilities",
      "table.armor",
      "table.equipment",
      "table.skills",
      "table.weapons",
      "ul.cyphers",
      "ul.artifacts",
      "ul.oddities",
      "table.recursion"
    ];
  }

  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [
        "form.numenera table.abilities",
        "form.numenera table.armor",
        "form.numenera table.equipment",
        "form.numenera table.skills",
        "form.numenera table.weapons",
        "form.numenera ul.artifacts",
        "form.numenera ul.cyphers",
        "form.numenera ul.oddities",
        "form.numenera table.recursion"
      ],
      width: 925,
      height: 1000,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "#pc-sheet-body",
        },
      ],
    });
  }

  static get advances() {
    return NUMENERA.advances;
  }

  constructor(...args) {
    super(...args);

    //Creation event handlers
    this.onAbilityCreate = onItemCreate("ability", NumeneraAbilityItem);
    this.onArmorCreate = onItemCreate("armor", NumeneraArmorItem, this.onArmorUpdated.bind(this));
    this.onEquipmentCreate = onItemCreate("equipment", NumeneraEquipmentItem);
    this.onSkillCreate = onItemCreate("skill", NumeneraSkillItem);
    this.onWeaponCreate = onItemCreate("weapon", NumeneraWeaponItem);
    this.onRecursionCreate = onItemCreate("recursion", StrangeRecursionItem);

    //Edit event handlers
    this.onAbilityEdit = onItemEditGenerator(".ability");
    this.onArmorEdit = onItemEditGenerator(".armor", this.onArmorUpdated.bind(this));
    this.onArtifactEdit = onItemEditGenerator(".artifact");
    this.onCypherEdit = onItemEditGenerator(".cypher");
    this.onEquipmentEdit = onItemEditGenerator(".equipment");
    this.onOddityEdit = onItemEditGenerator(".oddity");
    this.onSkillEdit = onItemEditGenerator(".skill");
    this.onWeaponEdit = onItemEditGenerator(".weapon");
    this.onRecursionEdit = onItemEditGenerator(".recursion");

    //Delete event handlers
    this.onAbilityDelete = onItemDeleteGenerator("ability", this.onAbilityDeleted.bind(this));
    this.onArmorDelete = onItemDeleteGenerator("armor", this.onArmorUpdated.bind(this));
    this.onArtifactDelete = onItemDeleteGenerator("artifact");
    this.onCypherDelete = onItemDeleteGenerator("cypher");
    this.onEquipmentDelete = onItemDeleteGenerator("equipment");
    this.onOddityDelete = onItemDeleteGenerator("oddity");
    this.onSkillDelete = onItemDeleteGenerator("skill", this.onSkillDeleted.bind(this));
    this.onWeaponDelete = onItemDeleteGenerator("weapon");
    this.onRecursionDelete = onItemDeleteGenerator("recursion");
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/actor/characterSheet.html";
    }

  /**
   * Provides the data objects provided to the character sheet. Use that method
   * to insert new values or mess with existing ones.
   */
  getData() {
    const sheetData = super.getData();

    const useCypherTypes = (game.settings.get("numenera", "cypherTypesFlavor") !== 1);
    sheetData.displayCypherType = useCypherTypes;

    //Is it The Strange?
    if (game.settings.get("numenera", "characterSheet") == 2) {
      sheetData.isTheStrange = true;
    }

    // Add relevant data from system settings
    sheetData.settings = {
      icons: {}
    };

    //Make sure to use getFocus(), not .focus since there is some important business logic bound to it
    sheetData.data.currentFocus = this.actor.getFocus();

    sheetData.settings.currency = game.settings.get("numenera", "currency");
    sheetData.settings.icons.abilities = game.settings.get("numenera", "showAbilityIcons");
    sheetData.settings.icons.skills = game.settings.get("numenera", "showSkillIcons");
    sheetData.settings.icons.numenera = game.settings.get("numenera", "showNumeneraIcons");
    sheetData.settings.icons.equipment = game.settings.get("numenera", "showEquipmentIcons");

    //Copy labels to be used as is
    sheetData.ranges = NUMENERA.ranges
    sheetData.weaponTypes = NUMENERA.weaponTypes;
    sheetData.weights = NUMENERA.weightClasses;
    sheetData.optionalWeights = NUMENERA.optionalWeightClasses;

    sheetData.stats = {};
    for (const prop in NUMENERA.stats) {
      sheetData.stats[prop] = game.i18n.localize(NUMENERA.stats[prop]);
    }

    if (useCypherTypes)
      sheetData.cypherTypes = NUMENERA.cypherTypes;

    sheetData.advances = Object.entries(sheetData.actor.data.advances).map(
      ([key, value]) => {
        return {
          name: key,
          label: NUMENERA.advances[key],
          isChecked: value,
        };
      }
    );

    sheetData.damageTrackData = NUMENERA.damageTrack;
    sheetData.damageTrackDescription = NUMENERA.damageTrack[sheetData.data.damageTrack].description;

    sheetData.recoveriesData = Object.entries(NUMENERA.recoveries)
    .map(([key, value], idx) => {
      return {
        key,
        label: value,
        checked: !this.actor.data.data.recoveries[idx],
      };
    });

    sheetData.data.items = sheetData.actor.items || {};

    const items = sheetData.data.items;

    Object.entries({
      abilities: NumeneraAbilityItem.type,
      armor: NumeneraArmorItem.type,
      artifacts: NumeneraArtifactItem.type,
      cyphers: NumeneraCypherItem.type,
      equipment: NumeneraEquipmentItem.type,
      oddities: NumeneraOddityItem.type,
      skills: NumeneraSkillItem.type,
      weapons: NumeneraWeaponItem.type,
      recursion: StrangeRecursionItem.type,

    }).forEach(([val, type]) => {
      if (!sheetData.data.items[val])
        sheetData.data.items[val] = items.filter(i => i.type === type).sort(sortFunction)
    });

    //Make it so that unidentified artifacts and cyphers appear as blank items
    //TODO extract this in the Item class if possible (perhaps as a static method?)
    sheetData.data.items.artifacts = sheetData.data.items.artifacts.map(artifact => {
      artifact.editable = game.user.hasRole(game.settings.get("numenera", "cypherArtifactEdition"));

      if (!artifact.data.identified && !artifact.editable) {
        artifact.name = game.i18n.localize("NUMENERA.pc.numenera.artifact.unidentified");
        artifact.data.level = game.i18n.localize("NUMENERA.unknown");
        artifact.data.effect = game.i18n.localize("NUMENERA.unknown");
        artifact.data.depletion = null;
      }
      else {
        artifact.data.effect = removeHtmlTags(artifact.data.effect);
      }

      artifact.showIcon = artifact.img && sheetData.settings.icons.numenera;
      return artifact;
    });

    sheetData.data.items.cyphers = sheetData.data.items.cyphers.map(cypher => {
      cypher.editable = game.user.hasRole(game.settings.get("numenera", "cypherArtifactEdition"));

      if (!cypher.data.identified && !cypher.editable) {
        cypher.name = game.i18n.localize("NUMENERA.pc.numenera.cypher.unidentified");
        cypher.data.level = game.i18n.localize("NUMENERA.unknown");
        cypher.data.effect = game.i18n.localize("NUMENERA.unknown");

        if (useCypherTypes) {
          cypher.data.cypherType = game.i18n.localize("NUMENERA.unknown");
        }
      }
      else {
        cypher.data.effect = removeHtmlTags(cypher.data.effect);
      }

      cypher.showIcon = cypher.img && sheetData.settings.icons.numenera;
      return cypher;
    });

    sheetData.data.items.oddities = sheetData.data.items.oddities.map(oddity => {
      oddity.editable = game.user.hasRole(game.settings.get("numenera", "cypherArtifactEdition"));
      oddity.showIcon = oddity.img && sheetData.settings.icons.numenera;
      oddity.data.notes = removeHtmlTags(oddity.data.notes);
      return oddity;
    });

    sheetData.displayCypherLimitWarning = this.actor.isOverCypherLimit();

    sheetData.data.items.abilities = sheetData.data.items.abilities.map(ability => {
      ability.nocost = (ability.data.cost.amount <= 0);
      ability.ranges = NUMENERA.optionalRanges;
      ability.stats = NUMENERA.stats;
      ability.showIcon = ability.img && sheetData.settings.icons.abilities;
      ability.data.notes = removeHtmlTags(ability.data.notes);
      return ability;
    });

    sheetData.data.items.skills = sheetData.data.items.skills.map(skill => {
      skill.stats = NUMENERA.stats;
      skill.showIcon = skill.img && sheetData.settings.icons.skills;
      skill.untrained = skill.data.skillLevel == 0;
      skill.trained = skill.data.skillLevel == 1;
      skill.specialized = skill.data.skillLevel == 2;
      return skill;
    });

    sheetData.data.items.weapons = sheetData.data.items.weapons.map(weapon => {
      weapon.showIcon = weapon.img && sheetData.settings.icons.equipment;
      weapon.data.notes = removeHtmlTags(weapon.data.notes);
      return weapon;
    });
    sheetData.data.items.armor = sheetData.data.items.armor.map(armor => {
      armor.showIcon = armor.img && sheetData.settings.icons.equipment;
      armor.data.notes = removeHtmlTags(armor.data.notes);
      return armor;
    });
    sheetData.data.items.equipment = sheetData.data.items.equipment.map(equipment => {
      equipment.showIcon = equipment.img && sheetData.settings.icons.equipment;
      equipment.data.notes = removeHtmlTags(equipment.data.notes);
      return equipment;
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

    html.find("input.focus").on("change", this.actor.setFocusFromEvent.bind(this.actor));

    html.find("div.stats").on("click", "a.rollable", this.onAttributeUse.bind(this));

    const abilitiesTable = html.find("table.abilities");
    abilitiesTable.on("click", ".ability-create", this.onAbilityCreate.bind(this));
    abilitiesTable.on("click", ".ability-delete", this.onAbilityDelete.bind(this));
    abilitiesTable.on("blur", "input,select,textarea", this.onAbilityEdit.bind(this));
    abilitiesTable.on("click", "a.rollable", this.onAbilityUse.bind(this));

    const armorTable = html.find("table.armor");
    armorTable.on("click", ".armor-create", this.onArmorCreate.bind(this));
    armorTable.on("click", ".armor-delete", this.onArmorDelete.bind(this));
    armorTable.on("blur", "input,select", this.onArmorEdit.bind(this));

    const equipmentTable = html.find("table.equipment");
    equipmentTable.on("click", ".equipment-create", this.onEquipmentCreate.bind(this));
    equipmentTable.on("click", ".equipment-delete", this.onEquipmentDelete.bind(this));
    equipmentTable.on("blur", "input,select", this.onEquipmentEdit.bind(this));

    const skillsTable = html.find("table.skills");
    skillsTable.on("click", ".skill-create", this.onSkillCreate.bind(this));
    skillsTable.on("click", ".skill-delete", this.onSkillDelete.bind(this));
    skillsTable.on("change", "input,select", this.onSkillEdit.bind(this));
    skillsTable.on("click", "a.rollable", this.onSkillUse.bind(this));

    const weaponsTable = html.find("table.weapons");
    weaponsTable.on("click", ".weapon-create", this.onWeaponCreate.bind(this));
    weaponsTable.on("click", ".weapon-delete", this.onWeaponDelete.bind(this));
    weaponsTable.on("blur", "input,select", this.onWeaponEdit.bind(this));
    weaponsTable.on("click", "a.rollable", this.onWeaponUse.bind(this));

    const odditiesTable = html.find("ul.oddities");
    odditiesTable.on("click", ".oddity-delete", this.onOddityDelete.bind(this));

    const artifactsList = html.find("ul.artifacts");
    html.find("ul.artifacts").on("click", ".artifact-delete", this.onArtifactDelete.bind(this));
    html.find("ul.artifacts").on("click", ".artifact-depletion-roll", this.onArtifactDepletionRoll.bind(this));

    const cyphersList = html.find("ul.cyphers");
    html.find("ul.cyphers").on("click", ".cypher-delete", this.onCypherDelete.bind(this));

    const recursionTable = html.find("table.recursion");
    recursionTable.on("blur", "input,select,textarea", this.onRecursionEdit.bind(this));
    recursionTable.on("click", ".recursion-delete", this.onRecursionDelete.bind(this));

    if (game.user.isGM) {
      artifactsList.on("blur", "input,textarea", this.onArtifactEdit.bind(this));
      cyphersList.on("blur", "input,textarea", this.onCypherEdit.bind(this));
      odditiesTable.on("blur", "input", this.onOddityEdit.bind(this));
    }

    html.find("#recoveryRoll").on("click", this.onRecoveryRoll.bind(this));

    //Make sure to make a copy of the options object, otherwise only the first call
    //to Dragula seems to work
    const drakes = [];
    drakes.push(dragula([document.querySelector("table.abilities > tbody")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("table.armor > tbody")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("table.equipment > tbody")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("table.skills > tbody")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("table.weapons > tbody")], Object.assign({}, dragulaOptions)));

    drakes.push(dragula([document.querySelector("ul.artifacts")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("ul.cyphers")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("ul.oddities")], Object.assign({}, dragulaOptions)));

    //Handle reordering on all these nice draggable elements
    //Assumes they all have a "order" property: should be the case since it's defined in the template.json
    drakes.map(drake => drake.on("drop", this.reorderElements.bind(this)));

    if (this.actor.owner) {
      const handler = ev => this._onDragItemStart(ev);

      // Find all abilitiy items on the character sheet.
      html.find('tr.ability,tr.skill,tr.weapon,tr.recursion').each((i, tr) => {
        // Add draggable attribute and dragstart listener.
        tr.setAttribute("draggable", true);
        tr.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onDragItemStart(event) {
    const itemId = event.currentTarget.dataset.itemId;

    const clickedItem = duplicate(
      this.actor.getEmbeddedEntity("OwnedItem", itemId)
    );
    clickedItem.data.stored = "";

    const item = clickedItem;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        actorId: this.actor.id,
        data: item,
      })
    );

    return super._onDragItemStart(event);
  }

  async reorderElements(el, target, source, sibling) {
    const update = [];

    for (let i = 0; i < source.children.length; i++) {
      source.children[i].dataset.order = i;

      //In case we're dealing with plain objects, they won't have an ID
      if (source.children[i].dataset.itemId)
        update.push({_id: source.children[i].dataset.itemId, "data.order": i});
    }

    if (update.length > 0)
      await this.object.updateEmbeddedEntity("OwnedItem", update);
  }

  /**
   * Called when clicking on a "Roll" button next to an attribute
   *
   * @param {*} event
   * @returns
   * @memberof NumeneraPCActorSheet
   */
  onAttributeUse(event) {
    event.preventDefault();
    let stat = event.target.closest(".stats").dataset.stat;

    if (event.ctrlKey || event.metaKey) {
      stat = stat.toLowerCase();
      new EffortDialog(this.actor, { stat }).render(true);
    }
    else {
      return this.actor.rollAttribute(stat);
    }
  }

  onSkillUse(event) {
    event.preventDefault();
    const skillId = event.target.closest(".skill").dataset.itemId;

    //TODO use the use() method of NumeneraSkillItem, do the same for other Item types

    if (event.ctrlKey || event.metaKey) {
      new EffortDialog(this.actor, {skill: this.actor.getOwnedItem(skillId)}).render(true);
    }
    else {
      return this.actor.rollSkillById(skillId);
    }
  }

  async onWeaponUse(event) {
    event.preventDefault();

    const weaponId = event.target.closest(".weapon").dataset.itemId;
    if (!weaponId)
      return;

    const weapon = await this.actor.getOwnedItem(weaponId);
    const weight = game.i18n.localize(weapon.data.data.weight);
    const weaponType = game.i18n.localize(weapon.data.data.weaponType);
    const skillName = `${weight} ${weaponType}`;

    //Get related skill, if any
    const skillId = this.actor.data.items.find(i => i.name.toLowerCase() === skillName.toLowerCase());
    let skill;

    if (skillId) {
      skill = await this.actor.getOwnedItem(skillId._id);
    }

    if (!skill) {
      //No appropriate skill? Create a fake one, just to ensure a nice chat output
      skill = new NumeneraSkillItem();
      skill.data.name = skillName;
    }

    if (event.ctrlKey || event.metaKey) {
      new EffortDialog(this.actor, { skill }).render(true);
    }
    else {
      this.actor.rollSkill(skill);
    }
  }

  /**
   * Triggered whenever the use click the "Roll" button on an Ability.
   *
   * @param {Event} event
   * @memberof NumeneraPCActorSheet
   */
  async onAbilityUse(event) {
    event.preventDefault();
    const abilityId = event.target.closest(".ability").dataset.itemId;

    if (!abilityId)
      return;

    //TODO use the use() method of NumeneraSkillItem, do the same for other Item types

    if (event.ctrlKey || event.metaKey) {
      new EffortDialog(this.actor, {ability: this.actor.getOwnedItem(abilityId)}).render(true);
    }
    else {
      await this.actor.useAbilityById(abilityId);
    }
  }

  onArtifactDepletionRoll(event) {
    event.preventDefault();
    const artifactId = event.target.closest(".artifact").dataset.itemId;

    if (!artifactId)
      return;

    //TODO move to the Artifact item class
    const artifact = this.actor.getOwnedItem(artifactId);
    const depletion = artifact.data.data.depletion;
    if (!depletion.isDepleting || !depletion.die || !depletion.threshold)
      return;

    const roll = new Roll(depletion.die).roll();

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Depletion roll for ${artifact.name}<br/>${game.i18n.localize("NUMENERA.item.artifact.depletionThreshold")}: ${depletion.threshold}`,
    });
  }

  async onArmorUpdated() {
    const newTotal = this.actor.getTotalArmor();

    if (newTotal !== this.actor.data.armor) {
      await this.actor.update({"data.armor": newTotal});
      this.render();
    }
  }

  onAbilityDeleted(ability) {
    if (
      ability &&
      this.actor.data.items.find(i => i.type === "skill" &&
      i.data.relatedAbilityId === ability._id)
    )
      ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.skillWithSameNameExists"));
  }

  onSkillDeleted(skill) {
    if (
      skill &&
      skill.data.relatedAbilityId &&
      this.actor.data.items.find(i => i._id === skill.data.relatedAbilityId)
    )
      ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.abilityWithSameNameExists"));
  }

  onRecoveryRoll(event) {
    event.preventDefault();
    new RecoveryDialog(this.actor).render(true);
  }

  /*
  Override the base method to handle some of the values ourselves
  */
  _onChangeInput(event) {
    for (let container of NumeneraPCActorSheet.inputsToIntercept) {
      const element = window.document.querySelector(container);
      if (element && element.contains(event.target))
        return;
    }

    super._onChangeInput(event);
  }

  _onDrop(event) {
    super._onDrop(event);

    const {type, id} = JSON.parse(event.dataTransfer.getData("text/plain"));

    if (type !== "Item")
      return;

    const item = Item.collection.entities.find(i => i._id == id)

    //To avoid "false drops"
    if (!item)
      return;

    switch (item.data.type) {
      case "armor":
        //Necessary because dropping a new armor from the directory would not update the Armor field
        this.onArmorUpdated();
        return;
    }
  }
}
