import { onItemCreateGenerator, onItemDeleteGenerator, onItemEditGenerator, sortFunction } from "./sheetUtils.js";

import { NUMENERA } from "../../config.js";

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
import { NumeneraPowerShiftItem } from "../../item/NumeneraPowerShiftItem.js";
import { removeHtmlTags, useAlternateButtonBehavior } from "../../utils.js";

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
      "table.recursion",
      "table.powerShifts",
    ];
  }

  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [
        "#pc-sheet-body",
      ],
      width: 885,
      height: 870,
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
    this.onAbilityCreate = onItemCreateGenerator("ability", NumeneraAbilityItem);
    this.onArmorCreate = onItemCreateGenerator("armor", NumeneraArmorItem, this.onArmorUpdated.bind(this));
    this.onEquipmentCreate = onItemCreateGenerator("equipment", NumeneraEquipmentItem);
    this.onSkillCreate = onItemCreateGenerator("skill", NumeneraSkillItem);
    this.onPowerShiftCreate = onItemCreateGenerator("powerShift", NumeneraPowerShiftItem, this.onPowerShiftUpdated.bind(this));
    this.onRecursionCreate = onItemCreateGenerator("recursion", StrangeRecursionItem);
    this.onWeaponCreate = onItemCreateGenerator("weapon", NumeneraWeaponItem);

    //Edit event handlers
    this.onAbilityEdit = onItemEditGenerator(".ability");
    this.onArmorEdit = onItemEditGenerator(".armor", this.onArmorUpdated.bind(this));
    this.onArtifactEdit = onItemEditGenerator(".artifact");
    this.onCypherEdit = onItemEditGenerator(".cypher");
    this.onEquipmentEdit = onItemEditGenerator(".equipment");
    this.onOddityEdit = onItemEditGenerator(".oddity");
    this.onPowerShiftEdit = onItemEditGenerator(".powerShift", this.onPowerShiftUpdated.bind(this));
    this.onRecursionEdit = onItemEditGenerator(".recursion");
    this.onSkillEdit = onItemEditGenerator(".skill");
    this.onWeaponEdit = onItemEditGenerator(".weapon");

    //Delete event handlers
    this.onAbilityDelete = onItemDeleteGenerator("ability", this.onAbilityDeleted.bind(this));
    this.onArmorDelete = onItemDeleteGenerator("armor", this.onArmorUpdated.bind(this));
    this.onArtifactDelete = onItemDeleteGenerator("artifact");
    this.onCypherDelete = onItemDeleteGenerator("cypher");
    this.onEquipmentDelete = onItemDeleteGenerator("equipment");
    this.onOddityDelete = onItemDeleteGenerator("oddity");
    this.onPowerShiftDelete = onItemDeleteGenerator("powerShift", this.onPowerShiftUpdated.bind(this));
    this.onRecursionDelete = onItemDeleteGenerator("recursion");
    this.onSkillDelete = onItemDeleteGenerator("skill", this.onSkillDeleted.bind(this));
    this.onWeaponDelete = onItemDeleteGenerator("weapon", this.onWeaponDeleted.bind(this));
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

    this._setLabelsData(sheetData);
    this._setCypherTypeData(sheetData);
    this._setIconSettingsData(sheetData);
    this._setComputedValuesData(sheetData);
    this._setItemsData(sheetData);

    return sheetData;
  }

  /**
   * Processes Item-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setItemsData(sheetData) {
    sheetData.data.items = sheetData.actor.items || {};

    const itemClassMap = {
      abilities: NumeneraAbilityItem.type,
      armor: NumeneraArmorItem.type,
      artifacts: NumeneraArtifactItem.type,
      cyphers: NumeneraCypherItem.type,
      equipment: NumeneraEquipmentItem.type,
      oddities: NumeneraOddityItem.type,
      powerShifts: NumeneraPowerShiftItem.type,
      recursion: StrangeRecursionItem.type,
      skills: NumeneraSkillItem.type,
      weapons: NumeneraWeaponItem.type,
    };

    Object.entries(itemClassMap).forEach(([val, type]) => {
      if (!sheetData.data.items[val])
        sheetData.data.items[val] = sheetData.data.items.filter(i => i.type === type).sort(sortFunction)
    });

    this._setCyphersData(sheetData, sheetData.displayCypherType);
    this._setFeaturesData(sheetData);
    this._setEquipmentData(sheetData);
    this._setAbilitiesData(sheetData);
    this._setSkillsData(sheetData);
  }

  /**
   * Processes label-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setLabelsData(sheetData) {
    sheetData.ranges = NUMENERA.ranges
    sheetData.weaponTypes = NUMENERA.weaponTypes;
    sheetData.weights = NUMENERA.weightClasses;
    sheetData.optionalWeights = NUMENERA.optionalWeightClasses;
  }

  /**
   * Processes icon settings-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setIconSettingsData(sheetData) {
    sheetData.settings = {
      icons: {}
    };

    //Icon display settings
    sheetData.settings.icons.abilities = game.settings.get("numenera", "showAbilityIcons");
    sheetData.settings.icons.equipment = game.settings.get("numenera", "showEquipmentIcons");
    sheetData.settings.icons.numenera = game.settings.get("numenera", "showCypherIcons");
    sheetData.settings.icons.powerShifts = game.settings.get("numenera", "showPowerShiftIcons");
    sheetData.settings.icons.skills = game.settings.get("numenera", "showSkillIcons");
  }

  /**
   * Processes cypher type-related data for _setItemsData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setCypherTypeData(sheetData) {
    const flavor = NumeneraCypherItem.cypherTypeFlavor;
    
    sheetData.displayCypherType = !!flavor;
    if (sheetData.displayCypherType)
      sheetData.cypherTypes = NUMENERA.cypherTypes[flavor];
  }

  /**
   * Processes cypher type-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setComputedValuesData(sheetData) {
    //Make sure to use getFocus(), not .focus since there is some important business logic bound to it
    sheetData.data.currentFocus = this.actor.getFocus();

    sheetData.settings.currency = game.settings.get("numenera", "currency");

    sheetData.stats = {};
    for (const prop in NUMENERA.stats) {
      sheetData.stats[prop] = game.i18n.localize(NUMENERA.stats[prop]);
    }

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

    sheetData.displayMightCostPerHour = game.settings.get("numenera", "armorPenalty") === "old";
    sheetData.armorMightCostPerHour = this.actor.mightCostPerHour;

    sheetData.displaySpeedPoolReduction = game.settings.get("numenera", "armorPenalty") === "old";
    sheetData.armorSpeedPoolReduction = this.actor.speedPoolPenalty;

    sheetData.displaySpeedEffortPenalty = ["none", "new"].some(s => s === game.settings.get("numenera", "armorPenalty"));

    if (sheetData.displaySpeedEffortPenalty) {
      if (game.settings.get("numenera", "armorPenalty") === "new") {
        sheetData.saveSpeedEffortPenalty = false;
        sheetData.speedEffortPenalty = this.actor.extraSpeedEffortCost;
      }
      else {
        sheetData.saveSpeedEffortPenalty = true;
        sheetData.speedEffortPenalty = this.actor.data.data.armorPenalty;
      }
    }
    
    const recoveriesLabels = Object.entries(NUMENERA.recoveries);
    sheetData.recoveriesData = this.actor.data.data.recoveries
      .map((recovery, index) => {
        const recoveryIndex = Math.max(0, index - (this.actor.data.data.recoveries.length - NUMENERA.totalRecoveries));
        const [key, label] = recoveriesLabels[recoveryIndex];
        return {
          key,
          label,
          checked: !recovery,
        };
      }
    );
  }

  /**
   * Processes feature-related data (eg. recursions, power shifts, etc.) for getData().
   * If you're calling this from another function, please consider reviewing your life's
   * priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setFeaturesData(sheetData) {
    sheetData.featuresUsed = [];
    sheetData.featureSectionNames = [];

    //RECURSIONS
    if (game.settings.get("numenera", "useRecursions")) {
      sheetData.isTheStrange = true;
      sheetData.featuresUsed.push({
        key: "recursions",
        label: NUMENERA.tabbedFeatures.recursions,
      });
      sheetData.featureSectionNames.push("NUMENERA.pcActorSheet.tab.recursion");
    }

    //ODDITIES
    sheetData.useOddities = game.settings.get("numenera", "useOddities");
    if (sheetData.useOddities) {
      sheetData.data.items.oddities = sheetData.data.items.oddities.map(oddity => {
        oddity.editable = game.user.hasRole(game.settings.get("numenera", "cypherArtifactEdition"));
        oddity.showIcon = oddity.img && sheetData.settings.icons.numenera;
        oddity.data.notes = removeHtmlTags(oddity.data.notes);
        return oddity;
      });
    }

    //POWER SHIFTS
    if (game.settings.get("numenera", "usePowerShifts")) {
      sheetData.usePowerShifts = true;
      sheetData.featuresUsed.push({
        key: "powerShifts",
        label: NUMENERA.tabbedFeatures.powerShifts,
      });
      sheetData.featureSectionNames.push("NUMENERA.pcActorSheet.features.powerShifts.title");
      sheetData.powerShiftEffects = NUMENERA.powerShiftEffects;
    }

    if (sheetData.usePowerShifts) {
      sheetData.data.items.powerShifts = sheetData.data.items.powerShifts.map(powerShift => {
        powerShift.showIcon = powerShift.img && sheetData.settings.icons.powerShifts;
        powerShift.data.notes = removeHtmlTags(powerShift.data.notes);
        return powerShift;
      });
    }

    //This section MUST be the last one in _setFeaturesData
    sheetData.showFeaturesTab = sheetData.featuresUsed.length > 0;
    sheetData.showMultipleFeatures = sheetData.featuresUsed.length > 1;

    if (sheetData.featuresUsed.length === 1) {
      sheetData.featuresTabName = game.i18n.localize(sheetData.featureSectionNames[0]);
      sheetData.selectedFeature = sheetData.featuresUsed[0].key;
    }
    else if (sheetData.featuresUsed.length > 1) {
      sheetData.featuresTabName = game.i18n.localize("NUMENERA.pcActorSheet.tab.features");
      sheetData.selectedFeature = sheetData.featuresUsed[0].key;
    }

    if (this.selectedFeature) {
      sheetData.selectedFeature = this.selectedFeature;
    }
  }

  /**
   * Processes cypher- and artifact-related data for getData(). If you're calling this
   * from another function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setCyphersData(sheetData, useCypherType) {
    sheetData.data.items.artifacts = sheetData.data.items.artifacts.map(artifact => {
      artifact.editable = game.user.hasRole(game.settings.get("numenera", "cypherArtifactEdition"));

      if (!artifact.data.identified && !artifact.editable) {
        //Make it so that unidentified artifacts appear as blank items
        artifact = NumeneraArtifactItem.asUnidentified(artifact);
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
        //Make it so that unidentified cyphers appear as blank items
        cypher = NumeneraCypherItem.asUnidentified(cypher);
      }
      else {
        cypher.data.effect = removeHtmlTags(cypher.data.effect);
      }

      if (useCypherType && cypher.data.identified && !cypher.data.cypherType) {
        //Use the very first object key as property since none has been defined yet
        cypher.data.cypherType = Object.keys(NUMENERA.cypherTypes[cypherTypeFlavor]);
      }

      cypher.showIcon = cypher.img && sheetData.settings.icons.numenera;
      return cypher;
    });

    sheetData.displayCypherLimitWarning = this.actor.isOverCypherLimit();
  }

  /**
   * Processes equipment-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setEquipmentData(sheetData) {
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
  }

  /**
   * Processes ability-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setAbilitiesData(sheetData) {
    if (game.settings.get("numenera", "useSpells"))
      sheetData.abilityTypes = NUMENERA.abilityTypesWithSpells;
    else
      sheetData.abilityTypes = NUMENERA.abilityTypes;

    sheetData.data.items.abilities = sheetData.data.items.abilities.map(ability => {
      ability.nocost = (ability.data.cost.amount <= 0);
      ability.ranges = NUMENERA.optionalRanges;
      ability.stats = NUMENERA.stats;
      ability.showIcon = ability.img && sheetData.settings.icons.abilities;
      ability.data.notes = removeHtmlTags(ability.data.notes);
      return ability;
    });
  }

  /**
   * Processes skill-related data for getData(). If you're calling this from another
   * function, please consider reviewing your life's priorities.
   *
   * @param {*} sheetData
   * @memberof NumeneraPCActorSheet
   */
  _setSkillsData(sheetData) {
    sheetData.data.items.skills = sheetData.data.items.skills.map(skill => {
      skill.stats = NUMENERA.stats;
      skill.showIcon = skill.img && sheetData.settings.icons.skills;
      skill.untrained = skill.data.skillLevel == 0;
      skill.trained = skill.data.skillLevel == 1;
      skill.specialized = skill.data.skillLevel == 2;
      return skill;
    });
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

    if (game.settings.get("numenera", "useOddities")) {
      html.find("ul.oddities").on("click", ".oddity-delete", this.onOddityDelete.bind(this));
    }

    const artifactsList = html.find("ul.artifacts");
    html.find("ul.artifacts").on("click", ".artifact-delete", this.onArtifactDelete.bind(this));
    html.find("ul.artifacts").on("click", ".artifact-depletion-roll", this.onArtifactDepletionRoll.bind(this));

    const cyphersList = html.find("ul.cyphers");
    html.find("ul.cyphers").on("click", ".cypher-delete", this.onCypherDelete.bind(this));

    if (game.settings.get("numenera", "usePowerShifts")) {
      const powerShiftsTable = html.find("table.powerShifts");
      powerShiftsTable.on("click", ".powerShift-create", this.onPowerShiftCreate.bind(this));
      powerShiftsTable.on("click", ".powerShift-delete", this.onPowerShiftDelete.bind(this));
      powerShiftsTable.on("blur", "input,select", this.onPowerShiftEdit.bind(this));
    }

    if (game.settings.get("numenera", "useRecursions")) {
      const recursionTable = html.find("table.recursion");
      recursionTable.on("blur", "input,select,textarea", this.onRecursionEdit.bind(this));
      recursionTable.on("click", ".recursion-delete", this.onRecursionDelete.bind(this));
    }

    if (game.user.isGM) {
      artifactsList.on("blur", "input,textarea", this.onArtifactEdit.bind(this));
      cyphersList.on("blur", "input,textarea", this.onCypherEdit.bind(this));

      if (game.settings.get("numenera", "useOddities"))
        html.find("ul.oddities").on("blur", "input", this.onOddityEdit.bind(this));
    }

    html.find("#recoveryRoll").on("click", this.onRecoveryRoll.bind(this));

    if (this.actor.owner) {
      // Find all abilitiy, skill, weapon and recursion items on the character sheet.
      html.find('tr.ability,tr.skill,tr.weapon,tr.recursion,tr.equipment,tr.armor,tr.powerShift,li.cypher,li.artifact,li.oddity,li.recursion').each((i, elem) => {
        // Add draggable attribute and dragstart listener.
        elem.setAttribute("draggable", true);
        elem.addEventListener("dragstart", ev => this._onDragStart(ev), false);
      });
    }
  }

  _onDrop(event) {
    super._onDrop(event);
    this.reorderElements(event);
  }

  _onDragStart(event) {
    const itemId = event.target.dataset.itemId;
    
    if (!itemId) return;

    const clickedItem = duplicate(
      this.actor.getEmbeddedEntity("OwnedItem", itemId)
    );
    clickedItem.data.stored = "";

    const item = clickedItem;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        itemId,
        actorId: this.actor.id,
        data: item,
      })
    );

    return super._onDragStart(event);
  }

  async reorderElements(event) {
    const dragged = JSON.parse(event.dataTransfer.getData("text/plain"));
    const container = event.target.closest(".row-container");

    if (!container || !("children" in container))
      return;

    const children = [...container.children];

    const draggedRowIndex = children.findIndex(row => row.dataset.itemId == dragged.id);
    const dragTargetIndex = children.findIndex(row => row.dataset.itemId == event.target.closest("tr").dataset.itemId);

    const update = children.map((row, i) => {
      return {
        _id: row.dataset.itemId,
      };
    });

    const deleted = update.splice(draggedRowIndex, 1);
    update.splice(dragTargetIndex, 0, deleted[0]);

    for (let i = 0; i < update.length; i++) {
      update[i]["data.order"] = i;

      const row = children.find(row => row.dataset.itemId == update[i]._id);
      row.dataset.order = i;
    }

    if (update.length > 0)
      await this.actor.updateEmbeddedEntity("OwnedItem", update);
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

    if (useAlternateButtonBehavior()) {
      stat = stat.toLowerCase();
      new EffortDialog(this.actor, { stat }).render(true);
    }
    else {
      return this.actor.rollAttribute(stat);
    }
  }

  /**
   * Called when clicking on a "Roll" button next to a skill.
   *
   * @param {Event} event
   * @memberof NumeneraPCActorSheet
   */
  onSkillUse(event) {
    event.preventDefault();

    const skillId = event.target.closest(".skill").dataset.itemId;
    if (!skillId)
      return;

    this.actor.getOwnedItem(skillId).use();
  }

  /**
   * Called when clicking on a "Roll" button next to a weapon.
   *
   * @param {Event} event
   * @memberof NumeneraPCActorSheet
   */
  async onWeaponUse(event) {
    event.preventDefault();

    const weaponId = event.target.closest(".weapon").dataset.itemId;
    if (!weaponId)
      return;

    this.actor.getOwnedItem(weaponId).use();
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

    this.actor.getOwnedItem(abilityId).use();
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
      speaker: ChatMessage.getSpeaker(),
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

  async onPowerShiftUpdated() {
    const expectedRecoveries = this.actor.nbRecoveries;

    if (expectedRecoveries !== this.actor.data.data.recoveries.length) {
      //TODO  handle in PCActor class plz
      const deltaRecoveries = expectedRecoveries - this.actor.data.data.recoveries.length;

      if (deltaRecoveries > 0) {
        //Increased the level, create an array of unused recoveries (ie. "true" values)
        const newRecoveries = new Array(deltaRecoveries).fill(true);

        //Prepend to the recoveries array; unshift() mutates the Array in place so make a copy first
        const recoveries = Array.from(this.actor.data.data.recoveries);
        recoveries.unshift(...newRecoveries);

        await this.actor.update({ "data.recoveries": recoveries });
      }
      else if (deltaRecoveries < 0) {
        //Decreased the level, must remove some recoveries
        //slice() does not act in place, it returns a new array
        await this.actor.update({ "data.recoveries": this.actor.data.data.recoveries.slice(-deltaRecoveries) });
      }

      //If recoveries changed, update the sheet, the number of recoveries has changed
      if (deltaRecoveries !== 0)
        this.render();
    }
  }

  onAbilityDeleted(ability) {
    //TODO move to Ability class
    if (
      ability &&
      this.actor.data.items.find(i => i.type === "skill" &&
      i.data.relatedAbilityId === ability._id)
    )
      ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.skillWithSameNameExists"));

    //Check for any macro related to that ability
    game.macros.filter(m => m.data.command.indexOf(ability._id) !== -1)
      .forEach(m => m.delete());      
  }

  onSkillDeleted(skill) {
    //TODO move to Skill class
    if (
      skill &&
      skill.data.relatedAbilityId &&
      this.actor.data.items.find(i => i._id === skill.data.relatedAbilityId)
    )
      ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.abilityWithSameNameExists"));

    //Check for any macro related to that skill
    game.macros.filter(m => m.data.command.indexOf(skill._id) !== -1)
      .forEach(m => m.delete());   
  }

  onWeaponDeleted(equipment) {
    //TODO move to Weapon class
    if (equipment.type === NumeneraWeaponItem.type) {
      //Check for any macro related to that skill
      game.macros.filter(m => m.data.command.indexOf(equipment._id) !== -1)
        .forEach(m => m.delete());   
    }
  }

  onRecoveryRoll(event) {
    event.preventDefault();
    (new RecoveryDialog(this.actor, {})).render(true);
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

  _onDropItem(event, data) {
    //TODO remove this with 0.6 version support
    if (game.data.version.startsWith("0.6.")) {
      
    }
    else {
      super._onDropItem(event, data);
    }

    const { id } = JSON.parse(event.dataTransfer.getData("text/plain"));

    if (!id)
      return;

    const item = Item.collection.entities.find(i => i._id == id)

    //To avoid "false drops"
    if (!item)
      return;

    switch (item.data.type) {
      case NumeneraArmorItem.type:
        //Necessary because dropping a new armor from the directory would not update the Armor field
        this.onArmorUpdated();
        return;

      case NumeneraPowerShiftItem.type:
        //Necessary because dropping a new PS from the directory would not update some values such as recoveries
        this.onPowerShiftUpdated();
        return;
    }
  }

  _updateObject(event, formData) {
    this.selectedFeature = formData.selectedFeature;
    return super._updateObject(event, formData);
  }
}
