export class NumeneraEquipmentItem extends Item {
  static get type() {
    return "equipment";
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/anchor.svg';

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.equipment.newEquipment");
    itemData.price = itemData.price || 0;
    itemData.notes = itemData.notes || "";
  }

  async toChatMessage() {
    const data = {
      id: this.id,
      actorId: this.actor.id,
      type: this.type,
      name: this.data.name,
      img: this.data.img,
      notes: this.data.data.notes,
    };

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      content: await renderTemplate(
        "systems/numenera/templates/chat/items/equipment.html", 
        data,
      )
    });
  }
}
