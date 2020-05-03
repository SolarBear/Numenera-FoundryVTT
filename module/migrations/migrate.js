import * from "./ActorMigrations.js";

export function migrateWorld() {
  ui.notifications.info(`Applying Numenera System Migration (TM) for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

  const actors = game.actors.entities;

  actors.map
}
