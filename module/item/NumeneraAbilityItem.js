export class NumeneraAbilityItem extends Item {
  get type() {
      return "ability";
  }

  prepareData() {
      // Override common default icon
      if (!this.data.img) this.data.img = 'icons/svg/lightning.svg';

      super.prepareData();

      const itemData = this.data.data || {};

      itemData.name = this.data.name || "New Ability";
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

  async updateRelatedSkill(skill) {
    //If it is not owned by an Actor, it has no related skill
    if (!this.actor || !skill)
      return;

    const updated = await skill.update({
      _id: skill._id,
      name: this.name,
      "data.relatedAbilityId": this._id,
      "data.stat": this.data.data.cost.pool,
    });

    ui.notifications.info("Related skill information updated");

    return updated;
  }
}