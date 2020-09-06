export class Actor {
  constructor() {
    this.items = [];
    this.flags = {};
  }
}

export class NumeneraPCActor extends Actor {
  constructor() {
    super();
  }

  getItemsByName(name) {
    return this.items.filter(i => i.name === name);
  }

  setFlag(namespace, flag, value) {
    this.flags[flag] = value;
  }

  updateEmbeddedEntity(collection, item) {
    let currentItemIndex = this.items.findIndex(i => i.name === item.name);
    if (currentItemIndex === -1)
      currentItemIndex = 0;

    this.items[currentItemIndex] = item;
  }
}
