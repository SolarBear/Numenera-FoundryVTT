import { NumeneraArtifactItem } from "./NumeneraArtifactItem.js";
import { NumeneraArmorItem } from "./NumeneraArmorItem.js";
import { NumeneraCypherItem } from "./NumeneraCypherItem.js";
import { NumeneraEquipmentItem } from "./NumeneraEquipmentItem.js";
import { NumeneraOddityItem } from "./NumeneraOddityItem.js";
import { NumeneraWeaponItem } from "./NumeneraWeaponItem.js";

/**
 * Numenera item base class
 * 
 * Acts as a mix of factory and proxy: depending on its "type" argument,
 * creates an object of the right class (also extending Item) and simply
 * overrides its own properties with that of that new objects.
 * 
 * This is used since Item doesn't really allow for real inheritance, so
 * we're simply faking it. #yolo #ididntchoosethethuglife
 *
 * @export
 * @class NumeneraItem
 * @extends {Item}
 */
export class NumeneraItem extends Item {
    static get ClassTypeMap()  {
        return {
        "armor": NumeneraArmorItem,
        "artifact": NumeneraArtifactItem,
        "cypher": NumeneraCypherItem,
        "equipment": NumeneraEquipmentItem,
        "oddity": NumeneraOddityItem,
        "weapon": NumeneraWeaponItem
        };
    };

    constructor(data, options = {}) {
        super(data, options);

        const { type } = data;
        if (!type)
            throw new Error('No object type provided');

        if (data.__proto__.constructor === Object)
        {
            //First, create an object of the appropriate type...
            let object = null;
            switch (type) {
                case "armor":
                    object = new NumeneraArmorItem(data, options);
                    break;
                case "artifact":
                    object = new NumeneraArtifactItem(data, options);
                    break;
                case "cypher":
                    object = new NumeneraCypherItem(data, options);
                    break;
                case "equipment":
                    object = new NumeneraEquipmentItem(data, options);
                    break;
                case "oddity":
                    object = new NumeneraOddityItem(data, options);
                    break;
                case "weapon":
                    object = new NumeneraWeaponItem(data, options);
                    break;
            }

            if (object === null)
                throw new Error(`Unhandled object type ${type}`);

            //...then merge that object into the current one
            mergeObject(this.data, object.data);
        }
    }
}