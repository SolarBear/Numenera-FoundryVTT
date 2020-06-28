import { Migrator } from "./Migrator.js";
import { NumeneraItem } from "../item/NumeneraItem.js";

//Keep migrators in order: v1 to v2, v2 to v3, etc.
const NPCActorv1ToV2Migrator = Object.create(Migrator);

NPCActorv1ToV2Migrator.forVersion = 2;
NPCActorv1ToV2Migrator.forType = "npc";

/* Summary of changes:
* - NPC attacks are now items, which will make them easier to manage internally
* - the various properties related to NPC descritions (use, loot, etc) have
    been moved to a single "info" property
*/
NPCActorv1ToV2Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  //Convert attack POJOs into Items
  const attacks = Object.values(actor.data.data.attacks);
  for (let attack of attacks) {
    await actor.createOwnedItem({
        type: "npcAttack",
        data: {
          notes: attack.description,
        }
    });
  }

  newData["data.-=attacks"] = null;

  let newInfo = "";
  if (actor.data.data.use)
    newInfo += `<h1>Use<h1>\n${actor.data.data.use}\n`;

  if (actor.data.data.interaction)
    newInfo += `<h1>Interaction</h1>\n${actor.data.data.interaction}\n`;

  if (actor.data.data.loot)
    newInfo += `<h1>Loot</h1>\n${actor.data.data.loot}\n`;

  newData["data.info"] = newInfo;
  newData["data.-=combat"] = null;
  newData["data.-=environment"] = null;
  newData["data.-=motive"] = null;
  newData["data.-=gmIntrusion"] = null;
  newData["data.-=interaction"] = null;
  newData["data.-=use"] = null;
  newData["data.-=loot"] = null;
  
  newData["data.version"] = this.forVersion;
    
  return newData;
};

//Only export the latest migrator
export const NPCActorMigrator = NPCActorv1ToV2Migrator;
