export class NumeneraCypherItem extends Item {
  static get type() {
    return "cypher";
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
   * Transform the current artifact so it doesn't look identified.
   *
   * @memberof NumeneraArtifactItem
   */
  asUnidentified() {
    this.name = game.i18n.localize("NUMENERA.pc.numenera.cypher.unidentified");
    this.data.level = game.i18n.localize("NUMENERA.unknown");
    this.data.effect = game.i18n.localize("NUMENERA.unknown");

    if (game.settings.get("numenera", "useCypherTypes")) {
      this.data.cypherType = game.i18n.localize("NUMENERA.unknown");
    }
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
