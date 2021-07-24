import { NUMENERA } from "../config.js";

export class NumeneraPowerShiftItem extends Item {
  static get type() {
    return "powerShift";
  }

  static async fromOwnedItem(ownedItem, actor) {
    let powerShiftItem;

    if (actor === null)
      powerShiftItem = new Item(this.object);
    else
      powerShiftItem = await actor.createEmbeddedDocuments("Item", [this.object]);
      
    powerShiftItem.data._id = ownedItem._id;
    powerShiftItem.data.name = ownedItem.name;
    powerShiftItem.data.data.version = parseInt(ownedItem.data.version);
    powerShiftItem.data.data.order = parseInt(ownedItem.data.order);
    powerShiftItem.data.data.notes = ownedItem.data.notes;
    powerShiftItem.data.data.effect = ownedItem.data.effect;
    powerShiftItem.data.data.level = parseInt(ownedItem.data.level);
    powerShiftItem.options.actor = actor;

    powerShiftItem.prepareData();

    return powerShiftItem;
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/upgrade.svg';

    if (!this.data.hasOwnProperty("data")) {
      this.data.data = {};
    }

    const itemData = this.data.data;
    itemData.name = this.name ? this.name : game.i18n.localize("NUMENERA.item.powerShift.newPowerShift");
    itemData.notes = itemData.notes || "";
    //To avoid problems, set the first stat in the list as the default one
    itemData.effect = itemData.effect || Object.keys(NUMENERA.powerShiftEffects)[0];
    itemData.level = itemData.level || 0;
  }

  //TODO all of these methods are mostly copy&paste... there's certainly a cleaner way to do this
  async toChatMessage() {
    const data = {
      id: this.id,
      actorId: this.actor.id,
      type: this.type,
      name: this.data.name,
      img: this.data.img,
      level: this.data.data.level,
      effect: this.data.data.effect,
      notes: this.data.data.notes,
    };

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      content: await renderTemplate(
        "systems/numenera/templates/chat/items/powerShift.html", 
        data,
      )
    });
  }
}
