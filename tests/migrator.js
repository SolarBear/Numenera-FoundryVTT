import test from 'ava';
import { Migrator } from '../module/migrations/Migrator.js';

class Foo {};

test("A Migrator with no version throws an exception", async t => {
  let error = null;
  try {
    const migrator = Object.assign({}, Migrator);
    migrator.forType = Foo;
    migrator.migrationFunction = () => {};

    const o = {};
  
    await migrator.migrate(o);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "No forVersion specified");
});

test("A Migrator with no type throws an exception", async t => {
  let error = null;
  try {
    const migrator = Object.assign({}, Migrator);
    migrator.forVersion = 1;
    migrator.migrationFunction = () => {};

    const o = {};
  
    await migrator.migrate(o);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "No forType specified");
});

test("A Migrator with no migration function throws an exception", async t => {
  let error = null;
  try {
    const migrator = Object.assign({}, Migrator);
    migrator.forVersion = 1;
    migrator.forType = Foo;

    const o = {};
  
    await migrator.migrate(o);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "No migrationFunction specified");
});

test("A Migrator with a diferent type than the object it receives throws an exception", async t => {
  let error = null;
  try {
    const migrator = Object.assign({}, Migrator);
    migrator.forVersion = 1;
    migrator.forType = Foo;
    migrator.migrationFunction = () => {};

    const o = {
      data: {
        type: "bar",
        data: {
          version: 1,
        },
      },
    };
  
    await migrator.migrate(o);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "Wrong migrator type for object");
});

test("A Migrator for a version that is the same as the object returns null", async t => {
  const migrator = Object.assign({}, Migrator);
  migrator.forVersion = 1;
  migrator.forType = Foo;
  migrator.migrationFunction = (obj) => obj;

  const o = Object.assign(new Foo(), {
    data: {
      type: Foo,
      data: {
        version: 1,
      },
    },
  });

  const migrated = await migrator.migrate(o);

  t.not(o, migrated);
  t.is(null, migrated);
});

test("A Migrator will apply its migration function to the object", async t => {
  const migrator = Object.assign({}, Migrator);
  migrator.forVersion = 2;
  migrator.forType = Foo;
  migrator.migrationFunction = obj => {
    delete obj.data.data.bar;
    obj.data.data.spam = "eggs";
    return obj;
  };

  const o = Object.assign(new Foo(), {
    data: {
      type: Foo,
      data: {
        bar: "baz",
        version: 1,
      },
    },
  });
  
  const migrated = await migrator.migrate(o);

  t.true(o === migrated); //Should be an object copy
  t.false(migrated.data.data.hasOwnProperty("bar"));
  t.is(migrated.data.data.spam, "eggs");
});

test("A Migrator will set its new version number to the object", async t => {
  const migrator = Object.assign({}, Migrator);
  migrator.forVersion = 2;
  migrator.forType = Foo;
  migrator.migrationFunction = (obj) => obj;

  const o = Object.assign(new Foo(), {
    data: {
      type: Foo,
      data: {
        version: 1,
      }
    }
  });

  const migrated = await migrator.migrate(o);

  t.is(migrated["data.version"], 2);
});

test("A Migrator with an embedded Migrator with a different type throws an exception", async t => {
  let error = null;
  try {
    const migrator1 = Object.assign({}, Migrator);
    migrator1.forVersion = 2;
    migrator1.forType = Foo;
    migrator1.migrationFunction = () => {};
  
    const migrator2 = Object.assign({}, Migrator);
    migrator2.forVersion = 3;
    migrator2.forType = "bar";
    migrator2.previousMigrator = migrator1;
    migrator2.migrationFunction = () => {};
  
    const o = {
      type: Foo,
      version: 1,
    };
  
    await migrator2.migrate(o);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "Previous migrator has the wrong type");
});

test("A Migrator with an embedded Migrator with a version that is not the preceding one throws an exception", async t => {
  let error = null;
  try {
    const migrator1 = Object.assign({}, Migrator);
    migrator1.forVersion = 2;
    migrator1.forType = Foo;
    migrator1.migrationFunction = () => {};
  
    const migrator2 = Object.assign({}, Migrator);
    migrator2.forVersion = 4;
    migrator2.forType = Foo;
    migrator2.previousMigrator = migrator1;
    migrator2.migrationFunction = () => {};
  
    const o = {
      type: Foo,
      version: 1,
    };
  
    await migrator2.migrate(o);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "Previous migrator does not have the preceding wrong version number");
});

test("A Migrator with an embedded Migrator will apply its previous Migrator first", async t => {
  const migrator1 = Object.assign({}, Migrator);
  migrator1.forVersion = 2;
  migrator1.forType = Foo;
  migrator1.migrationFunction = obj => {
    obj.data.data.prop = 2;
    return obj;
  };

  const migrator2 = Object.assign({}, Migrator);
  migrator2.forVersion = 3;
  migrator2.forType = Foo;
  migrator2.previousMigrator = migrator1;
  migrator2.migrationFunction = obj => {
    obj.data.data.prop = 3;
    return obj;
  };

  const o = Object.assign(new Foo(), {
    data: {
      type: Foo,
      data: {
        prop: "",
        version: 1,
      },
    },
  });

  const migrated = await migrator2.migrate(o);

  t.is(migrated.data.data.prop, 3);
  t.is(migrated["data.version"], 3);
});

test("Multiple migrations will be handled in ascending version order", async t => {
  const migrator1 = Object.assign({}, Migrator);
  migrator1.forVersion = 2;
  migrator1.forType = Foo;
  migrator1.migrationFunction = obj => {
    obj.data.data.prop += "a";
    return obj;
  };

  const migrator2 = Object.assign({}, Migrator);
  migrator2.forVersion = 3;
  migrator2.forType = Foo;
  migrator2.previousMigrator = migrator1;
  migrator2.migrationFunction = obj => {
    obj.data.data.prop += "b";
    return obj;
  };

  const migrator3 = Object.assign({}, Migrator);
  migrator3.forVersion = 4;
  migrator3.forType = Foo;
  migrator3.previousMigrator = migrator2;
  migrator3.migrationFunction = obj => {
    obj.data.data.prop += "c";
    return obj;
  };

  const migrator4 = Object.assign({}, Migrator);
  migrator4.forVersion = 5;
  migrator4.forType = Foo;
  migrator4.previousMigrator = migrator3;
  migrator4.migrationFunction = obj => {
    obj.data.data.prop += "d";
    return obj;
  };

  const o = Object.assign(new Foo(), {
    data: {
      type: Foo,
      data: {
        prop: "",
        version: 1,
      },
    },
  });

  const migrated = await migrator4.migrate(o);

  t.is(migrated["data.version"], 5);
  t.is(migrated.data.data.prop, "abcd");
});
