import { Migrator } from "./Migrator.js";
import { NumeneraItem } from "../item/NumeneraItem.js";

//Keep migrators in order: v1 to v2, v2 to v3, etc.
const Itemv1ToV2Migrator = Object.create(Migrator);

Itemv1ToV2Migrator.forVersion = 2;
Itemv1ToV2Migrator.forType = NumeneraItem;

/* Summary of changes:
  - cyphers and artifacts now have a separate "level die" (eg. 1d6+2) and
   "level" (actual level of an item a PC owns)
  - they also get a "identified" property so the GM can give a cypher/artifact
   to a player but only have it identified later
*/
Itemv1ToV2Migrator.migrationFunction = async function(item, obj = {}) {
  const newData = Object.assign({ _id: item._id}, obj);

  if (["artifact", "cypher"].indexOf(item.type) !== -1) {

    if (!item.data.data.hasProperty("identified")) {
      //Current artifacts and cyphers could only have been identified
      //for unowned ones, it's irrelevant
      newData["data.identified"] = item.data.data.isOwned;
    }

    if (!item.data.data.isOwned) {
      //Use current level as "level die" as string
      newData["data.levelDie"] = "" + item.data.data.level;
    }
    //Owned numenera may keep their level and don't need a level die
  }

  newData["data.version"] = this.forVersion;

  return newData;
};

//Keep migrators in order: v1 to v2, v2 to v3, etc.
const Itemv2ToV3Migrator = Object.create(Migrator);

Itemv2ToV3Migrator.forVersion = 3;
Itemv2ToV3Migrator.forType = NumeneraItem;

/* Summary of changes:
  - skill levels are now an integer isntea of being a couple of boolean flags
*/
Itemv2ToV3Migrator.migrationFunction = async function(item, obj = {}) {
  let newData = null;
  
  if (item.type === "skill") {
    newData = Object.assign({ _id: item._id}, obj);

    let skillLevel = 0;
    if (item.data.data.specialized) {
      skillLevel = 2;
    } else if (item.data.data.trained) {
      skillLevel = 1;
    }

    //Inability MUST stay there
    newData["data.skillLevel"] = skillLevel;
    newData["data.-=untrained"] = null;
    newData["data.-=trained"] = null;
    newData["data.-=specialized"] = null;
  }

  return newData;
};

//Only export the latest migrator
export const ItemMigrator = Itemv2ToV3Migrator;
