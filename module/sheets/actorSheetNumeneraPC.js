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

  static get advances() {
    return NUMENERA.advances;
  }

  static get damageTrack() {
    return NUMENERA.damageTrack;
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

  /**
   * Get the current PC's level on the damage track as an integer, 0 being Hale and 3 being Dead.
   * @type {Number}
   */
  damageTrackLevel(data) {
    //Each stat whose value is 0 counts as being one step higher on the damage track
    return Object.values(data.stats).filter(stat => {
      return stat.pool.current === 0;
    }).length;
  }

  /**
   * Provides the data objects provided to the character sheet. Use that method
   * to insert new values or mess with existing ones.
   */
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

    sheetData.advances = Object.entries(sheetData.actor.data.advances).map(([key, value]) => {
      return {
        name: key,
        label: NUMENERA.advances[key],
        isChecked: value,
      }
    });

    // const damage = this.damageTrackLevel(sheetData);
    // sheetData.damageTrack = NUMENERA.damageTrack.map((value, index) => {
    //   return {
    //     label: value,
    //     isCurrent: index === damage,
    //   };
    // });

    return sheetData;
  }
}
