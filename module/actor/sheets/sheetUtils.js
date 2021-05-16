import { confirmDeletion } from "../../apps/ConfirmationDialog.js";

//Sort function for order
export const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

/**
 * Higher order function that generates an item creation handler.
 *
 * @param {String} itemType The type of the Item (eg. 'ability', 'cypher', etc.)
 * @param {*} itemClass
 * @param {*} [callback=null]
 * @returns
 */
export function onItemCreateGenerator(itemType, itemClass, callback = null) {
  return async function(event = null) {
    if (event)
    event.preventDefault();

    const newName = game.i18n.localize(`NUMENERA.item.${itemType}.new${itemType.capitalize()}`);

    const itemData = {
      _id: null,
      name: newName,
      type: itemType,
    };

    const newItem = await (await this.actor.createEmbeddedDocuments("Item", [itemData]))[0];

    if (callback)
      callback(newItem);

    return newItem;
  }
}

export function onItemEditGenerator(editClass, callback = null) {
  return async function onItemCreateGenerator(event) {
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

    let updatedItem;
    if (game.data.version.startsWith("0.7."))
      updatedItem = await this.actor.updateEmbeddedEntity(updated, {fromActorUpdateEmbeddedEntity: true});
    else
      updatedItem = await this.actor.updateEmbeddedDocuments("Item", [updated], {fromActorUpdateEmbeddedEntity: true});

    if (callback)
      callback(updatedItem);
  }
}

export function onItemDeleteGenerator(deleteType, callback = null) {
  return async function (event) {
    event.preventDefault();

    if (await confirmDeletion(deleteType)) {
      const elem = event.currentTarget.closest("." + deleteType);
      const itemId = elem.dataset.itemId;
      const toDelete = this.actor.data.items.find(i => i._id === itemId);
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);

      if (callback)
        callback(toDelete);
    }
  }
}
