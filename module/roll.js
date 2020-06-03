/* Dice roll for Numenera

Rolls a d20 and then determines your success level.
*/
export function numeneraRoll(level = 0) {
  let formula = "d20";
  if (level) formula += "+" + 3 * level;

  return new Roll(formula).roll();
}

export function rollText(dieRoll) {
  switch (dieRoll) {
    case 1:
      return {
        text: game.i18n.localize("NUMENERA.gmIntrusion"),
        color: 0x000000,
      }

    case 19:
      return {
        text: game.i18n.localize("NUMENERA.minorEffect"),
        color: 0x000000,
      }

    case 20:
      return {
        text: game.i18n.localize("NUMENERA.majorEffect"),
        color: 0x000000,
      }

    default:
      return null;
  }
}
