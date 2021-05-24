export class NumeneraNpcAttackItem extends Item {
  static get type() {
      return "npcAttack";
  }

  prepareData() {
    super.prepareData();

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.notes = itemData.notes || "";
    itemData.info = itemData.info || "";
  }
}
