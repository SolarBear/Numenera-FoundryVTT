import { NUMENERA } from "../config.js";

const speedPoolReductions = {
    "NUMENERA.N/A": 0,
    "NUMENERA.weightClasses.Light": 2,
    "NUMENERA.weightClasses.Medium": 3,
    "NUMENERA.weightClasses.Heavy": 5,
};

export class NumeneraArmorItem extends Item {
    static get type() {
        return "armor";
    }

    static get object() {
        return {
            type: NumeneraArmorItem.type,
            name: game.i18n.localize("NUMENERA.item.armor.description"),
        }
    }

    static async fromOwnedItem(ownedItem, actor) {
        let armorItem;

        if (actor === null)
            armorItem = new Item(this.object);
        else
            armorItem = await actor.createEmbeddedDocuments("Item", [this.object]);

        armorItem._id = ownedItem._id;
        armorItem.data.name = ownedItem.name;
        armorItem.data.armor = ownedItem.data.armor;
        armorItem.data.notes = ownedItem.data.notes;
        armorItem.data.price = ownedItem.data.price;
        armorItem.data.weight = ownedItem.data.weight;
        armorItem.data.skillLevel = ownedItem.data.skillLevel;
        armorItem.data.additionalSpeedEffortCost = ownedItem.data.additionalSpeedEffortCost;
        armorItem.options.actor = actor;

        armorItem.prepareData();

        return armorItem;
    }

    prepareData() {
        super.prepareData();

        // Override common default icon
        if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
            this.data.img = 'icons/svg/statue.svg';

        let itemData = this.data;
        if (itemData.hasOwnProperty("data"))
            itemData = itemData.data;

        itemData.name = this.data ? this.data.name : game.i18n.localize("NUMENERA.item.armor.description");
        itemData.armor = itemData.armor || 0;
        itemData.weight = itemData.weight || NUMENERA.weightClasses.Light;
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";
        itemData.additionalSpeedEffortCost = itemData.additionalSpeedEffortCost || 0;
    }

    get weightIndex() {
        return Object.entries(NUMENERA.optionalWeightClasses)
            .findIndex(entry => {
                const [weight, label] = entry;
                let itemData = this.data;

                if (itemData.hasOwnProperty("data"))
                    itemData = itemData.data;

                return itemData.weight === label;
            });
    }

    get armorSpeedPoolReduction() {
        if (game.settings.get("numenera", "armorPenalty") !== "old") {
            return 0;
        }

        return speedPoolReductions[this.data.weight];
    }

    get mightCostPerHour() {
        if (game.settings.get("numenera", "armorPenalty") !== "old") {
            return 0;
        }

        //N/A is simply 0, 1 for Light, 2 for Medium, 3 for Heavy
        return this.weightIndex;
    }

    static compareArmorWeights(armor1, armor2) {
        if (!(armor1 instanceof NumeneraArmorItem))
            armor1 = NumeneraArmorItem.fromOwnedItem(armor1);

        if (!(armor2 instanceof NumeneraArmorItem))
            armor2 = NumeneraArmorItem.fromOwnedItem(armor2);

        const weight1 = armor1.weightIndex,
            weight2 = armor2.weightIndex;

        if (weight1 < weight2) {
            return -1;
        }
        else if (weight1 > weight2) {
            return 1;
        }
        else
            return 0;
    }
}
