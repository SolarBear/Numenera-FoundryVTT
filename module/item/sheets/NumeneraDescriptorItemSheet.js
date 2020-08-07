export class NumeneraDescriptorItemSheet extends ItemSheet {
  /**
   * Define default rendering options for the weapon sheet
   * @return {Object}
   */
  static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
          width: 700,
          height: 700
      });
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
      return "systems/numenera/templates/item/descriptorSheet.html";
  }

  get type() {
      return "descriptor";
  }
}