import { NumeneraArtifactItemSheet } from "./NumeneraArtifactItemSheet.js";
import { NumeneraArmorItemSheet } from "./NumeneraArmorItemSheet.js";
import { NumeneraCypherItemSheet } from "./NumeneraCypherItemSheet.js";
import { NumeneraEquipmentItemSheet } from "./NumeneraEquipmentItemSheet.js";
import { NumeneraOddityItemSheet } from "./NumeneraOddityItemSheet.js";
import { NumeneraWeaponItemSheet } from "./NumeneraWeaponItemSheet.js";

export class NumeneraItemSheet extends ItemSheet {
    constructor(data, options) {
        super(data, options);

        const { type } = data;
        if (!type)
            throw new Error('No item sheet type provided');

        //First, create an object of the appropriate type...
        let object = null;
        switch (type) {
            case "armor":
                object = new NumeneraArmorItemSheet(data, options);
                break;
            case "artifact":
                object = new NumeneraArtifactItemSheet(data, options);
                break;
            case "cypher":
                object = new NumeneraCypherItemSheet(data, options);
                break;
            case "equipment":
                object = new NumeneraEquipmentItemSheet(data, options);
                break;
            case "oddity":
                object = new NumeneraOddityItemSheet(data, options);
                break;
            case "weapon":
                object = new NumeneraWeaponItemSheet(data, options);
                break;
        }

        if (object === null)
            throw new Error(`Unhandled object type ${type}`);

        //...then merge that object into the current one
        mergeObject(this, object);
    }
}