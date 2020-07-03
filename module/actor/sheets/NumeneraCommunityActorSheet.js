/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class NumeneraCommunityActorSheet extends ActorSheet {
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 850,
      height: 650,
    tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "#community-sheet-body",
        },
      ],
    });
  }

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/actor/communitySheet.html";
  }

  /**
   * @inheritdoc
   */
  getData() {
    const sheetData = super.getData();

    return sheetData;
  }
}
