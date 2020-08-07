export class NumeneraDescriptorItem extends Item {
  static get type() {
      return "descriptor";
  }

  prepareData() {
  // Override common default icon
  // TODO Descriptor icon
    if (!this.data.img) this.data.img = 'icons/svg/anchor.svg';
      super.prepareData();

      let itemData = this.data;
      if (itemData.hasOwnProperty("data"))
        itemData = itemData.data;

      itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.descriptor.newDescriptor");
      itemData.notes = itemData.notes || "";

      // TODO fetch the Transform associated with that Descriptor
  }
}
