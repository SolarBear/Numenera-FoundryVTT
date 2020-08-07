import { NumeneraSkillItem } from "./NumeneraSkillItem.js";

export class NumeneraAbilityItem extends Item {
  static get type() {
      return "ability";
  }

  prepareData() {
      // Override common default icon
      if (!this.data.img) this.data.img = 'icons/svg/lightning.svg';

      super.prepareData();

      let itemData = this.data;
      if (itemData.hasOwnProperty("data"))
        itemData = itemData.data;

      itemData.name = this.data ? this.data.name : game.i18n.localize("NUMENERA.item.ability.newAbility");
      itemData.category = itemData.category || "";
      itemData.categoryValue = itemData.categoryValue || "";
      itemData.isAction = itemData.isAction || false;
      itemData.cost = itemData.cost || {};
      itemData.cost.amount = itemData.cost.amount || 0;
      itemData.cost.pool = itemData.cost.pool || "";
      itemData.tier = itemData.tier || 1;
      itemData.range = itemData.range || "";
      itemData.notes = itemData.notes || "";
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

    ui.notifications.info(game.i18n.localize("NUMENERA.item.ability.relatedSkillUpdated"));

    return updated;
  }

  async use() {
    //An ability must be related to an Actor to be used
    if (this.actor === null) {
      return ui.notifications.error(game.i18n.localize("NUMENERA.item.ability.useNotLinkedToActor"));
    }

    //Get the skill related to that ability
    const skill = this.actor.data.items.find(
      i => i.name === this.data.name && i.type === NumeneraSkillItem.type
    );

    const gmRoll = window.event ? window.event.shiftKey : false;
    
    this.actor.rollSkill(skill, gmRoll);
  }

  async update(data, options) {
    // Workaround since Foundry does not like inputs that are not checkboxes to be dtype "Boolean"
    if (typeof data["data.isAction"] === "string") {
      data["data.isAction"] = data["data.isAction"] === "true";
      // TODO migrate isAction property into a string or number to avoid this workaround
      // don't forget to change the form's dtype accordingly!
    }

    return super.update(data, options);
  }
}
