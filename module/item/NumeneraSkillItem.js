export class NumeneraSkillItem extends Item {
  get type() {
      return "skill";
  }

  prepareData() {
      super.prepareData();

      const itemData = this.data.data || {};

      itemData.name = this.data ? this.data.name : "New Skill";
      itemData.notes = itemData.notes || "";
      itemData.stat = itemData.stat || "";
      itemData.inability = itemData.inability || false;
      itemData.trained = itemData.trained || false;
      itemData.specialized = itemData.specialized || false;
  }
}