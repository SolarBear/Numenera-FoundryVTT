export class NumeneraArtifactItem extends Item {
    get type() {
        return "artifact";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data;

        itemData.name = this.data.name || "New Cypher";
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";

        itemData.level = itemData.level || 1;
        itemData.form = itemData.form || "";
        itemData.effect = itemData.effect || "";

        itemData.range = itemData.range || "";

        itemData.depletion = itemData.depletion || {
            isDepleting: true,
            die: "d6",
            threshold: 1
        };
    }
}