export class StrangeRecursionItem extends Item {
    get type() {
        return "recursion";
    }

    async prepareData() {
	    // Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/circle.svg';

        super.prepareData();

        let itemData = this.data.data || {};

        const desc = Object.getOwnPropertyDescriptor(itemData, "name");
        if (desc && desc.writable)
          itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.recursion.newRecursion");

        itemData.level = itemData.level || 0;
        itemData.laws = itemData.laws || "";
        itemData.race = itemData.race || "";
        itemData.focus = itemData.focus || "";
        itemData.focusAbilities = itemData.focusAbilities || "";
      }
}
