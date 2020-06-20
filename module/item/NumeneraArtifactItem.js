export class NumeneraArtifactItem extends Item {
    static get type() {
        return "artifact";
    }

    async prepareData() {
		// Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/mage-shield.svg';

        super.prepareData();

        const itemData = this.data.data || {};

        itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.artifact.newArtifact");;
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";
        itemData.form = itemData.form || "";
        itemData.effect = itemData.effect || "";
        itemData.range = itemData.range || "";

        itemData.depletion = itemData.depletion || {
            isDepleting: true,
            die: "d6",
            threshold: 1
        };

        itemData.levelDie = itemData.levelDie || "";
        itemData.level = itemData.level || "";
    }
}
