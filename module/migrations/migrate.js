import { PCActorMigrator } from "./PCActorMigrations.js";
import { ItemMigrator } from "./ItemMigrations.js";

export async function migrateWorld() {
  if (!game.user.isGM)
    return;
  
  const currentPCActorVersion = PCActorMigrator.forVersion;
  const currentNPCActorVersion = 1; //NPCActorMigrator.forVersion;
  const currentItemVersion = Item.forVersion;

  let pcActors = game.actors.entities.filter(actor => actor.data.type === 'pc' && actor.data.data.version < currentPCActorVersion);
  let npcActors = game.actors.entities.filter(actor => actor.data.type === 'npc' && actor.data.data.version < currentNPCActorVersion);
  let items = game.items.entities.filter(item => item.data.data.version < currentItemVersion);

  if (pcActors || npcActors || items) {
    ui.notifications.info(`Applying Numenera system migrations. Please be patient and do not close your game or shut down your server.`, {permanent: true});

    try {
      if (pcActors) {
        pcActors = await Promise.all(pcActors.map(async actor => await PCActorMigrator.migrate(actor)));
        console.log("PC actor migration succeeded!");
      }
    } catch (e) {
      console.error("Error in PC migrations", e);
    }

    //No NPC migrations yet
    // try {
    //   if (npcActors)
    //     npcActors = await Promise.all(pcActors.map(async actor => await NPCActorMigrator.migrate(actor)));
    //     console.log("NPC Actor migration succeeded!");
    // } catch (e) {
    //   console.error("Error in NPC migrations", e);
    // }
    
    //No separate Item migrations yet
    try {
      if (items) {
        items = await Promise.all(items.map(async item => await ItemMigrator.migrate(item)));
        console.log("Item migration succeeded!");
      }
    } catch (e) {
      console.error("Error in item migrations", e);
    }

    ui.notifications.info(`Numenera system migration completed!`, {permanent: true});
  }
  else {
    console.log("No migrations to apply");
  }
}
