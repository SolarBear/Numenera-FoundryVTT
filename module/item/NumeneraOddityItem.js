export class NumeneraOddityItem extends Item {
    get type() {
        return "oddity";
    }

    prepareData() {
		// Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/sun.svg';
        super.prepareData();

        const itemData = this.data.data || {};

        itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.oddity.newOddity");
        itemData.notes = itemData.notes || "";
    }
}