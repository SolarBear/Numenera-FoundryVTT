export const registerSystemSettings = function() {

  /**
   * Configure the Numenera version being used
   */
  game.settings.register("numenera", "systemVersion", {
    name: "Numenera Version",
    hint: "Select the Numenera version you're using. Version 1 is the original 2013 edition with the orange cover; version 2 is the 2018 split into two books, Discovery and Destiny",
    scope: "world",
    config: true,
    type: Number,
    default: 2,
    choices: {
      1: "Version 1",
      2: "Version 2",
    },
  });

  /**
   * Configure d20-rolling options
   */
  game.settings.register("numenera", "d20Rolling", {
    name: "d20 rolling",
    hint: "Select the behavior of d20 rolls in your game",
    scope: "world",
    config: true,
    type: String,
    default: "taskLevels",
    choices: {
      "taskLevels": "Output task level success instead of numbers",
      "straightNumbers": "Output numbers and modifiers as is",
    },
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
  game.settings.register("numenera", "showNumeneraIcons", {
    name: "Numenera Icons",
    hint: "Enable to show cypher, artifact, and oddity icons in player character sheets",
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
