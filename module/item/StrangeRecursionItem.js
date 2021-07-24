export class StrangeRecursionItem extends Item {
  static get type() {
    return "recursion";
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/circle.svg';

    let itemData = this.data;
    if (itemData.hasOwnProperty("data"))
      itemData = itemData.data;

    const desc = Object.getOwnPropertyDescriptor(itemData, "name");
    if (desc && desc.writable)
      itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.recursion.newRecursion");

    itemData.active = itemData.active || false;
    itemData.level = itemData.level || 0;
    itemData.laws = itemData.laws || "";
    itemData.race = itemData.race || "";
    itemData.trait = itemData.trait || "";
    itemData.focus = itemData.focus || "";
    itemData.focusAbilities = itemData.focusAbilities || "";
  }

  async toChatMessage() {
    const data = {
      id: this.id,
      actorId: this.actor.id,
      type: this.type,
      name: this.data.name,
      img: this.data.img,
      active: this.data.data.active ? "Yes" : "No",
      level: this.data.data.level,
      laws: this.data.data.laws,
      race: this.data.data.race,
      trait: this.data.data.trait,
      focus: this.data.data.focus,
      focusAbilities: this.data.data.focusAbilities,
    };

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      content: await renderTemplate(
        "systems/numenera/templates/chat/items/recursion.html", 
        data,
      )
    });
  }
}
