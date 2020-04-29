/* Dice roll for Numenera

Rolls a d20 and then determines your success level. Handles 1s, 19s and 20s too.
*/
function numeneraRoll(levelModifier = 0) {
  const d20 = new Roll("d20").roll();

  d20.level = Math.floor(d20.total / 3) + levelModifier;
  switch (d20.total) {
    case 1:
      d20.special = "GM Intrusion";
      break;
    case 19:
      d20.special = "Minor Effect";
      break;
    case 20:
      d20.special = "Major Effect";
      break;
    default:
      d20.special = null;
  }

  return d20;
}

function numeneraRollToChat(levelModifier = 0, topic = "") {
  const roll = numeneraRoll(levelModifier);

  let result = "";
  if (topic)
    result = topic + "<br />";
  
  result = result + `Roll: ${roll.total}<br/>`;
  switch (d20.special) {
    case 1:
      result += "Fumble";
      break;
    case 19:
      result += "Minor Effect";
      break;
    case 20:
      result += "Major Effect";
      break;
    default:
      result += `Level ${level}`;
  }

  const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: result,
  };
  ChatMessage.create(chatData, {});
}

/* Perform a recovery roll, adding the Recovery value if it is found */
const recoveryRoll = () => {
  const recovery = actor ? actor.data.data.recovery : 0;
  const d6 = new Roll(`d6`).roll().total;

  let message = "Recovery: ";
  if (recovery)
    message += `${d6}+${recovery}=${d6+recovery}`;
  else
    message += d6;

  const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: message,
  };
  ChatMessage.create(chatData, {});
}

export { numeneraRoll, numeneraRollToChat, recoveryRoll};