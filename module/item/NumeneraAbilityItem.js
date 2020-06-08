import { NumeneraSkillItem } from "./NumeneraSkillItem.js";

export class NumeneraAbilityItem extends Item {
  get type() {
      return "ability";
  }

  prepareData() {
      // Override common default icon
      if (!this.data.img) this.data.img = 'icons/svg/lightning.svg';

      super.prepareData();

      const itemData = this.data.data || {};

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

    ui.notifications.info("Related skill information updated");

    return updated;
  }

  async use() {
    //An ability must be related to an Actor to be used
    if (this.actor === null) {
      return ui.notifications.error("The ability is not linked to an actor");
    }

    //Get the skill related to that ability
    const skill = this.actor.data.items.find(
      i => i.name === this.data.name && i.type === NumeneraSkillItem.type
    );
    this.actor.rollSkill(skill);
  }
}