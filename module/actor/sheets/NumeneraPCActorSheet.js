import { confirmDeletion } from "../../apps/ConfirmationDialog.js";
import { NUMENERA } from "../../config.js";
import { NumeneraAbilityItem } from "../../item/NumeneraAbilityItem.js";
import { NumeneraArmorItem } from "../../item/NumeneraArmorItem.js";
import { NumeneraEquipmentItem } from "../../item/NumeneraEquipmentItem.js";
import { NumeneraSkillItem } from "../../item/NumeneraSkillItem.js";
import { NumeneraWeaponItem } from "../../item/NumeneraWeaponItem.js";

import  "../../../lib/dragula/dragula.js";
import { RecoveryDialog } from "../../apps/RecoveryDialog.js";

//Common Dragula options
const dragulaOptions = {
  moves: function (el, container, handle) {
    return handle.classList.contains('handle');
  }
};

//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

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

    const newName = game.i18n.localize(`NUMENERA.item.${itemType}s.new${itemType.capitalize()}`);

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

    //Edit event handlers
    this.onAbilityEdit = onItemEditGenerator(".ability");
    this.onArmorEdit = onItemEditGenerator(".armor", this.onArmorUpdated.bind(this));
    this.onArtifactEdit = onItemEditGenerator(".artifact");
    this.onCypherEdit = onItemEditGenerator(".cypher");
    this.onEquipmentEdit = onItemEditGenerator(".equipment");
    this.onSkillEdit = onItemEditGenerator(".skill");
    this.onWeaponEdit = onItemEditGenerator(".weapon");

    //Delete event handlers
    this.onAbilityDelete = onItemDeleteGenerator("ability", this.onAbilityDeleted.bind(this));
    this.onArmorDelete = onItemDeleteGenerator("armor", this.onArmorUpdated.bind(this));
    this.onArtifactDelete = onItemDeleteGenerator("artifact");
    this.onCypherDelete = onItemDeleteGenerator("cypher");
    this.onEquipmentDelete = onItemDeleteGenerator("equipment");
    this.onOddityDelete = onItemDeleteGenerator("oddity");
    this.onSkillDelete = onItemDeleteGenerator("skill", this.onSkillDeleted.bind(this));
    this.onWeaponDelete = onItemDeleteGenerator("weapon");
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

    const useCypherTypes = (game.settings.get("numenera", "systemVersion") === 1);
    sheetData.displayCypherType = useCypherTypes;

    // Add relevant data from system settings
    sheetData.settings = {
      icons: {}
    };

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
        checked: 4 - this.actor.data.data.recoveriesLeft > idx
      };
    });

    sheetData.data.items = sheetData.actor.items || {};

    //TODO repetition! kill it FOR GREAT JUSTICE
    //TODO use ItemClass.getType()
    const items = sheetData.data.items;
    if (!sheetData.data.items.abilities)
      sheetData.data.items.abilities = items.filter(i => i.type === "ability").sort(sortFunction);
    if (!sheetData.data.items.armor)
      sheetData.data.items.armor = items.filter(i => i.type === "armor").sort(sortFunction);
    if (!sheetData.data.items.artifacts)
      sheetData.data.items.artifacts = items.filter(i => i.type === "artifact").sort(sortFunction);
    if (!sheetData.data.items.cyphers)
      sheetData.data.items.cyphers = items.filter(i => i.type === "cypher").sort(sortFunction);
    if (!sheetData.data.items.equipment)
      sheetData.data.items.equipment = items.filter(i => i.type === "equipment").sort(sortFunction);
    if (!sheetData.data.items.oddities)
      sheetData.data.items.oddities = items.filter(i => i.type === "oddity").sort(sortFunction);
    if (!sheetData.data.items.skills)
      sheetData.data.items.skills = items.filter(i => i.type === "skill").sort(sortFunction);
    if (!sheetData.data.items.weapons)
      sheetData.data.items.weapons = items.filter(i => i.type === "weapon").sort(sortFunction);

    //Make it so that unidentified artifacts and cyphers appear as blank items
    //TODO extract this in the Item class if possible (perhaps as a static method?)
    sheetData.data.items.artifacts = sheetData.data.items.artifacts.map(artifact => {
      if (game.user.isGM) {
        artifact.editable = true;
      } else if (!artifact.data.identified) {
        artifact.name = game.i18n.localize("NUMENERA.pc.numenera.artifact.unidentified");
        artifact.data.level = game.i18n.localize("NUMENERA.unknown");
        artifact.data.effect = game.i18n.localize("NUMENERA.unknown");
        artifact.data.depletion = null;
      }
      artifact.showIcon = artifact.img && sheetData.settings.icons.numenera;
      return artifact;
    });

    sheetData.data.items.cyphers = sheetData.data.items.cyphers.map(cypher => {
      if (game.user.isGM) {
        cypher.editable = true;
      } else if (!cypher.data.identified) {
        cypher.name = game.i18n.localize("NUMENERA.pc.numenera.cypher.unidentified");
        cypher.data.level = game.i18n.localize("NUMENERA.unknown");
        cypher.data.effect = game.i18n.localize("NUMENERA.unknown");

        if (useCypherTypes) {
          cypher.data.cypherType = game.i18n.localize("NUMENERA.unknown");
        }
      }

      cypher.showIcon = cypher.img && sheetData.settings.icons.numenera;
      return cypher;
    });

    sheetData.data.items.oddities = sheetData.data.items.oddities.map(oddity => {
      oddity.showIcon = oddity.img && sheetData.settings.icons.numenera;
      return oddity;
    });

    sheetData.displayCypherLimitWarning = this.actor.isOverCypherLimit();

    sheetData.data.items.abilities = sheetData.data.items.abilities.map(ability => {
      ability.nocost = (ability.data.cost.amount <= 0);
      ability.ranges = NUMENERA.optionalRanges;
      ability.stats = NUMENERA.stats;
      ability.showIcon = ability.img && sheetData.settings.icons.abilities;
      return ability;
    });

    sheetData.data.items.skills = sheetData.data.items.skills.map(skill => {
      skill.stats = NUMENERA.stats;
      skill.showIcon = skill.img && sheetData.settings.icons.skills;
      skill.untrained = skill.skillLevel === 0;
      skill.trained = skill.skillLevel === 1;
      skill.specialized = skill.skillLevel === 2;
      return skill;
    });

    sheetData.data.items.weapons = sheetData.data.items.weapons.map(weapon => {
      weapon.showIcon = weapon.img && sheetData.settings.icons.equipment;
      return weapon;
    });
    sheetData.data.items.armor = sheetData.data.items.armor.map(armor => {
      armor.showIcon = armor.img && sheetData.settings.icons.equipment;
      return armor;
    });
    sheetData.data.items.equipment = sheetData.data.items.equipment.map(equipment => {
      equipment.showIcon = equipment.img && sheetData.settings.icons.equipment;
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

    html.find("ul.oddities").on("click", ".oddity-delete", this.onOddityDelete.bind(this));

    const artifactsList = html.find("ul.artifacts");
    html.find("ul.artifacts").on("click", ".artifact-delete", this.onArtifactDelete.bind(this));
    html.find("ul.artifacts").on("click", ".artifact-depletion-roll", this.onArtifactDepletionRoll.bind(this));

    const cyphersList = html.find("ul.cyphers");
    html.find("ul.cyphers").on("click", ".cypher-delete", this.onCypherDelete.bind(this));

    if (game.user.isGM) {
      artifactsList.on("blur", "input", this.onArtifactEdit.bind(this));
      cyphersList.on("blur", "input,select", this.onCypherEdit.bind(this));
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

  onSkillUse(event) {
    event.preventDefault();
    const skillId = event.target.closest(".skill").dataset.itemId;

    return this.actor.rollSkill(skillId);
  }

  onAbilityUse(event) {
    event.preventDefault();
    const abilityId = event.target.closest(".ability").dataset.itemId;
  
    if (!abilityId)
      return;

    //Get related skill
    const skill = this.actor.data.items.find(i => i.data.relatedAbilityId === abilityId);
    if (!skill) {
      ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.noSkillRelatedToAbility"));
      return;
    }

    return this.actor.rollSkill(skill._id);
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
    //TODO is this still relevant?
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

    switch (item.data.type) {
      case "armor":
        //Necessary because dropping a new armor from the directory would not update the Armor field
        this.onArmorUpdated();
        return;
    }
  }
}
