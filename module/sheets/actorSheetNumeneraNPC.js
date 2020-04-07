/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class ActorSheetNumeneraNPC extends ActorSheet {

  /**
  * Define default rendering options for the NPC sheet
  * @return {Object}
  */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 800,
      height: 900
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
    //TODO static?
    return "systems/numenera/templates/npcSheet.html";
  }
}