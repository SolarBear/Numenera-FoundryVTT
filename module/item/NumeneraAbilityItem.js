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

  /**
   * Get the skill related to the current ability, if one exists.
   *
   * @return {NumeneraSkillItem|null} The related skill item; null, if none exists.
   * @memberof NumeneraAbilityItem
   */
   async getRelatedSkill() {
    if (!this.actor || this.data.data.relatedSkill)
      return null;

    //TODO should we provide an empty Skill item if no skill is found here?
    return this.actor.items.find(
      i =>    i.data.type === NumeneraSkillItem.type
           && i.data.data.relatedAbilityId === this.id
      );
  }

  async createRelatedSkill() {
    //First check if a skill with the same name already exists
    const relatedSkill = this.actor.items.find(
      (i) => i.data.type === NumeneraSkillItem.type && i.data.name === this.name
    );

    if (relatedSkill) {
      if (relatedSkill.relatedAbilityId)
        throw new Error(
          "Skill related to new abiltiy already has a skill linked to it"
        );

      //A skil already has the same name as the ability
      //This is certainly the matching skill, no need to create a new one

      //TODO prompt for link
      const updated = {
        _id: relatedSkill.data._id,
        "data.relatedAbilityId": this.id,
      };
      await this.actor.updateEmbeddedDocuments("Item", [updated], { fromActorUpdateEmbeddedEntity: true });

      ui.notifications.info(game.i18n.localize("NUMENERA.info.linkedToSkillWithSameName"));
    } else {
      const skillData = {
        stat: this.data.data.cost.pool,
        relatedAbilityId: this.id,
      };

      const itemData = {
        name: this.name,
        type: NumeneraSkillItem.type,
        data: skillData,
      };

      const skill = await this.actor.createEmbeddedDocuments("Item", [itemData]);

      //TODO handle failure?
      if (skill)
        ui.notifications.info(game.i18n.localize("NUMENERA.info.skillWithSameNameCreated"));
    }
  }

  /**
   * Given a skill item, update some of its values whenever this item changes.
   *
   * @param {NumeneraSkillItem} skill The skill item.
   * @param {Object} [options={}] Options given to the Item.update method
   * @return {NumeneraSkillItem} The updated skill item
   *
   * @memberof NumeneraAbilityItem
   */
  async updateRelatedSkill(skill, options = {}) {
    //TODO related skill : bind to postUpdate hook instead of calling manually
    //TODO why bother passing the skill as an argument?
    //TODO are options actually useful here?

    //If it is not owned by an Actor, it has no related skill
    if (!this.actor || !skill)
      return;

    if (
      skill.data.data.stat === this.data.data.cost.pool &&
      skill.data.name === this.data.name
    )
      return;

    const updated = await skill.update({
      _id: skill.id,
      name: this.name,
      "data.relatedAbilityId": this.id,
      "data.stat": this.data.data.cost.pool,
    },
      options);

    return updated;
  }

  /**
   * Whenever an ability item is deleted, if a related skill exists, prompt the
   * user to ask if that skill should be deleted, too. Also, delete any macro
   * related to that ability.
   *
   * @memberof NumeneraAbilityItem
   */
  async deleteRelatedSkill() {
    //TODO related skill : can I bind this to some kind of postDelete event?
    const relatedSkill = await this.getRelatedSkill();
    if (relatedSkill) {
      //TODO localize
      const answer = await Dialog.confirm({
        title: "Delete Related Skill",
        content: "A skill related to that ability exists. Delete it too?",
        defaultYes: false,
        options: {jQuery: false}
      });

      if (answer)
        this.actor.deleteEmbeddedDocuments("Item", [relatedSkill.id]);

      //TODO unused? remove from localization files
      //ui.notifications.warn(game.i18n.localize("NUMENERA.warnings.skillWithSameNameExists"));
    }

    //Check for any macro related to that ability
    game.macros.filter(m => m.data.command.indexOf(this.id) !== -1)
      .forEach(m => m.delete());  
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
    let skill = await this.getRelatedSkill();

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

    return skill.use({ event, ability: this });
  }

  /**
   * Create a ChatMessage from this Ability and output it to chat.
   *
   * @memberof NumeneraAbilityItem
   */
  async toChatMessage() {
    const data = {
      id: this.id,
      actorId: this.actor.id,
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
