import { NUMENERA } from '../config.js';

export class StrangeRecursionItem extends Item {

    get type() {
        return "recursion";
    }

    prepareData() {
	    // Override common default icon

        super.prepareData();

        let itemData = this.data.data || {};

        //TODO we're duplicating the name here... why is that?
        const desc = Object.getOwnPropertyDescriptor(itemData, "name");
        if (desc && desc.writable)
            itemData.name = this.data.name || "New Recursion";

        itemData.level = itemData.level || 0;
        itemData.laws = itemData.laws || "";
        itemData.race = itemData.race || "";
        itemData.focus = itemData.focus || "";
        itemData.focusAbilities = itemData.focusAbilities || "";
      }
}
