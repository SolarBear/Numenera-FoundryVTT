import { NPCActorMigrator } from "./NPCActorMigrations.js";
import { PCActorMigrator } from "./PCActorMigrations.js";
import { ItemMigrator } from "./ItemMigrations.js";

export async function migrateWorld() {
  if (!game.user.isGM)
    return;
  
  const currentPCActorVersion = PCActorMigrator.forVersion;
  const currentNPCActorVersion = NPCActorMigrator.forVersion;
  const currentItemVersion = ItemMigrator.forVersion;

  //Actors - split PCs and NPCs as they are completely different
  let pcActors = game.actors.entities.filter(actor => actor.data.type === 'pc' && actor.data.data.version < currentPCActorVersion);
  let npcActors = game.actors.entities.filter(actor => actor.data.type === 'npc' && actor.data.data.version < currentNPCActorVersion);

  //Items - compendium/item directory Items are kept in a different location than Actor-owned Items!
  const nonActorItems = game.items.entities.filter(item => item.data.data.version < currentItemVersion);
  const actorItems = game.actors.entities.map(a => a.items).filter(m => m.size > 0).flatMap(m => Array.from(m.values()));
  const items = [...nonActorItems, ...actorItems];

  if (pcActors && pcActors.length > 0 || npcActors && npcActors.length > 0 || items && items.length > 0) {
    ui.notifications.info(`Applying Numenera system migrations. Please be patient and do not close your game or shut down your server.`, {permanent: true});

    async function migrateCollection(migrator, collection) {
      try {
        if (collection && collection.length > 0) {
          const updatedData = await Promise.all(collection.map(async obj => await migrator.migrate(obj)));
  
          for (let i = 0; i < collection.length; i++) {
            if (updatedData[i] !== null) {
              await collection[i].update(updatedData[i]);
            }
          }
          
          console.log(`${migrator.forType} migration succeeded!`);
        }
      } catch (e) {
        console.error(`Error ${migrator.forType}  migrations`, e);
      }
    }

    migrateCollection(PCActorMigrator, pcActors);
    migrateCollection(NPCActorMigrator, npcActors);
    migrateCollection(ItemMigrator, items);

    ui.notifications.info(`Numenera system migration completed!`, {permanent: true});
  }
}
