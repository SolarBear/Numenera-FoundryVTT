import { Migrator } from "./Migrator.js";
import { NumeneraItem } from "../item/NumeneraItem.js";

//Keep migrators in order: v1 to v2, v2 to v3, etc.
const PCActorv1ToV2Migrator = Object.create(Migrator);

PCActorv1ToV2Migrator.forVersion = 2;
PCActorv1ToV2Migrator.forType = "pc";

/* Summary of changes:
* - the "numenera" property was removed: oddities, cyphers and artifacts are now
    Items. For every one, an Item wil be added to the registry as well as an
    owned item to the PC. Replacement numenera Items are created as best as possible
    but since they were simple blocks of text, there isn't much guesswork possible.
  - the effort property has been added, it was previously computed from existing
    but right now I want to avoid automating too much stuff
*/
PCActorv1ToV2Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  if (actor.data.data.numenera) {
    if (actor.data.data.numenera.oddities) {
      //Create pseudo-objects by splitting the text as different oddities
      const oddityLines = actor.data.data.numenera.oddities
        .split(/\r?\n/)
        .filter(Boolean);

      for (let oddity of oddityLines) {
        await actor.createOwnedItem({
            name: oddity,
            type: "oddity",
            data: {
              description: oddity,
              version: 2,
            }
        });

        await NumeneraItem.create({
          name: oddity,
          type: "oddity",
          data: {
            description: oddity,
            version: 2,
          }
        });
      }
    }

    if (actor.data.data.numenera.artifacts) {
      //Create pseudo-objects by splitting the text as different artifacts
      const artifactLines = actor.data.data.numenera.artifacts
        .split(/\r?\n/)
        .filter(Boolean);

      for (let artifact of artifactLines) {
        await actor.createOwnedItem({
          name: artifact,
          type: "artifact",
          data: {
            description: artifact,
            identified: true,
            version: 2,
          }
        });

        await NumeneraItem.create({
            name: artifact,
            type: "artifact",
            data: {
              description: artifact,
              version: 2,
            }
        });
      }
    }

    if (actor.data.data.numenera.cyphers) {
      //Create pseudo-objects by splitting the text as different cyphers
      const cypherLines = actor.data.data.numenera.cyphers
        .split(/\r?\n/)
        .filter(Boolean);

      for (let cypher of cypherLines) {
        await actor.createOwnedItem({
            name: cypher,
            type: "cypher",
            data: {
              description: cypher,
              identified: true,
              version: 2,
            }
        });

        await NumeneraItem.create({
          name: cypher,
          type: "cypher",
          data: {
            description: cypher,
            version: 2,
          }
        });
      }
    }

    //We can now remove the old property
    newData["data.-=numenera"] = null;
  }

  //Add an Effort property if one does not exist, it's computed automatically
  if (!actor.data.data.hasOwnProperty("effort"))
    newData["data.effort"] = 1;

  newData["data.version"] = this.forVersion;

  return newData;
};

const PCActorv2ToV3Migrator = Object.create(Migrator);

PCActorv2ToV3Migrator.forVersion = 3;
PCActorv2ToV3Migrator.forType = "pc";

/* Summary of changes:
* - added "damage track" property to PC actors
*/
PCActorv2ToV3Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  newData["data.damageTrack"] = 0;
  newData["data.version"] = this.forVersion;

  return newData;
};

const PCActorv3ToV4Migrator = Object.create(Migrator);

PCActorv3ToV4Migrator.forVersion = 4;
PCActorv3ToV4Migrator.forType = "pc";

/* Summary of changes:
* - abilities and skills are now full-blown items so create skill Items
    from existing POJOs and then delete the properties
*/
PCActorv3ToV4Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  for (let [name, ability] of Object.entries(actor.data.data.abilities)) {
    const data = {
      cost: ability.cost,
      notes: ability.description,
      version: 3, //this is an Item version
    };

    await actor.createOwnedItem({
        name,
        type: "ability",
        data
    });

    //Create an Item skill if none already exists with the same name
    const existingAbility = actor.getEmbeddedCollection("OwnedItem").find(i => i.name === name);

    if (!existingAbility) {
      await NumeneraItem.create({
        name,
        type: "ability",
        data
      });
    }
  }

  for (let [name, skill] of Object.entries(actor.data.data.skills)) {
    await actor.createOwnedItem({
        name,
        type: "skill",
        data: {
          stat: skill.stat,
          inability: skill.inability,
          trained: skill.trained,
          specialized: skill.specialized,
        }
    });

    //Create an Item skill if none already exists with the same name
    const existingSkill = actor.getEmbeddedCollection("OwnedItem").find(i => i.name === name);

    if (!existingSkill) {
      await NumeneraItem.create({
        name,
        type: "skill",
        data: {
          stat: skill.stat,
          inability: skill.inability,
          trained: skill.trained,
          specialized: skill.specialized,
        }
      });
    }
  }

  newData["data.-=abilities"] = null;
  newData["data.-=skills"] = null;
  newData["data.version"] = this.forVersion;

  return newData;
};

const PCActorv4ToV5Migrator = Object.create(Migrator);

PCActorv4ToV5Migrator.forVersion = 5;
PCActorv4ToV5Migrator.forType = "pc";

/* Summary of changes:
  - recoveries change to an integer total instead of being individual boolean flags
*/
PCActorv4ToV5Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  if (actor.data.data.recoveries) {
    let recoveriesLeft;
    if (actor.data.data.recoveries.tenHours)
      recoveriesLeft = 0;
    else if (actor.data.data.recoveries.oneHour)
      recoveriesLeft = 1;
    else if (actor.data.data.recoveries.tenMin)
      recoveriesLeft = 2;
    else if (actor.data.data.recoveries.action)
      recoveriesLeft = 3;
    else
      recoveriesLeft = 4;

    newData["data.recoveriesLeft"] = recoveriesLeft;
    newData["data.-=recoveries"] = null;
  }

  //These properties have been renamed
  newData["data.stats.might.pool.value"] = actor.data.data.stats.might.pool.current;
  newData["data.stats.might.pool.max"] = actor.data.data.stats.might.pool.maximum;
  newData["data.stats.speed.pool.value"] = actor.data.data.stats.speed.pool.current;
  newData["data.stats.speed.pool.max"] = actor.data.data.stats.speed.pool.maximum;
  newData["data.stats.intellect.pool.value"] = actor.data.data.stats.intellect.pool.current;
  newData["data.stats.intellect.pool.max"] = actor.data.data.stats.intellect.pool.maximum;
  newData["data.-=stats.might.pool.current"] = null;
  newData["data.-=stats.might.pool.maximum"] = null;
  newData["data.-=stats.speed.pool.current"] = null;
  newData["data.-=stats.speed.pool.maximum"] = null;
  newData["data.-=stats.intellect.pool.current"] = null;
  newData["data.-=stats.intellect.pool.maximum"] = null;

  return newData;
};

const PCActorv5ToV6Migrator = Object.create(Migrator);

PCActorv5ToV6Migrator.forVersion = 6;
PCActorv5ToV6Migrator.forType = "pc";

/* Summary of changes:
  - foci now become an object to allow various key/value pairs; this will be use
    to support The Strange, which requires PCs to have a different Focus in
    each Recursion they live in; this will ease, later on, adding Focus Items
    into the system \o/
*/
PCActorv5ToV6Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  //Transform current focus property into an object
  const focusBackup = actor.data.data.focus;

  newData["data.focus"] = {
    "": focusBackup,
  };

  return newData;
};

const PCActorv5ToV6Migrator = Object.create(Migrator);

PCActorv5ToV6Migrator.forVersion = 6;
PCActorv5ToV6Migrator.forType = "pc";

/* Summary of changes:
  - foci now become an object to allow various key/value pairs; this will be use
    to support The Strange, which requires PCs to have a different Focus in
    each Recursion they live in; this will ease, later on, adding Focus Items
    into the system \o/
*/
PCActorv5ToV6Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  //Transform current focus property into an object
  const focusBackup = actor.data.data.focus;

  newData["data.focus"] = {
    "": focusBackup,
  };
    
  return newData;
};

//Only export the latest migrator
export const PCActorMigrator = PCActorv5ToV6Migrator;
