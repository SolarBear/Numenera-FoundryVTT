export class NumeneraOddityItem extends Item {
  static get type() {
    return "oddity";
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/sun.svg';

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.oddity.newOddity");
    itemData.notes = itemData.notes || "";
  }
}
