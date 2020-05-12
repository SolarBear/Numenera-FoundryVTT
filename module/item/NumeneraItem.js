import { NumeneraAbilityItem } from "./NumeneraAbilityItem.js";
import { NumeneraArtifactItem } from "./NumeneraArtifactItem.js";
import { NumeneraArmorItem } from "./NumeneraArmorItem.js";
import { NumeneraCypherItem } from "./NumeneraCypherItem.js";
import { NumeneraEquipmentItem } from "./NumeneraEquipmentItem.js";
import { NumeneraOddityItem } from "./NumeneraOddityItem.js";
import { NumeneraSkillItem } from "./NumeneraSkillItem.js";
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
export const NumeneraItem = new Proxy(function () {}, {
  //Calling a constructor from this proxy object
  construct: function (target, args) {
    const [data] = args;
    switch (data.type) {
      case "ability":
        return new NumeneraAbilityItem(...args);
      case "armor":
        return new NumeneraArmorItem(...args);
      case "artifact":
        return new NumeneraArtifactItem(...args);
      case "cypher":
        return new NumeneraCypherItem(...args);
      case "equipment":
        return new NumeneraEquipmentItem(...args);
      case "oddity":
        return new NumeneraOddityItem(...args);
      case "skill":
        return new NumeneraSkillItem(...args);
      case "weapon":
        return new NumeneraWeaponItem(...args);
    }
  },
  //Property access on this weird, dirty proxy object
  get: function (target, prop, receiver) {
    switch (prop) {
      case "create":
        //Calling the class' create() static function
        return function (data, options) {
          switch (data.type) {
            case "ability":
              return NumeneraAbilityItem.create(data, options);
            case "armor":
              return NumeneraArmorItem.create(data, options);
            case "artifact":
              return NumeneraArtifactItem.create(data, options);
            case "cypher":
              return NumeneraCypherItem.create(data, options);
            case "equipment":
              return NumeneraEquipmentItem.create(data, options);
            case "oddity":
              return NumeneraOddityItem.create(data, options);
            case "skill":
              return NumeneraSkillItem.create(data, options);
            case "weapon":
              return NumeneraWeaponItem.create(data, options);
          }
        };

      case Symbol.hasInstance:
        //Applying the "instanceof" operator on the instance object
        return function (instance) {
          return (
            instance instanceof NumeneraAbilityItem ||
            instance instanceof NumeneraArmorItem ||
            instance instanceof NumeneraArtifactItem ||
            instance instanceof NumeneraCypherItem ||
            instance instanceof NumeneraEquipmentItem ||
            instance instanceof NumeneraOddityItem ||
            instance instanceof NumeneraSkillItem ||
            instance instanceof NumeneraWeaponItem
          );
        };

      default:
        //Just forward any requested properties to the base Actor class
        return Item[prop];
    }
  },
});
