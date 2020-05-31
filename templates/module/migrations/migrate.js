import { PCActorMigrator } from "./PCActorMigrations.js";
import { ItemMigrator } from "./ItemMigrations.js";

import { NumeneraPCActor } from "../actor/NumeneraPCActor.js";
import { NumeneraItem } from "../item/NumeneraItem.js";

export async function migrateWorld() {
  if (!game.user.isGM)
    return;
  
  const currentPCActorVersion = PCActorMigrator.forVersion;
  const currentNPCActorVersion = 1; //NPCActorMigrator.forVersion;
  const currentItemVersion = Item.forVersion;

  let pcActors = game.actors.entities.filter(actor => actor.data.type === 'pc' && actor.data.data.version < currentPCActorVersion);
  let npcActors = game.actors.entities.filter(actor => actor.data.type === 'npc' && actor.data.data.version < currentNPCActorVersion);
  let items = game.items.entities.filter(item => item.data.data.version < currentItemVersion);

  if (pcActors && pcActors.length > 0 || npcActors && npcActors.length > 0 || items && items.length > 0) {
    ui.notifications.info(`Applying Numenera system migrations. Please be patient and do not close your game or shut down your server.`, {permanent: true});

    try {
      if (pcActors && pcActors.length > 0) {
        const updatedPcData = await Promise.all(pcActors.map(async actor => await PCActorMigrator.migrate(actor)));

        for (let i = 0; i < pcActors.length; i++) {
          await pcActors[i].update(updatedPcData[i]);
        }
        
        console.log("PC actor migration succeeded!");
      }
    } catch (e) {
      console.error("Error in PC migrations", e);
    }

    //No NPC migrations yet
    // try {
    //   if (npcActors)
    //     npcActors = await Promise.all(pcActors.map(async actor => await NPCActorMigrator.migrate(actor)));

            // for (const npcActor of npcActors) {
            //   await NumeneraNPCActor.update(npcActor.data);
            // }

    //     console.log("NPC Actor migration succeeded!");
    // } catch (e) {console.l
    //   console.error("Error in NPC migrations", e);
    // }
    
    //No separate Item migrations yet
    try {
      if (items && items.length > 0) {
        const updatedItems = await Promise.all(items.map(async item => await ItemMigrator.migrate(item)));

        for (let i = 0; i < pcActors.length; i++) {
          await item[i].update(updatedItems[i]);
        }

        console.log("Item migration succeeded!");
      }
    } catch (e) {
      console.error("Error in item migrations", e);
    }

    ui.notifications.info(`Numenera system migration completed!`, {permanent: true});
  }
}
