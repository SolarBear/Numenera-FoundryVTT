/**
 * Use an Item macro created by an Item drop.
 * @param {string} itemId
 * @return {Promise}
 */
export function useItemMacro(actorId, itemId) {
  const actor = game.actors.entities.find(a => a.id === actorId);
  return actor.useItemById(itemId);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createNumeneraMacro(data, slot) {
    if (data.type !== "Item")
        return;

    if (!("data" in data))
        return ui.notifications.warn(game.i18n.localize("NUMENERA.macro.create.onlyOwned"));

    const item = data.data;

    // Create the macro command
    const command = `game.numenera.useItemMacro("${data.actorId}", "${item.id}");`;

    let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command: command,
        flags: { "numenera.itemMacro": true }
      });
    }

    game.user.assignHotbarMacro(macro, slot);

    return false;
  }
