export class NumeneraCypherItem extends Item {
    get type() {
        return "cypher";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data;

        itemData.name = this.data.name || "New Cypher";
        itemData.level = itemData.level || 1;
        itemData.form = itemData.form || "";
        itemData.range = itemData.range || "Immediate";
        itemData.effect = itemData.effect || "";
    }
}