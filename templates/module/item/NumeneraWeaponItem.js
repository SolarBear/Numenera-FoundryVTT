import { NUMENERA } from '../config.js';

export class NumeneraWeaponItem extends Item {

    get type() {
        return "weapon";
    }

    prepareData() {
	    // Override common default icon
	    if (!this.data.img) this.data.img = 'icons/svg/sword.svg';

        super.prepareData();

        let itemData = this.data.data || {};

        //TODO we're duplicating the name here... why is that?
        const desc = Object.getOwnPropertyDescriptor(itemData, "name");
        if (desc && desc.writable)
            itemData.name = this.data.name || "New Weapon";

        itemData.damage = itemData.damage || 1;
        itemData.range = itemData.range || NUMENERA.ranges[0];
        itemData.weaponType = itemData.weaponType || NUMENERA.weaponTypes[0];
        itemData.weight = itemData.weight || NUMENERA.weightClasses[0];
        itemData.notes = itemData.notes || "";

        itemData.ranges = NUMENERA.ranges;

        itemData.weightClasses = NUMENERA.weightClasses.map(weightClass => {
            return {
                label: weightClass,
                checked: weightClass === itemData.weight,
            }
        });

        itemData.weaponTypes = NUMENERA.weaponTypes.map(weaponType => {
            return {
                label: weaponType,
                checked: weaponType === itemData.type,
            }
        });
    }
}
