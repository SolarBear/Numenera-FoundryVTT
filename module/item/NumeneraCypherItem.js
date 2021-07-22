export class NumeneraCypherItem extends Item {
  static get type() {
    return "cypher";
  }

  static get name() {
    return game.i18n.localize("NUMENERA.pc.numenera.cypher.unidentified");
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
    cypher.data.data.level = game.i18n.localize("NUMENERA.unknown");
    cypher.data.data.effect = game.i18n.localize("NUMENERA.unknown");
    cypher.data.data.cypherType = null;

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
  static async fromOwnedItem(ownedItem, actor) {
    let cypherItem;

    if (actor === null)
      cypherItem = new Item(this.object);
    else
      cypherItem = await actor.createEmbeddedDocuments("Item", [this.object]);

    cypherItem.data._id = ownedItem._id;
    cypherItem.data.name = ownedItem.name;
    cypherItem.data.price = ownedItem.data.price;
    cypherItem.data.notes = ownedItem.data.notes;
    cypherItem.data.efffect = ownedItem.data.effect;
    cypherItem.data.form = ownedItem.data.form;
    cypherItem.data.level = ownedItem.data.level;
    cypherItem.data.levelDie = ownedItem.data.levelDie;
    cypherItem.data.range = ownedItem.data.range;

    cypherItem.options.actor = actor;

    cypherItem.prepareData();

    return cypherItem;
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/pill.svg';

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.cypher.newCypher");
    itemData.identified = itemData.identified || false;
    itemData.level = itemData.level || null;
    itemData.levelDie = itemData.levelDie || "";
    itemData.form = itemData.form || "";
    itemData.range = itemData.range || "Immediate";
    itemData.effect = itemData.effect || "";
    itemData.cypherType = itemData.cypherType || "";
  }

  async toChatMessage() {
    const data = {
      type: this.type,
      name: this.data.name,
      form: this.data.data.form,
      useCypherType: !!NumeneraCypherItem.cypherTypeFlavor,
      cypherType: this.data.data.cypherType,
      level: this.data.data.level,
      effect: this.data.data.effect,
    };

    if (!this.data.data.identified) {
      data.name = game.i18n.localize("NUMENERA.pc.numenera.cypher.unidentified");
      data.level = game.i18n.localize("NUMENERA.unknown");
      data.effect = game.i18n.localize("NUMENERA.unknown");
      data.cypherType = game.i18n.localize("NUMENERA.unknown");;
    }

    await ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      content: await renderTemplate(
        "systems/numenera/templates/chat/items/cypher.html", 
        data,
      )
    });
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
