/* Dice roll for Numenera

Rolls a d20 and then determines your success level. Handles 1s, 19s and 20s too.
*/
export function numeneraRoll(levelModifier = 0) {
  const d20 = new Roll("d20").roll();

  d20.level = Math.floor(d20.total / 3) + levelModifier;


  return d20;
}

export function rollText(dieRoll) {
  switch (dieRoll) {
    case 1:
      return {
        text: "GM Intrusion",
        color: 0x000000,
      }

    case 19:
      return {
        text: "Minor Effect",
        color: 0x000000,
      }

    case 20:
      return {
        text: "Major Effect",
        color: 0x000000,
      }

    default:
      return null;
  }
}
