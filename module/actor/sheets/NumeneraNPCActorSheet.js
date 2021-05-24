import { onItemCreateGenerator, onItemDeleteGenerator, onItemEditGenerator, sortFunction } from "./sheetUtils.js";

import { NUMENERA } from "../../config.js";
import { NumeneraNpcAttackItem } from "../../item/NumeneraNPCAttack.js";

/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class NumeneraNPCActorSheet extends ActorSheet {
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
          contentSelector: "#npc-sheet-body",
        },
      ],
    });
  }

  constructor(...args) {
    super(...args);

    this.onAttackCreate = onItemCreateGenerator(NumeneraNpcAttackItem.type, NumeneraNpcAttackItem);
    this.onAttackEdit = onItemEditGenerator(".npcAttack");
    this.onAttackDelete = onItemDeleteGenerator(NumeneraNpcAttackItem.type);
  }

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/actor/npcSheet.html";
  }

  /**
   * @inheritdoc
   */
  getData() {
    const sheetData = super.getData();

    //lol? https://discord.com/channels/170995199584108546/670336275496042502/836066464388743188
    //TODO remove condition when removing support for 0.7
    if (game.data.version.startsWith("0.8."))
      sheetData.data = sheetData.data.data;

    sheetData.ranges = NUMENERA.ranges.map(r => game.i18n.localize(r));

    sheetData.data.items = sheetData.actor.items || {};

    const items = sheetData.data.items;

    if (!sheetData.data.attacks)
      sheetData.data.attacks = items.filter(i => i.type === NumeneraNpcAttackItem.type).sort(sortFunction);

    return sheetData;
  }

  /**
   * Add character sheet-specific event listeners.
   *
   * @param {*} html
   * @memberof ActorSheetNumeneraNPC
   */
  activateListeners(html) {
    super.activateListeners(html);

    const attacksTable = html.find("table.attacks");
    attacksTable.on("click", ".attack-create", this.onAttackCreate.bind(this));
    attacksTable.on("click", ".attack-delete", this.onAttackDelete.bind(this));
    attacksTable.on("change", "input", this.onAttackEdit.bind(this));
  }

  /**
   * @override
   */
  _onDeleteEmbeddedEntity(...args) {
    /* Necessary because, after deleting an item, Foundry fetches the Item's sheet
    class and, well, NPC attacks don't have one. Intercept the exception and, in that
    particular case, ignore it */
    try {
      super._onDeleteEmbeddedEntity(...args);
    } catch (e) {
      if (!e.message.includes("No valid Item sheet found for type npcAttack")) {
        throw e;
      }
    }
  }
}
