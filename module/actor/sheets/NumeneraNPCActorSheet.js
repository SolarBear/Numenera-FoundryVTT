import { onItemCreateGenerator, onItemDeleteGenerator, onItemEditGenerator, sortFunction } from "./sheetUtils.js";

import { NUMENERA } from "../../config.js";
import { NumeneraNpcAttackItem } from "../../item/NumeneraNPCAttack.js";
import { removeHtmlTags } from "../../utils.js";

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
    if (this.actor.getUserLevel() < CONST.ENTITY_PERMISSIONS.OBSERVER)
      return "systems/numenera/templates/actor/npcSheetLimited.html";
  
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

    //TODO is this really needed in 0.7?
    //if (!sheetData.data.attacks)
      sheetData.data.attacks = items.filter(i => i.type === NumeneraNpcAttackItem.type).sort(sortFunction);

    if (this.actor.getUserLevel() < CONST.ENTITY_PERMISSIONS.OBSERVER)
    {
      sheetData.data.notes = removeHtmlTags(sheetData.data.notes);
      this.position.height = 350;
    }

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

    if (this.actor.isOwner) {
      html.find('tr.npcAttack').each((i, elem) => {
        // Add draggable attribute and dragstart listener.
        elem.setAttribute("draggable", true);
        elem.addEventListener("dragstart", ev => this._onDragStart(ev), false);
      });
    }
  }

  //TODO these 4 functions are copy & paste frmo PCActorSheet, putthem somewhere else
  async _onDrop(event) {
    const drop = await super._onDrop(event);
    this._onSortItem(event, drop);

    return drop;
  }

  _onDragStart(event) {
    const itemId = event.target.dataset.itemId;
    
    if (!itemId) return;

    const clickedItem = duplicate(
      //TODO
      this.actor.getEmbeddedEntity("OwnedItem", itemId)
    );
    clickedItem.data.stored = "";

    const item = clickedItem;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        itemId,
        actorId: this.actor.id,
        data: item,
      })
    );

    return super._onDragStart(event);
  }

  //TODO this is an override of the base class function. Can we simple reuse the base one?
  async _onSortItem(event, item = null) {
    const container = event.target.closest(".row-container");
    if (!container || !("children" in container))
      return;

    const children = [...container.children];
    const dragTargetIndex = children.findIndex(row => row.dataset.itemId == event.target.closest("tr").dataset.itemId);

    let draggedRowIndex;
    if (item && item.id)
      draggedRowIndex = children.findIndex(row => row.dataset.itemId == item.id);
    else {
      const dragged = JSON.parse(event.dataTransfer.getData("text/plain"));
      draggedRowIndex = children.findIndex(row => row.dataset.itemId == dragged.id);
    }

    const updates = children.map((row, i) => {
      return {
        _id: row.dataset.itemId,
      };
    });

    const deleted = updates.splice(draggedRowIndex, 1);
    updates.splice(dragTargetIndex, 0, deleted[0]);

    for (let i = 0; i < updates.length; i++) {
      updates[i]["data.order"] = i;

      const row = children.find(row => row.dataset.itemId == updates[i]._id);
      row.dataset.order = i;
    }

    if (updates.length > 0) {
      const calisse = await this.actor.updateEmbeddedDocuments("Item", updates, {fromActorUpdateEmbeddedEntity: true});
      return calisse;
    }
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
