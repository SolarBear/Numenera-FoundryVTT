export class NumeneraCypherItem extends Item {
    get type() {
        return "cypher";
    }

    prepareData() {
		// Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/pill.svg';
		
        super.prepareData();

        const itemData = this.data.data || {};

        itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.cypher.newCypher");
        itemData.level = itemData.level || null;
        itemData.levelDie = itemData.levelDie || "";
        itemData.form = itemData.form || "";
        itemData.range = itemData.range || "Immediate";
        itemData.effect = itemData.effect || "";

        //For v1 players
        itemData.cypherType = itemData.cypherType || "Anoetic";
    }
}