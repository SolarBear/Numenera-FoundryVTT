export class NumeneraNpcAttackItem extends Item {
  static get type() {
      return "npcAttack";
  }

  static get object() {
    return {
      type: NumeneraNpcAttackItem.type,
      name: "",
    }
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
