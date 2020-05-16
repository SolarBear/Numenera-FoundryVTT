export class NumeneraEquipmentItem extends Item {
    get type() {
        return "equipment";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data || {};

        itemData.name = this.data.name || "New Equipment";
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";
    }
}