/**
 * Roll initiative for one or multiple Combatants within the Combat entity
 * An override of the stock function inside Foundry with Numenera-specific features, some decision-making is
 * done by the individual actors now
 *
   * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
   * @param {string|null} [formula]   A non-default initiative formula to roll. Otherwise the system default is used.
   * @param {boolean} [updateTurn]    Update the Combat turn after adding new initiative scores to keep the turn on
   *                                  the same Combatant.
   * @param {object} [messageOptions] Additional options with which to customize created Chat Messages
   * @return {Promise<Combat>}        A promise which resolves to the updated Combat entity once updates are complete.
 */
export async function rollInitiative(args) {
  //TODO remove this middle-man
    return rollInitiative07.apply(this, args);
}

async function rollInitiative07(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
  // Structure input data
  ids = typeof ids === "string" ? [ids] : ids;
  if (!ids)
    return this;

  const currentId = this.combatant._id;

  // Iterate over Combatants, performing an initiative roll for each
  const [updates, messages] = ids.reduce(
    (results, id, i) => {
      let [updates, messages] = results;

      // Get Combatant data
      const c = this.getCombatant(id);
      if (!c || !c.isOwner) return results;

      // Roll initiative
      const rollData = c.actor ? c.actor.getRollData() : {};

      const cf = formula || this._getInitiativeFormula(c);
      const roll = new Roll(cf, rollData).roll();
      updates.push({ _id: id, initiative: roll.total });

      // In Numenera, initiative is fixed for NPCs so don't spam the chat with constant values!
      if (c.actor.data.type === "pc") {
        // Determine the roll mode
        let rollMode =  messageOptions.rollMode || game.settings.get("core", "rollMode");

        const hidden = c.token.hidden || c.hidden;
        if (hidden && rollMode === "roll")
          rollMode = "gmroll";

        // Construct chat message data
        let messageData = mergeObject({
            speaker: {
              scene: canvas.scene._id,
              actor: c.actor ? c.actor._id : null,
              token: c.token._id,
              alias: c.token.name,
            },
            flavor: `${c.token.name} ${game.i18n.localize("NUMENERA.pc.initiativeRoll")}`,
            flags: {"core.initiativeRoll": true},
          },
          messageOptions
        );

        const chatData = roll.toMessage(messageData, {
          rollMode,
          create: false,
        });

        if (i > 0)
          chatData.sound = null; // Only play 1 sound for the whole set

        messages.push(chatData);
      }

      // Return the Roll and the chat data
      return results;
    },
    [[], []]
  );
  if (!updates.length)
    return this;

  // Update multiple combatants
  await this.updateEmbeddedEntity("Combatant", updates);

  // Ensure the turn order remains with the same combatant
  if (updateTurn)
    await this.update({ turn: this.turns.findIndex((t) => t._id === currentId) });

  // Create multiple chat messages
  await CONFIG.ChatMessage.entityClass.create(messages);

  // Return the updated Combat
  return this;
};

/**
 * Acquire the default dice formula which should be used to roll initiative for a particular combatant.
 * In the case of Numenera, the Actor provides its own formula, which changes from PCs to NPCs.
 *
 * @param {Object} combatant      Data for the specific combatant for whom to acquire an initiative formula. This
 *                                is not used by default, but provided to give flexibility for modules and systems.
 * @return {string}               The initiative formula to use for this combatant.
 */
export function getInitiativeFormula(combatant) {
  return combatant.actor.getInitiativeFormula();
}
