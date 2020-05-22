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
      itemData.tier = itemData.tier || 1;
      itemData.range = itemData.range || "";
      itemData.stat = itemData.stat || "";
      itemData.notes = itemData.notes || "";
  }
}