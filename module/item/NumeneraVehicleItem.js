export class NumeneraVehicleItem extends Item {
    static get type() {
        return "vehicle";
    }

    prepareData() {
		// Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/sun.svg';
        super.prepareData();

        let itemData = this.data;
        if (itemData.hasOwnProperty("data"))
          itemData = itemData.data;

        itemData.name = this.data.name || "VEHICLE";
        itemData.notes = itemData.notes || "";
        itemData.level = itemData.level || "";
        itemData.depletion = itemData.depletion || {
          isDepleting: true,
          die: "d6",
          threshold: 1
      };
    }
}
