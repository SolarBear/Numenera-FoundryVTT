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

    this.onAttackCreate = onItemCreateGenerator("npcAttack", NumeneraNpcAttackItem);
    this.onAttackEdit = onItemEditGenerator(".npcAttack");
    this.onAttackDelete = onItemDeleteGenerator("npcAttack");
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

    sheetData.ranges = NUMENERA.ranges.map(r => game.i18n.localize(r));

    sheetData.data.items = sheetData.actor.items || {};

    const items = sheetData.data.items;
    if (!sheetData.data.items.attacks)
      sheetData.data.items.attacks = items.filter(i => i.type === "npcAttack").sort(sortFunction);

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
