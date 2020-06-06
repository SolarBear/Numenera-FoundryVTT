import { confirmDeletion } from "../../apps/ConfirmationDialog.js";
import { NUMENERA } from "../../config.js";
import { NumeneraNpcAttackItem } from "../../item/NumeneraNPCAttack.js";

//TODO copied from PCSheet, should be in a separate, shared file.


//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

/**
 * Higher order function that generates an item creation handler.
 *
 * @param {String} itemType The type of the Item (eg. 'ability', 'cypher', etc.)
 * @param {*} itemClass 
 * @param {*} [callback=null]
 * @returns
 */
function onItemCreateGenerator(itemType, itemClass, callback = null) {
  return async function(event = null) {
    if (event)
    event.preventDefault();

    const newName = game.i18n.localize(`NUMENERA.item.${itemType}.new${itemType.capitalize()}`);

    const itemData = {
      name: newName,
      type: itemType,
      data: new itemClass({}),
    };

    const newItem = await this.actor.createOwnedItem(itemData);
    if (callback)
      callback(newItem);

    return newItem;
  }
}

function onItemEditGenerator(editClass, callback = null) {
  return async function (event) {
    event.preventDefault();
    event.stopPropagation(); //Important! otherwise we get double rendering

    const elem = event.currentTarget.closest(editClass);

    if (!elem)
      throw new Error(`Missing ${editClass} class element`);
    else if (!elem.dataset.itemId)
      throw new Error(`No itemID on ${editClass} element`);
      
    const updated = {_id: elem.dataset.itemId};
    
    const splitName = event.currentTarget.name.split(".");
    const idIndex = splitName.indexOf(updated._id);
    const parts = splitName.splice(idIndex + 1);

    //Add the newly added property to the object
    //This next block is necessary to support properties at various depths
    //e.g support actor.name as well as actor.data.cost.pool

    let previous = updated;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];

      if (i === parts.length - 1) {
        //Last part, the actual property
        if (event.target.type === "checkbox") {
          previous[name] = event.currentTarget.checked;
        } else if (event.target.dataset.dtype === "Boolean") {
          previous[name] = (event.currentTarget.value === "true");
        } else {
          previous[name] = event.currentTarget.value;
        }
      } else {
        previous[name] = {};
        previous = previous[name];
      }
    }

    const updatedItem = await this.actor.updateEmbeddedEntity("OwnedItem", updated);
    if (callback)
      callback(updatedItem);
  }
}

function onItemDeleteGenerator(deleteType, callback = null) {
  return async function (event) {
    event.preventDefault();

    if (await confirmDeletion(deleteType)) {
      const elem = event.currentTarget.closest("." + deleteType);
      const itemId = elem.dataset.itemId;
      const toDelete = this.actor.data.items.find(i => i._id === itemId);
      this.actor.deleteOwnedItem(itemId);

      if (callback)
        callback(toDelete);
    }
  }
}

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
   * Handles the click event on add/delete attack controls.
   *
   * @param {*} event
   * @memberof NumeneraNPCActorSheet
   */
  async onAttackControl(event) {
    event.preventDefault();

    const a = event.currentTarget;
    const action = a.dataset.action;

    switch (action) {
      case "create":
        const table = a.closest("table");
        const template = table.getElementsByTagName("template")[0];
        const body = table.getElementsByTagName("tbody")[0];

        if (!template)
          throw new Error(`No row template found in attacks table`);

        //Let's keep things simple here: get the largest existing id and add one
        const id =
          Math.max(
            ...[...body.children].map((c) => c.children[0].children[0].value || 0)
          ) + 1 + "";

        const newRow = template.content.cloneNode(true);
        body.appendChild(newRow);

        //That "newRow"? A DocumentFragment. AN IMPOSTOR.
        const actualRow = body.children[body.children.length - 1];
        actualRow.children[0].children[0].name = `data.attacks.${id}.id`;
        actualRow.children[0].children[0].value = id;
        actualRow.children[0].children[1].name = `data.attacks.${id}.description`;

        await this._onSubmit(event);
        break;

      case "delete":
        const row = a.closest(".attack");
        row.parentElement.removeChild(row);

        await this._onSubmit(event);
        break;

      default:
        throw new Error("Unhandled case in onAttackControl");
    }
  }
}
