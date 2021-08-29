export class NumeneraNpcAttackItem extends Item {
  static get type() {
      return "npcAttack";
  }

  static get object() {
    return {
      type: NumeneraNpcAttackItem.type,
      name: "",
    }
  }

  prepareData() {
    super.prepareData();

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    itemData.notes = itemData.notes || "";
    itemData.info = itemData.info || "";
  }

  async toChatMessage() {
    const data = {
      id: this.id,
      npc: this.actor.name,
      notes: this.data.data.notes,
    };

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({user: game.user}),
      content: await renderTemplate(
        "systems/numenera/templates/chat/items/npcAttack.html", 
        data,
      )
    });
  }
}
