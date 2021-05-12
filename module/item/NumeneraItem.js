import { NumeneraAbilityItem } from "./NumeneraAbilityItem.js";
import { NumeneraArtifactItem } from "./NumeneraArtifactItem.js";
import { NumeneraArmorItem } from "./NumeneraArmorItem.js";
import { NumeneraCypherItem } from "./NumeneraCypherItem.js";
import { NumeneraEquipmentItem } from "./NumeneraEquipmentItem.js";
import { NumeneraOddityItem } from "./NumeneraOddityItem.js";
import { NumeneraNpcAttackItem } from "./NumeneraNPCAttack.js";
import { NumeneraSkillItem } from "./NumeneraSkillItem.js";
import { NumeneraWeaponItem } from "./NumeneraWeaponItem.js";
import { StrangeRecursionItem } from "./StrangeRecursionItem.js";
import { NumeneraPowerShiftItem } from "./NumeneraPowerShiftItem.js";

//Mapping of item type (string) to its related class
const itemMappings = {
  ability: NumeneraAbilityItem,
  armor: NumeneraArmorItem,
  artifact: NumeneraArtifactItem,
  cypher: NumeneraCypherItem,
  equipment: NumeneraEquipmentItem,
  npcAttack: NumeneraNpcAttackItem,
  oddity: NumeneraOddityItem,
  powerShift: NumeneraPowerShiftItem,
  recursion: StrangeRecursionItem,
  skill: NumeneraSkillItem,
  weapon: NumeneraWeaponItem,
};

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
 */
export const NumeneraItem = new Proxy(function () {}, {
  //Calling a constructor from this proxy object
  construct: function (target, args) {
    const [data] = args;

    if (!itemMappings.hasOwnProperty(data.type))
      throw new Error("Unsupported Entity type for create(): " + data.type);

    return new itemMappings[data.type](...args);
  },
  //Property access on this weird, dirty proxy object
  get: function (target, prop, receiver) {  
    switch (prop) {
      case "create":
      case "createDocuments":
        //Calling the class' create() static function
        return function (data, options) {
          if (data.constructor === Array) {
            //Array of data, this happens when creating Actors imported from a compendium
            return data.map(i => NumeneraItem.create(i, options));
          }

          if (!itemMappings.hasOwnProperty(data.type))
            throw new Error("Unsupported Entity type for create(): " + data.type);

          return itemMappings[data.type].create(data, options);
        };
        
      case Symbol.hasInstance:
        //Applying the "instanceof" operator on the instance object
        return function (instance) {
          return Object.values(itemMappings).some(i => instance instanceof i);
        };

      default:
        //Just forward any requested properties to the base Item class
        return Item[prop];
    }
  },
});
