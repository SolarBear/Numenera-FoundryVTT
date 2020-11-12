export function confirmSpellUse(ability) {
  return new Promise((resolve, reject) => {
    const actor = ability.actor;
    const buttons = {
      time: {
        icon: '<i class="fas fa-check"></i>',
        label: `Spend ${ability.spellCastingTime} to cast it`,
        callback: () => resolve("time"),
      },
    };
  
    //Check if at least one recovery is available
    //Ignore the final, 10-hour one, it cannot be used for spells
    const recoveriesAvailable = actor.data.data.recoveries
                                  .slice(0, actor.data.data.recoveries.length - 1)
                                  .some(Boolean);
  
    if (recoveriesAvailable) {
      buttons.recovery = {
        icon: '<i class="fas fa-check"></i>',
        label: "Spend a Recovery",
        callback: () => resolve("recovery"),
      };
    }
  
    buttons.cancel = {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel",
      callback: () => resolve(false),
    };

    return new Dialog({
      title: "Spell Use",
      content: "You're casting a spell; how do you wish to cast it?",
      buttons,
      default: "cancel",
      close: () => resolve(false),
    }, {classes: ["numenera", "dialog"]}).render(true);
  });
}

export function selectRecoveryToUse(actor) {
  return new Promise((resolve, reject) => {
    //Build the array of available buttons
    //As I'm writing this, recoveries are simply an array of booleans
    //The last 3 are: 10 min, 1h and 10h
    //All of the other first ones are 1 action
    const recoveries = Array.from(actor.data.data.recoveries);
    const actions = recoveries.splice(0, recoveries.length - 3);

    const buttons = {};

    //The buttons will be displayed in the same order they are added
    if (actions.some(Boolean)) {
      //At least one 1-action recovery is available
      buttons.action = {
        icon: '<i class="fas fa-check"></i>',
        label: "Spend 1 Action Recovery",
        callback: () => resolve("1-action"),
      };
    }

    if (recoveries[0]) {
      buttons.tenMinutes = {
        icon: '<i class="fas fa-check"></i>',
        label: "Spend 10-minute Recovery",
        callback: () => resolve("10-minutes"),
      };
    }

    if (recoveries[1]) {
      buttons.oneHour = {
        icon: '<i class="fas fa-check"></i>',
        label: "Spend 1-hour Recovery",
        callback: () => resolve("1-hour"),
      };
    }

    buttons.cancel = {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel",
      callback: () => resolve(false),
    };

    return new Dialog({
      title: "Spell - Use with Recovery",
      content: "Select the Recovery to use",
      buttons,
      default: "cancel",
      close: () => resolve(false),
    }, {classes: ["numenera", "dialog"]}).render(true);
  });
}