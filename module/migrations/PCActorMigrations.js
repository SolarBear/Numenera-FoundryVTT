import { Migrator } from "./Migrator.js";
import { NumeneraPCActor } from "../actor/NumeneraPCActor.js";
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
PCActorv1ToV2Migrator.migrationFunction = async function(actor) {
  
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

    //We can now remove the old Actor property
    delete actor.data.data.numenera;
  }

  //Add an Effort property if one does not exist, it's computed automatically
  if (!actor.data.data.hasOwnProperty("effort"))
    actor.data.data.effort = 1;

  await NumeneraPCActor.update(actor.data);
    
  return actor;
};


//Only export the latest migrator
export const PCActorMigrator = PCActorv1ToV2Migrator;
