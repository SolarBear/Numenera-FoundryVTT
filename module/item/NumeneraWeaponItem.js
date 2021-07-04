import { NumeneraSkillItem } from "./NumeneraSkillItem.js";
import { NUMENERA } from '../config.js';

export class NumeneraWeaponItem extends Item {

    static get type() {
        return "weapon";
    }

    prepareData() {
        super.prepareData();

        // Override common default icon
        if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
            this.data.img = 'icons/svg/sword.svg';

        let itemData = this.data.data || {};

        const desc = Object.getOwnPropertyDescriptor(itemData, "name");
        if (desc && desc.writable)
            itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.weapon.newWeapon");

        itemData.ammo = itemData.ammo || 0;
        itemData.damage = itemData.damage || 1;
        itemData.range = itemData.range || Object.values(NUMENERA.ranges)[0];
        itemData.weaponType = itemData.weaponType || Object.values(NUMENERA.weaponTypes)[0];
        itemData.weight = itemData.weight || Object.values(NUMENERA.weightClasses)[0];
        itemData.notes = itemData.notes || "";

        itemData.ranges = NUMENERA.ranges;

        itemData.weightClasses = Object.entries(NUMENERA.weightClasses).map(entry => {
            const [weightClass, label] = entry;
            return {
                weightClass,
                label,
                checked: weightClass === itemData.weight,
            }
        });

        itemData.weaponTypes = Object.entries(NUMENERA.weaponTypes).map(entry => {
            const [weaponType, label] = entry;
            return {
                weaponType,
                label,
                checked: weaponType === itemData.type,
            }
        });
    }

    async use() {
        //An ability must be related to an Actor to be used
        if (this.actor === null) {
            return ui.notifications.error(game.i18n.localize("NUMENERA.item.ability.useNotLinkedToActor"));
        }

        const skillName = `${game.i18n.localize(this.data.data.weight)} ${game.i18n.localize(this.data.data.weaponType)}`;

        //Get the skill related to that ability
        let skill = this.actor.data.items.find(
            i => i.name === skillName && i.type === NumeneraSkillItem.type
        );

        if (!skill) {
            //We can't use NumeneraItem directly here as its inclusion would create a circular dependency
            skill = new CONFIG.Item.documentClass(NumeneraSkillItem.object, { parent: this.actor });

            skill.data.data = skill.data.data || {};
            skill.data.name = skill.data.data.name = skill._data.name = `${game.i18n.localize(this.data.data.weight)} ${game.i18n.localize(this.data.data.weaponType)}`;
        }
        else if (!(skill instanceof NumeneraSkillItem)) {
            skill = await NumeneraSkillItem.fromOwnedItem(skill, null);
        }

        skill.use();
    }
}
