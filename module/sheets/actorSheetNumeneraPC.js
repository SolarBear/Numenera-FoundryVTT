import { NUMENERA } from '../config.js'

/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class ActorSheetNumeneraPC extends ActorSheet {
  /**
  * Define default rendering options for the NPC sheet
  * @return {Object}
  */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 600
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
    return "systems/numenera/templates/characterSheet.html";
  }

  getData() {
    const sheetData = super.getData();

    const actorType = sheetData.actor.data.characterType || "";

    //"Augment" the types objects with a new "isActorType" property
    sheetData.types = NUMENERA.types.map(value => {
      return {
        ...value,
        isActorType: value.abbrev === actorType,
      }
    });

    return sheetData;
  }
}
