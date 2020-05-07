export class NumeneraAbilityItem extends Item {
  get type() {
      return "ability";
  }

  prepareData() {
      super.prepareData();

      const itemData = this.data.data;

      itemData.name = this.data.name || "New Ability";
      itemData.pcType = itemData.pcType || "";
      itemData.pcFocus = itemData.pcFocus || "";
      itemData.isAction = itemData.isAction || true;
      itemData.cost = itemData.cost || {};
      itemData.level = itemData.level || 1;
      itemData.description = itemData.description || "";
  }
}