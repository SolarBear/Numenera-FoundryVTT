/* Dice roll for Numenera

Rolls a d20 and then determines your success level.
*/
export function numeneraRollFormula(level = 0) {
  let formula = "d20";
  if (level > 0) formula += "+" + 3 * level;

  return formula;
}

export function numeneraRoll(level = 0) {
  return new Roll(numeneraRollFormula(level));
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
