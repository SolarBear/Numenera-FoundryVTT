export class NumeneraOddityItem extends Item {
    get type() {
        return "oddity";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data || {};

        itemData.name = this.data.name || "New Oddity";
        itemData.notes = itemData.notes || "";
    }
}