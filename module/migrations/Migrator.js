/*
Behold... THE ALL-MIGHTY Migrator OBJECT

Its job is to take a single Entity object (Actor, Item, etc.) and upgrade it. It assumes that
every monitored object has a "version" field whose value is an integer whose value is >= 0.

To keep things simple, you need simply expose a single object: each Migrator can have a link
to the previous one and the Migrator will take care of calling the previous Migrator if it's
aware of it.

Version numbers MUST NOT be updated inside the function, the Migrator itself will handle
the process. 

Migration functions receive a copy of the original so don't worry about mutating
*/

//All of these properties are mandatory
export const Migrator = {
  //Target version: will only handle migrating from (forVersion - 1) to forVersion
  forVersion: null,

  //Type to be handled, base class of the object - be as specific as possible
  forType: null,

  //Optional: previous Migrator object so they can chained together
  previousMigrator: null,
  
  //Function that performs the actual migration from version N-1 to N
  migrationFunction: null,

  //Migrate function: will take an object and migrate it
  migrate: async function (obj) {
    //Sanity checks
    if (!this.forVersion)
      throw new Error("No forVersion specified");
    else if (!this.forType)
      throw new Error("No forType specified");
    else if (!this.migrationFunction)
      throw new Error("No migrationFunction specified");

    //If there is a previous migration...
    if (this.previousMigrator !== null) {
      //Ensure the previous migration handles the previous version number
      if (this.forVersion - 1 !== this.previousMigrator.forVersion)
        throw new Error("Previous migrator does not have the preceding wrong version number");
      //Ensure the previous migration handles the same type of object
      else if (this.forType !== this.previousMigrator.forType)
        throw new Error("Previous migrator has the wrong type");
    }

    if (!(obj instanceof this.forType))
      throw new Error("Wrong migrator type for object");

    //Migration already performed?
    if (obj.data.data.version >= this.forVersion)
      return null;

    let data = {};

    //Make sure there weren't previous migrations to perform
    if (obj.data.data.version < this.forVersion - 1) {
      if (this.previousMigrator && this.previousMigrator.forVersion < this.forVersion) {
        data = this.previousMigrator.migrate(obj);
      } else {
        console.log(`No migration found for ${this.forType} version ${this.forVersion}`);
      }
    }

    const updatedObject = await this.migrationFunction(obj, data);
    if (updatedObject)
      updatedObject["data.version"] = this.forVersion;

    return updatedObject;
  }
};
