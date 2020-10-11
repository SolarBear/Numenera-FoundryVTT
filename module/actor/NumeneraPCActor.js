import { RollData } from "../dice/RollData.js";

import { NumeneraAbilityItem } from "../item/NumeneraAbilityItem.js";
import { NumeneraSkillItem } from "../item/NumeneraSkillItem.js";
import { NumeneraWeaponItem } from "../item/NumeneraWeaponItem.js";
import { getShortStat } from "../utils.js";

/**
 * Extend the base Actor class to implement additional logic specialized for Numenera.
 */
export class NumeneraPCActor extends Actor {

  prepareData() {
    super.prepareData();

    //Armor would sometimes get desynchronized with the armor items, this fixes it
    this.data.data.armor = this.getTotalArmor();
  }

  getFocus() {
    //Add any game-specific logic to get the PC's focus here
  	const allFoci = this.data.data.focus;

    //Default case: there is no specific ID
    return allFoci[Object.keys(allFoci)[0]];
  }

  setFocusFromEvent(event) {
    this.setFocus(event.currentTarget.value);
  }

  setFocus(value) {
    //Add any game-specific logic to set a PC focus here
	  const allFoci = this.data.data.focus;

    //Default case: there is no specific ID
    allFoci[Object.keys(allFoci)[0]] = value;

    const data = {_id: this._id};
    data["data.focus"] = {"": value};

    this.update(data);
  }

  getInitiativeFormula() {
    //Check for an initiative skill
    //TODO allow "initiative" in different languages if the current locale isn't "en"
    let initSkill = this.items.find(i => i.type === "skill" && i.name.toLowerCase() === "initiative");
    if (!initSkill) {
      initSkill = new NumeneraSkillItem();
      initSkill.data.data.name = "Initiative";
    }

    const rollData = this.getSkillRollData(initSkill);

    //TODO possible assets, effort on init roll
    return rollData.getRollFormula();
  }

  /**
   * Get the current PC's level on the damage track as an integer, 0 being Hale and 3 being Dead.
   * @type {Object} stats Stats object (see template.json)
   */
  damageTrackLevel(stats = null) {
    if (stats === null)
      stats = this.data.data.stats;

    //Each stat pool whose value is 0 counts as being one step higher on the damage track
    return Object.values(stats).filter(stat => {
      return stat.pool.value === 0;
    }).length;
  }

  /**
   * Given a skill id, get the related RollData object.
   *
   * @param {NumeneraSkillItem} skill
   * @returns {RollData}
   * @memberof NumeneraPCActor
   */
  getSkillRollData(skill) {
    const rollOptions = new RollData();

    let data = skill.data;
    if (data.hasOwnProperty("data"))
      data = data.data;

    rollOptions.skillLevel = data ? data.skillLevel : 0;
    rollOptions.isHindered = data ? data.inability : false;

    return rollOptions;
  }

  /**
   * Given a skill ID, roll the related skill item for the character.
   *
   * @param {String} skillId
   * @param {RollData} rollData
   * @returns {Roll}
   * @memberof NumeneraPCActor
   */
  rollSkillById(skillId, rollData = null, ability = null) {
    const skill = this.getOwnedItem(skillId);
    return this.rollSkill(skill, rollData, ability);
  }

  /**
   * Given a skill object, fetch the skill level bonus and roll a d20, adding the skill
   * bonus.
   *
   * @param {NumeneraSkillItem} skill
   * @param {RollData} rollData
   * @returns
   * @memberof NumeneraPCActor
   */
  rollSkill(skill, rollData = null, ability = null) {
    switch (this.data.data.damageTrack) {
      case 2:
        ui.notifications.warn(game.i18n.localize("NUMENERA.pc.damageTrack.debilitated.warning"));
        return;

      case 3:
        ui.notifications.warn(game.i18n.localize("NUMENERA.pc.damageTrack.dead.warning"));
        return;
    }

    if (rollData) {
      rollData.skillLevel = skill.data.data.skillLevel;
      rollData.isHindered = skill.data.data.inability;
    }
    else {
      rollData = this.getSkillRollData(skill);
    }

    rollData.ability = ability;
    
    const roll = rollData.getRoll();
    roll.roll();

    let flavor = game.i18n.localize("NUMENERA.rolling") + " " + skill.data.data.name;
    if (rollData.effortLevel > 0) {
      flavor += ` + ${rollData.effortLevel} ${game.i18n.localize("NUMENERA.effort.title")}`;
    }

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      messageData: RollData.rollText(roll),
      flavor,
    },
    {
      rollMode: rollData.rollMode,
    });
  }

  /**
   * Roll an attribute as is, with no related skill.
   *
   * @param {String} attribute
   * @param {RollData} rollData
   * @returns
   * @memberof NumeneraPCActor
   */
  rollAttribute(attribute, rollData = null) {
    // Create a pseudo-skill to avoid repeating the roll logic
    const skill = new NumeneraSkillItem();

    //Need to modify the deep property since skill.name is a getter
    skill.data.data.name = attribute.replace(/^\w/, (c) => c.toUpperCase()); //capitalized

    return this.rollSkill(skill, rollData);
  }

  /**
   * Given a stat ID, return all skills related to that stat.
   *
   * @param {string} statId
   * @returns {Array}
   * @memberof ActorNumeneraPC
   */
  filterSkillsByStat(statId) {
    if (!statId) {
      return this.skills;
    }

    return this.data.data.skills.filter(id => id == statId);
  }

  /**
   * Get the Effort cost for a given stat and Effort level, with an
   * optional extra cost (eg. Ability cost). Edge will be automatically
   * included in the calculation.
   *
   * @param {String} shortStat  Short stat name
   * @param {Number} effortLevel Number of levels of Effort used
   * @param {Number} [extraCost=0] Any extra cost (eg. Ability cost)
   * @returns {Number} The total pool cost for using that stat.
   * @memberof NumeneraPCActor
   */
  getEffortCostFromStat(shortStat, effortLevel, extraCost = 0) {
    if (!shortStat)
      return null;

    const actorData = this.data.data;
    const stat = actorData.stats[shortStat];

    if (effortLevel === 0)
      return Math.max(0, extraCost - stat.edge);

    //The first effort level costs 3 pts from the pool, extra levels cost 2
    //Subtract the related Edge and add any extra cost
    return Math.max(0, 1 + 2 * effortLevel + extraCost - stat.edge);
  }

  /**
   * Get the Effort cost for a given Ability and Effort level.
   *
   * @param {NumeneraAbilityItem} ability  Ability object
   * @param {Number} effortLevel Number of levels of Effort used
   * @returns {Number} The total pool cost for using that Ability.
   * @memberof NumeneraPCActor
   */
  getEffortCostFromAbility(ability, effortLevel) {
    if (!ability)
      return null;

    let {pool, amount} = ability.data.data.cost;
    amount = parseInt(amount);

    return this.getEffortCostFromStat(getShortStat(pool), effortLevel, amount);
  }

  getTotalArmor() {
    return this.getEmbeddedCollection("OwnedItem").filter(i => i.type === "armor")
      .reduce((acc, armor) => acc + Number(armor.data.armor), 0);
  }

  async onGMIntrusion(accepted) {
    let xp = this.data.data.xp;
    let choice;

    if (accepted) {
      xp++;
      choice = game.i18n.localize("NUMENERA.gmIntrusionAccepts");
    } else {
      xp--;
      choice = game.i18n.localize("NUMENERA.gmIntrusionRefuses");
    }

    this.update({
      _id: this._id,
      "data.xp": xp,
    });

    ChatMessage.create({
      content: `<h2>${game.i18n.localize("NUMENERA.gmIntrusion")}</h2><br/>${this.data.name} ${choice}`,
    });
  }

  isOverCypherLimit() {
    const cyphers = this.getEmbeddedCollection("OwnedItem").filter(i => i.type === "cypher");

    //AFAIK, only systems using anoetic/occultic cyphers count them differently
    switch (game.settings.get("numenera", "cypherTypesFlavor")) {
      case 1: //Numenera v2-style
      case 3: //Cypher Syste-style
        return this._isOverCypherLimitv2(cyphers);
      case 2: //Numenera/The Strange-style
        return this._isOverCypherLimitv1(cyphers);
      default:
        throw new Error("Unhandled version");
    }
  }

  _isOverCypherLimitv1(cyphers) {
    //In v1 parlance, occultic cyphers count as 2
    return this.data.data.cypherLimit < cyphers.reduce((acc, cypher) =>
      acc + (cypher.data.cypherType === "Occultic" ? 2 : 1)
      , 0);
  }

  _isOverCypherLimitv2(cyphers) {
    return this.data.data.cypherLimit < cyphers.length;
  }

  /**
   * Use an item, whatever its type, given its id.
   *
   * @param {String} itemId
   * @memberof NumeneraPCActor
   */
  async useItemById(itemId) {
    const item = await this.getOwnedItem(itemId);
    return this.useItem(item);
  }

  /**
   * Use an item, whatever its type.
   *
   * @param {String} itemId
   * @memberof NumeneraPCActor
   */
  async useItem(item) {
    switch (item.type) {
      case NumeneraAbilityItem.type:
        return this.useAbility(item);

      case NumeneraSkillItem.type:
      case NumeneraWeaponItem.type:
        return item.use();

      default:
        throw new Error("Item use not supported yet for item type " + item.type);
    }
  }

  /**
   * Checks whether a given Ability can be used, ie. if there are enough
   * points available in the related pool.
   *
   * @param {Object} ability
   * @returns {Boolean} true if the Ability can be used, false otherwise
   * @memberof NumeneraPCActor
   */
  async canUseAbility(ability) {
    if (ability.type !== NumeneraAbilityItem.type)
      throw new Error("Not an ability item");

    const cost = ability.getCost();
    //Ability costs 0? yeah, sure, use it, buddy
    if (cost.amount === 0) {
      return true;
    }

    const stat = this.data.data.stats[cost.pool];

    if (!stat)
      throw new Error("No related pool for ability " + ability.name);

    return stat.pool.value + stat.edge >= cost.amount;
  }

  /**
   * Use an Ability, given its ID.
   *
   * @param {*} abilityId
   * @returns  {Boolean} true if the Ability was used, false otherwise
   * @memberof NumeneraPCActor
   */
  async useAbilityById(abilityId) {
    const ability = await this.getOwnedItem(abilityId);
    return this.useAbility(ability);
  }

  /**
   * Use an Ability, given its ID. This will subtract any cost from the related pool, producing a
   * warning if not enough points are left in the pool and performing the roll, if possible.
   *
   * @param {Object} ability
   * @returns  {Boolean} true if the Ability was used, false otherwise
   * @memberof NumeneraPCActor
   */
  async useAbility(ability) {
    if (ability.type !== NumeneraAbilityItem.type)
      throw new Error("Not an ability item");

    if (!await this.canUseAbility(ability)) {
      ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.notEnoughPointsInPoolForAbility"));
      return false;
    }

    ability.use();

    const cost = ability.getCost();
    if (cost.amount === 0) {
      return true;
    }

    const stat = this.data.data.stats[cost.pool];

    if (cost.amount > stat.edge) {
      const newPoolValue = stat.pool.value + stat.edge - cost.amount;
      const poolProp = `data.stats.${cost.pool}.pool.value`;

      const data = { _id: this._id };
      data[poolProp] = newPoolValue;

      await this.update(data);
    }

    return true;
  }

  /**
   * BASE CLASS OVERRIDES
   */

  /**
   * @override
   */
  async createEmbeddedEntity(...args) {
    const [_, data] = args;

    if (!data.data) return;

    //Prepare numenera items by rolling their level, if they don't have one already
    switch (data.type) {
      case "artifact":
      case "cypher":
        const itemData = data.data;

        if (!itemData.level && itemData.levelDie) {
          try {
            //Try the formula as is first
            itemData.level = new Roll(itemData.levelDie).roll().total;
            await this.update({
              _id: this._id,
              "data.level": itemData.level,
            });
          } catch (Error) {
            try {
              itemData.level = parseInt(itemData.level);
            } catch (Error) {
              //Leave it as it is
            }
          }
        } else {
          itemData.level = itemData.level || null;
        }
		
        // Get the form of the artifact/cypher
        try {
          const forms = itemData.form.split(',');
          const form = forms[Math.floor(Math.random() * forms.length)];
          
          itemData.form = form;
        } catch (Error) {
          //Leave it as it is
        }
        break;
    }

    const newItem = await super.createEmbeddedEntity(...args);

    switch (data.type) {
      case "ability":
        const actorAbility = newItem;

        if (!actorAbility) throw new Error("No related ability exists");

        //Now check if a skill with the same name already exists
        const relatedSkill = this.items.find(
          (i) => i.data.type === "skill" && i.data.name === actorAbility.name
        );

        if (relatedSkill) {
          if (relatedSkill.relatedAbilityId)
            throw new Error(
              "Skill related to new abiltiy already has a skill linked to it"
            );

          //A skil already has the same name as the ability
          //This is certainly the matching skill, no need to create a new one
          const updated = {
            _id: relatedSkill.data._id,
            "data.relatedAbilityId": actorAbility._id,
          };
          await this.updateEmbeddedEntity("OwnedItem", updated);

          ui.notifications.info(game.i18n.localize("NUMENERA.info.linkedToSkillWithSameName"));
        } else {
          //Create a related skill if one does not already exist
          const skillData = {
            stat: actorAbility.data.cost.pool,
            relatedAbilityId: actorAbility._id,
          };

          const itemData = {
            name: actorAbility.name,
            type: "skill",
            data: skillData,
          };

          await this.createOwnedItem(itemData);

          ui.notifications.info(game.i18n.localize("NUMENERA.info.skillWithSameNameCreated"));
        }
        break;
    }

    return newItem;
  }

  async updateEmbeddedEntity(embeddedName, data, options = {}) {
    const updated = await super.updateEmbeddedEntity(embeddedName, data, options);

    const updatedItem = this.getOwnedItem(updated._id);

    if (!updatedItem)
      return;

    if (options.fromActorUpdateEmbeddedEntity)
      return updated;

    switch (updatedItem.type) {
      case "ability":
        const relatedSkill = this.items.find(i => i.data.data.relatedAbilityId === updatedItem._id);
        if (!relatedSkill)
          break;

        const ability = this.getOwnedItem(relatedSkill.data.data.relatedAbilityId);
        if (!ability)
          break;

        if (!options.fromActorUpdateEmbeddedEntity)
          options.fromActorUpdateEmbeddedEntity = "ability";

        ability.updateRelatedSkill(relatedSkill, options);
        break;

      case "skill":
        if (!updatedItem.data.data.relatedAbilityId)
          break;

        const skill = this.getOwnedItem(updatedItem._id);
        if (!skill)
          break;

        const relatedAbility = this.items.find(i => i.data._id === skill.data.data.relatedAbilityId);
        if (!relatedAbility)
          break;

        if (!options.fromActorUpdateEmbeddedEntity)
          options.fromActorUpdateEmbeddedEntity = "skill";

        skill.updateRelatedAbility(relatedAbility, options);
        break;
    }
  }
}