export class NumeneraCypherItem extends Item {
  static get type() {
    return "cypher";
  }

  /**
     * Transform the current cypher so it doesn't look identified.
     *
     * @memberof NumeneraCypherItem
     */
    static asUnidentified(cypher) {
      if (cypher.constructor === Object)
        cypher = NumeneraCypherItem.fromOwnedItem(cypher);

      cypher.data.name = game.i18n.localize("NUMENERA.pc.numenera.cypher.unidentified");
      cypher.data.level = game.i18n.localize("NUMENERA.unknown");
      cypher.data.effect = game.i18n.localize("NUMENERA.unknown");
      cypher.data.cypherType = null;

      return cypher;
  }

  /**
   * Convert a cypher POJO to a NumeneraCypherItem.
   *
   * @static
   * @param {Object} ownedItem
   * @param {NumeneraPCActor} actor
   * @returns
   * @memberof NumeneraCypherItem
   */
  static fromOwnedItem(ownedItem, actor) {
      let cypherItem = new NumeneraCypherItem();
      cypherItem.data._id = ownedItem._id;
      cypherItem.data.name = ownedItem.name;
      cypherItem.data.data = {};
      cypherItem.data.data.price = ownedItem.data.price;
      cypherItem.data.data.notes = ownedItem.data.notes;
      cypherItem.data.data.efffect = ownedItem.data.effect;
      cypherItem.data.data.form = ownedItem.data.form;
      cypherItem.data.data.level = ownedItem.data.level;
      cypherItem.data.data.levelDie = ownedItem.data.levelDie;
      cypherItem.data.data.range = ownedItem.data.range;

      cypherItem.options.actor = actor;

      cypherItem.prepareData();

      return cypherItem;
  }

  prepareData() {
    // Override common default icon
    if (!this.data.img) this.data.img = 'icons/svg/pill.svg';

    super.prepareData();

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.cypher.newCypher");
    itemData.level = itemData.level || null;
    itemData.levelDie = itemData.levelDie || "";
    itemData.form = itemData.form || "";
    itemData.range = itemData.range || "Immediate";
    itemData.effect = itemData.effect || "";
    itemData.cypherType = itemData.cypherType || "";
  }

  /**
   * Get the cypher type flavor used.
   *
   * @readonly
   * @static
   * @memberof NumeneraCypherItem
   */
  static get cypherTypeFlavor() {
    switch (game.settings.get("numenera", "cypherTypesFlavor")) {
      case 1: //none
        return null;

      case 2: //anoetic/occultic
        return "numenerav1";

      case 3: //subtle/manifest/fantastic
        return "cypherSystem";
    }
  }
}
