export class NumeneraCypherItem extends Item {
    get type() {
        return "cypher";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data || {};

        itemData.name = this.data.name || "New Cypher";
        itemData.level = itemData.level || null;
        itemData.levelDie = itemData.levelDie || "";
        itemData.form = itemData.form || "";
        itemData.range = itemData.range || "Immediate";
        itemData.effect = itemData.effect || "";

        //For v1 players
        itemData.cypherType = itemData.cypherType || "Anoetic";
    }
}