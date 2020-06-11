export function confirmDeletion(subject) {
  return new Promise((resolve, reject) => {
    new Dialog({
      title: game.i18n.localize("NUMENERA.dialog.confirmDeletion.title"),
      content: `${game.i18n.localize("NUMENERA.dialog.confirmDeletion.text")} ${subject}?`,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("NUMENERA.dialog.confirmDeletion.ok"),
          callback: () => resolve(true)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("NUMENERA.dialog.confirmDeletion.cancel"),
          callback: () => resolve(false)
        },
      },
      default: "cancel",
      close: () => resolve(false),
    }, {classes: ["numenera", "dialog"]}).render(true);
  });
}
