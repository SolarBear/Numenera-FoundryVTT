export class NumeneraOddityItem extends Item {
    static get type() {
        return "oddity";
    }

    prepareData() {
		// Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/sun.svg';
        super.prepareData();

        let itemData = this.data;
        if (itemData.hasOwnProperty("data"))
          itemData = itemData.data;

        itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.oddity.newOddity");
        itemData.notes = itemData.notes || "";
    }
}
