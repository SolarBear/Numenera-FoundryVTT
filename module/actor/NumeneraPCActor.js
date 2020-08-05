import { numeneraRollFormula } from "../roll.js";
import { NumeneraAbilityItem } from "../item/NumeneraAbilityItem.js";

const effortObject = {
  cost: 0,
  effortLevel: 0,
  warning: null,
};

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
    const initSkill = this.items.find(i => i.type === "skill" && i.name.toLowerCase() === "initiative")

    //TODO possible assets, effort on init roll
    return this.getSkillFormula(initSkill);
  }

  get effort() {
    const data = this.data.data;

    return data.tier + (data.advances.effort ? 1 : 0);
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

  getSkillFormula(skill) {
    let skillLevel = 0;
    if (skill) {
      skillLevel = this.getSkillLevel(skill);
    }

    return numeneraRollFormula(skillLevel);
  }

  /**
   * Given a skill ID, roll the related skill item for the character.
   *
   * @param {String} skillId
   * @param {boolean} [gmRoll=false]
   * @returns {Roll}
   * @memberof NumeneraPCActor
   */
  rollSkillById(skillId, gmRoll = false) {
    const skill = this.getOwnedItem(skillId);
    return this.rollSkill(skill, gmRoll);
  }

  /**
   * Given a skill object, fetch the skill level bonus and roll a d20, adding the skill
   * bonus.
   *
   * @param {NumeneraSkillItem} skill
   * @param {Boolean} gmRoll
   * @returns
   * @memberof NumeneraPCActor
   */
  rollSkill(skill, gmRoll = false) {
    switch (this.data.data.damageTrack) {
      case 2:
        ui.notifications.warn(game.i18n.localize("NUMENERA.pc.damageTrack.debilitated.warning"));
        return;

      case 3:
        ui.notifications.warn(game.i18n.localize("NUMENERA.pc.damageTrack.dead.warning"));
        return;
    }

    const roll = new Roll(this.getSkillFormula(skill)).roll();

    let rollMode;
    if (gmRoll) {
      if (game.user.isGM) {
        rollMode = DICE_ROLL_MODES.PRIVATE;
      }
      else {
        rollMode = DICE_ROLL_MODES.BLIND;
      }
    }
    else {
      rollMode = DICE_ROLL_MODES.PUBLIC;
    }

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${game.i18n.localize("NUMENERA.rolling")} ${skill.name}`,
    },
      {
        rollMode
      });
  }

  /**
   * Given a skill ID, return this skill's modifier as a a numeric value.
   *
   * @param {NumeneraSkillItem} skill item
   * @returns {Number} Skill modifier in the [-1, 2] range
   * @memberof ActorNumeneraPC
   */
  getSkillLevel(skill) {
    if (!skill || !skill.data)
      throw new Error("No skill provided");

    skill = skill.data;
    if (skill.hasOwnProperty("data"))
      skill = skill.data;

    //Inability subtracts 1 from overall level
    return skill.skillLevel - Number(skill.inability);
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

  getEffortCostFromStat(event) {
    //Return value, copy from template object
    const value = { ...effortObject };

    const effortLevel = event.target.value;
    if (effortLevel === 0) {
      return value;
    }

    const actorData = this.data.data;

    const statId = event.target.dataset.statId;
    const stat = actorData.stats[statId];

    //The first effort level costs 3 pts from the pool, extra levels cost 2
    //Substract the related Edge, too
    const availableEffortFromPool = (stat.pool.current + stat.edge - 1) / 2;

    //A PC can use as much as their Effort score, but not more
    //They're also limited by their current pool value
    const finalEffort = Math.max(effortLevel, actorData.effort, availableEffortFromPool);
    const cost = 1 + 2 * finalEffort - stat.edge;

    //TODO take free levels of Effort into account here

    let warning = null;
    if (effortLevel > availableEffortFromPool) {
      warning = null; // TODO put into localization file `Not enough points in your ${statId} pool for that level of Effort`;
    }

    value.cost = cost;
    value.effortLevel = finalEffort;
    value.warning = warning;

    return value;
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

    switch (game.settings.get("numenera", "systemVersion")) {
      case 1:
        return this._isOverCypherLimitv1(cyphers);

      case 2:
        return this._isOverCypherLimitv2(cyphers);

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

  updateEmbeddedEntity(embeddedName, data, options = {}) {
    const updated = super.updateEmbeddedEntity(embeddedName, data, options);

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
