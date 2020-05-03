import { Migrator } from "./Migrator";
import { NumeneraItem } from "../item/NumeneraItem";

const Actorv1ToV2Migrator = Object.create(Migrator);
Actorv1ToV2Migrator.forVersion = 2;
Actorv1ToV2Migrator.forObject = "Actor";
Actorv1ToV2Migrator.migrationFunction = actor => {
  //Create pseudo-objects by splitting the text as different oddities
  actor.data.data.numenera.oddities = actor.data.data.numenera.oddities
    .split(/\r?\n/)
    .map(oddity => NumeneraItem.create({
      name: oddity,
      data: {
        description: oddity
      }
    }));
};