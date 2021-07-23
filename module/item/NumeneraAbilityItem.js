import { confirmSpellUse, selectRecoveryToUse } from "../apps/SpellDialog.js";
import { NumeneraSkillItem } from "./NumeneraSkillItem.js";

export class NumeneraAbilityItem extends Item {
  static get type() {
    return "ability";
  }

  static get object() {
    return {
      type: NumeneraAbilityItem.type,
      name: game.i18n.localize("NUMENERA.item.ability.newAbility"),
    }
  }

  get spellCastingTime() {
    if (this.data.data.tier >= 5) {
      return "1 hour";
    }
    else if (this.data.data.tier >= 3) {
      return "30 minutes";
    }
    else if (this.data.data.tier >= 1) {
      return "10 minutes";
    }
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/lightning.svg';

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.name = this.data ? this.data.name : game.i18n.localize("NUMENERA.item.ability.newAbility");
    itemData.category = itemData.category || "";
    itemData.categoryValue = itemData.categoryValue || "";
    itemData.abilityType = itemData.abilityType || false;
    itemData.cost = itemData.cost || {};
    itemData.cost.amount = itemData.cost.amount || 0;
    itemData.cost.pool = itemData.cost.pool || "";
    itemData.tier = itemData.tier || 1;
    itemData.range = itemData.range || "";
    itemData.notes = itemData.notes || "";
  }

  /**
   * Checks whether the ability is a spell.
   *
   * @readonly
   * @return {Boolean} True if it is a spell, false otherwise.
   * @memberof NumeneraAbilityItem
   */
  get isSpell() {
    return this.data.data.abilityType === "NUMENERA.item.ability.type.spell";
  }

  /**
   * Gets the Ability cost as an object representing the pool name and amount.
   *
   * @returns {Object}
   * @memberof NumeneraAbilityItem
   */
  getCost() {
    return {
      pool: this.data.data.cost.pool.split(".").pop(), // pool is saved as "NUMENERA.pool.POOLNAME"
      amount: this.data.data.cost.amount,
    };
  }

  async updateRelatedSkill(skill, options = {}) {
    //If it is not owned by an Actor, it has no related skill
    if (!this.actor || !skill)
      return;

    if (
      skill.data.data.stat === this.data.data.cost.pool &&
      skill.data.name === this.data.name
    )
      return;

    const updated = await skill.update({
      _id: skill._id,
      name: this.name,
      "data.relatedAbilityId": this._id,
      "data.stat": this.data.data.cost.pool,
    },
      options);

    return updated;
  }

  /**
   * Use the Ability: gets the related skill, if any, then checks whether it is a spell.
   * Performs the roll and returns whether the ability was successfully used.
   *
   * @returns {Boolean} True if the ability was used, false otherwise.
   * @memberof NumeneraAbilityItem
   */
  async use(event = null) {
    //An ability must be related to an Actor to be used
    if (this.actor === null) {
      ui.notifications.error(game.i18n.localize("NUMENERA.item.ability.useNotLinkedToActor"));
      return false;
    }

    //Get the skill related to that ability
    let skill = this.actor.items.find(
      i => i.name === this.data.name && i.type === NumeneraSkillItem.type
    );

    //Is this a spell?
    if (this.isSpell) {
      const isCast = await this._castAsSpell();

      if (!isCast) //User might change their mind
        return false;
    }

    if (!skill) {
      //We can't use NumeneraItem directly here as its inclusion would create a circular dependency
      skill = new CONFIG.Item.documentClass(NumeneraSkillItem.object, { parent: this.actor });
      skill.data.name = `${game.i18n.localize(this.data.data.weight)} ${game.i18n.localize(this.data.data.weaponType)}`;
    }
    else if (!(skill instanceof NumeneraSkillItem)) {
      skill = NumeneraSkillItem.fromOwnedItem(skill, this.actor);
    }

    return skill.use(event, this);
  }

  async toChatMessage() {
    const data = {
      type: this.type,
      name: this.data.name,
      img: this.data.img,
      form: this.data.data.form,
      abilityType: this.data.data.abilityType,
      cost: this.data.data.cost.amount,
      stat: this.data.data.cost.pool,
      range: this.data.data.range,
      description: this.data.data.notes,
    };

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      content: await renderTemplate(
        "systems/numenera/templates/chat/items/ability.html", 
        data,
      )
    });
  }

  /**
   * If the current ability is a spell
   *
   * @returns
   * @memberof NumeneraAbilityItem
   */
  async _castAsSpell() {
    if (!this.isSpell)
      throw new Error("Trying to cast a non-spell ability as a spell");

    //Hold on! We need to know how they wish to cast that spell      
    const use = await confirmSpellUse(this);

    let message = null;
    switch (use) {
      case "time":
        message = game.i18n.localize("NUMENERA.features.spells.time") + this.spellCastingTime;
        break;

      case "recovery":
        const recoveries = this.actor.data.data.recoveries;
        const recovery = await selectRecoveryToUse(this.actor);
        switch (recovery) {
          case "action":
            //Get the first 1-action that is available
            //We've already confirmed that at least one is available
            for (let i = 0; i < recoveries.length - 3; i++)
              if (recoveries[i]) {
                recoveries[i] = false;
                break;
              }
            break;
          case "tenMin":
            recoveries[recoveries.length - 3] = false;
            break;
          case "oneHour":
            recoveries[recoveries.length - 2] = false;
            break;
          default:
            return false;
        }

        message = game.i18n.localize("NUMENERA.pc.recovery." + recovery)
          + game.i18n.localize("NUMENERA.features.spells.recovery");

        //Save the actor data for that recovery's use
        await this.actor.update({ "data.recoveries": recoveries });
        break;
      default:
        //That one's easy.
        return false;
    }

    if (message !== null) {
      ChatMessage.create({
        user: game.user._id,
        speaker: this.actor,
        content: message,
      });
    }

    return true;
  }
}
