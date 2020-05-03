
export const Migrator = {
  forVersion: 0,
  forType: null,
  previousMigrator: null,
  migrationFunction: null,
  migrate: object => {
    debugger;

    //Sanity check
    if (!this.forVersion)
      throw new Error("No forVersion specified");
    else if (!this.forType)
      throw new Error("No forObject specified");
    else if (!this.migrationFunction)
      throw new Error("No migrationFunction specified");

    if (object.type !== this.forType) {
      throw new Error("Wrong migrator type for object");
    
    if(object.version >= this.forVersion)
      return object;

    if (object.version < this.forVersion - 1) {
      if (this.previousMigrator) {
        object = this.previousMigrator.migrate(object);
      } else {
        console.warn(`No migration found for ${this.forType} version ${this.forVersion}`);
      }
    }

    return this.migrationFunction(object);
  }
};
