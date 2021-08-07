/* NOTE
Please keep settings sorted alphabetically, because that's
how Foundry renders them. Thank you!
*/

import { GameFeatures } from "./apps/GameFeatures.js";

export const registerSystemSettings = function() {
  //To use any of these settings in the code, use:
  //game.settings.get("numenera", "SETTING_NAME");

  game.settings.register("numenera", "defaultToTaskDialog", {
    name: "Use Task dialog by default",
    hint: "If enabled, will invert the behavior of roll buttons macros: clicking one will open the Task dialog and Ctrl+Click will perform a regular roll.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("numenera", "initiativeSkill", {
    name: "Initiative Skill",
    hint: "Skill name to use for initiative. When rolling for initiative, the skill with that name will be used if it exists.",
    scope: "client",
    config: true,
    type: String,
    default: "Initiative",
  });

  game.settings.register("numenera", "armorTrainingAbility", {
    name: "Armor Skill",
    hint: "Ability name to look for as armor training, reducing armor penalties by 1 step.",
    scope: "client",
    config: true,
    type: String,
    default: "Trained in Armor",
  });

  game.settings.register("numenera", "armorSpecializationAbility", {
    name: "Armor Skill",
    hint: "Ability name to look for as armor specialization, reducing armor penalties by 2 steps.",
    scope: "client",
    config: true,
    type: String,
    default: "Mastery with Armor",
  });

  game.settings.register("numenera", "gameFeaturesPreset", {
    name: "Game Features Preset",
    label: "Game Features Preset",
    hint: "Some feature presets for various game. You can always choose to override individual settings after setting a preset.",
    icon: "",
    scope: "world",
    type: String,
    default: "custom",
    restricted: true,
  });

  game.settings.registerMenu("numenera", "gameFeatures", {
    name: "Game Features",
    label: "Game Features",
    hint: "Use game presets or toggle individual game features such as oddities, recursions, power shifts, etc.",
    icon: "fa fa-bars",
    type: GameFeatures,
    restricted: true,
  });

  /**
   * Configure what version of armor-wearing penalty to use
   */
  game.settings.register("numenera", "armorPenalty", {
    name: "Armor Penalty",
    hint: "Select the type of armor penalty to use",
    scope: "world",
    config: true,
    type: String,
    default: "new",
    choices: {
      "new": "Increase Speed Effort cost",
      "old": "Reduce Speed pool, Might cost per hour",
      "none": "Don't take armor penalties into account for rolls and calculations",
    },
  });

  game.settings.register("numenera", "cypherTypesFlavor", {
    name: "Cypher Types",
    hint: "Select the cypher types you wish to use.",
    scope: "world",
    config: true,
    type: Number,
    default: 1,
    choices: {
      1: "None (Numenera v2)",
      2: "Anoetic/occultic (Numenera, The Strange)", 
      3: "Subtle/fantastic/manifest (Cypher System)",
    },
  });

  /**
   * Configure d20-rolling options
   */
  game.settings.register("numenera", "d20Rolling", {
    name: "d20 rolling",
    hint: "Select the behavior of rolls made from the character sheet or macros",
    scope: "world",
    config: true,
    type: String,
    default: "addModifiers",
    choices: {
      "taskLevels": "Output plain task level success without modifiers",
      "addModifiers": "Output task level success, adding any modifiers (eg. skill level)",
    },
  });

  /**
   * Allow out of order use of recoveries
   */
  game.settings.register("numenera", "outOfOrderRecovery", {
    name: "Out of order Recovery use",
    hint: "Allow use of recoveries in any order. A popular house rule.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  const permissionChoices = {};
  permissionChoices[CONST.USER_ROLES.PLAYER] = "PLAYER";
  permissionChoices[CONST.USER_ROLES.TRUSTED] = "TRUSTED";
  permissionChoices[CONST.USER_ROLES.ASSISTANT] = "ASSISTANT";
  permissionChoices[CONST.USER_ROLES.GAMEMASTER] = "GAMEMASTER";

  /**
   * Configure numenera items editing
   */
  game.settings.register("numenera", "cypherArtifactEdition", {
    name: "Numenera item editing permissions",
    hint: "Select the minimum level a user must have to edit a PC's cyphers, artifacts, etc.",
    scope: "world",
    config: true,
    type: Number,
    default: CONST.USER_ROLES.GAMEMASTER,
    choices: permissionChoices,
  });

  /**
   * Configure distance settings
   */
  game.settings.register("numenera", "measureDistanceInUnits", {
    name: "Measurement Units",
    hint: "Select the measurement unit of your game to get a distance annotation when using the ruler.",
    scope: "world",
    config: true,
    type: String,
    default: "meters",
    choices: {
      "none": "None",
      "NUMENERA.units.feet": "Feet",
      "NUMENERA.units.meters": "Meters",
    }
  });

  /**
   * Configure whether or not to show skill icons
   */
  game.settings.register("numenera", "showSkillIcons", {
    name: "Skill Icons",
    hint: "Enable to show skill icons in player character sheets",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Configure whether or not to show ability icons
   */
  game.settings.register("numenera", "showAbilityIcons", {
    name: "Ability Icons",
    hint: "Enable to show ability icons in player character sheets",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Configure whether or not to show numenera icons
   */
  game.settings.register("numenera", "showCypherIcons", {
    name: "Numenera Icons",
    hint: "Enable to show cypher and similar items' (eg. artifact, oddity, etc.) icons in player character sheets",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Configure whether or not to show numenera icons
   */
  game.settings.register("numenera", "showEquipmentIcons", {
    name: "Equipment Icons",
    hint: "Enable to show weapon, armor, and miscellaneous item icons in player character sheets",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Configure whether or not to show numenera icons
   */
  game.settings.register("numenera", "showPowerShiftIcons", {
    name: "Power Shift Icons",
    hint: "Enable to show power shift icons in player character sheets",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Configure whether or not to use oddities
   */
  game.settings.register("numenera", "useOddities", {
    name: "Feature: Oddities",
    hint: "Enable the use of Oddities in your game.",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  /**
   * Configure whether or not to use Power Shifts
   */
  game.settings.register("numenera", "usePowerShifts", {
    name: "Feature: Power Shifts",
    hint: "Enable the use of Power Shifts in your game.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  /**
   * Configure whether or not to use Recursions
   */
  game.settings.register("numenera", "useRecursions", {
    name: "Feature: Recursions",
    hint: "Enable the use of Recursions in your game.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  /**
   * Configure whether or not to use Spells
   */
  game.settings.register("numenera", "useSpells", {
    name: "Feature: Spells",
    hint: "Enable the use of Spells in your game, as a sub-type of Abilities.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  /**
   * Configure whether or not to show skill icons
   */
  game.settings.register("numenera", "currency", {
    name: "Currency Name",
    hint: "How currency is named in your game world: shins, dollars, gold coins, gazoogous, etc.",
    scope: "world",
    config: true,
    type: String,
    default: "Shins"
  });

  game.settings.register("numenera", "trademarkNotice", {
    name: "Trademark Notice",
    hint: "The Monte Cook Games logo, Numenera, and the Numenera logo are trademarks of Monte Cook Games, LLC in the U.S.A. and other countries. All Monte Cook Games characters and character names, and the distinctive likenesses thereof, are trademarks of Monte Cook Games, LLC. Content on this site or associated files derived from Monte Cook Games publications is © 2013-2019 Monte Cook Games, LLC. Monte Cook Games permits web sites and similar fan-created publications for their games, subject to the policy given at http://www.montecookgames.com/fan-use-policy/. The contents of this site are for personal, non-commercial use only. Monte Cook Games is not responsible for this site or any of the content, that did not originate directly from Monte Cook Games, on or in it. Use of Monte Cook Games’s trademarks and copyrighted materials anywhere on this site and its associated files should not be construed as a challenge to those trademarks or copyrights. Materials on this site may not be reproduced or distributed except with the permission of the site owner and in compliance with Monte Cook Games policy given at http://www.montecookgames.com/fan-use-policy/.",
    scope: "world",
    config: true,
    type: null,
    default: null
  });
}
