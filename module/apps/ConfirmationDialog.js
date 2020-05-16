export function confirmDeletion(subject) {
  return new Promise((resolve, reject) => {
    new Dialog({
      title: `Confirm Delete`,
      content: `Do you really want to delete this ${subject}?`,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "OK",
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
