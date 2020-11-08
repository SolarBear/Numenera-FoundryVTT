export function confirmSpellUse() {
  return new Promise((resolve, reject) => {
    new Dialog({
      title: "Spell Use",
      content: "You're casting a spell; how do you wish to cast it?",
      buttons: {
        time: {
          icon: '<i class="fas fa-check"></i>',
          label: "Spend X minutes to cast",
          callback: () => resolve(true)
        },
        recovery: {
          icon: '<i class="fas fa-check"></i>',
          label: "Spend a Recovery",
          callback: () => resolve(true)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => resolve(false)
        },
      },
      default: "cancel",
      close: () => resolve(false),
    }, {classes: ["numenera", "dialog"]}).render(true);
  });
}

export function selectRecoveryToUse() {
  return new Promise((resolve, reject) => {
    new Dialog({
      title: "Spell - Use with Recovery",
      content: "Select the Recovery to use",
      buttons: {
        time: {
          icon: '<i class="fas fa-check"></i>',
          label: "Spend X minutes to cast",
          callback: () => resolve(true)
        },
        recovery: {
          icon: '<i class="fas fa-check"></i>',
          label: "Spend a Recovery",
          callback: () => resolve(true)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => resolve(false)
        },
      },
      default: "cancel",
      close: () => resolve(false),
    }, {classes: ["numenera", "dialog"]}).render(true);
  });
}