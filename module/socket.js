import { GMIntrusionDialog } from "./apps/GMIntrusionDialog.js";

export function numeneraSocketListeners() {
  game.socket.on("system.numenera", handleGMIntrusion);
}

function handleGMIntrusion(args) {
  //TODO handle types
  const {type, data} = args;
  const {actorId, userIds} = data;

  if (!game.ready || game.user.isGM || !userIds.find(id => id === game.userId))
    return;

  //TODO disable or don't show Refuse button if PC has 0 XP
  const actor = game.actors.entities.find(a => a.data._id === actorId);
  const dialog = new GMIntrusionDialog(actor);
  dialog.render(true);
}
