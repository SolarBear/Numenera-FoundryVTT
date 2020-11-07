export class NumeneraArtifactItem extends Item {
    static get type() {
        return "artifact";
    }

    async prepareData() {
		// Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/mage-shield.svg';

        super.prepareData();

        let itemData = this.data;
        if (itemData.hasOwnProperty("data"))
          itemData = itemData.data;

        itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.artifact.newArtifact");;
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";
        itemData.form = itemData.form || "";
        itemData.laws = itemData.laws || "";
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

    /**
     * Transform the current artifact so it doesn't look identified.
     *
     * @memberof NumeneraArtifactItem
     */
    asUnidentified() {
        this.name = game.i18n.localize("NUMENERA.pc.numenera.artifact.unidentified");
        this.data.level = game.i18n.localize("NUMENERA.unknown");
        this.data.effect = game.i18n.localize("NUMENERA.unknown");
        this.data.depletion = null;
    }
}
