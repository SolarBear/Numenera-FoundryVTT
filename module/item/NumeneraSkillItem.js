export class NumeneraSkillItem extends Item {
  static get type() {
      return "skill";
  }

  prepareData() {
	  // Override common default icon
	  if (!this.data.img) this.data.img = 'icons/svg/book.svg';

      super.prepareData();

      const itemData = this.data.data || {};

      itemData.name = this.data && this.data.name ? this.data.name : game.i18n.localize("NUMENERA.item.skill.newSkill");
      itemData.notes = itemData.notes || "";
      itemData.stat = itemData.stat || "";
      itemData.inability = itemData.inability || false;
      itemData.trained = itemData.trained || false;
      itemData.specialized = itemData.specialized || false;
  }

  async updateRelatedAbility(ability, options = {}) {
    //If it is not owned by an Actor, it has no related skill
    if (!this.actor || !ability)
      return;

    if (
      ability.data.data.cost.pool === this.data.data.stat &&
      ability.data.name === this.data.name
    )
      return;

    const updated = await ability.update({
      _id: ability._id,
      name: this.name,
      "data.cost.pool": this.data.data.stat,
    },
    options);

    ui.notifications.info(game.i18n.localize("NUMENERA.item.skill.relatedAbilityUpdated"));

    return updated;
  }

  async use() {
    //An ability must be related to an Actor to be used
    if (this.actor === null) {
      return ui.notifications.error(game.i18n.localize("NUMENERA.item.skill.useNotLinkedToActor"));
    }

    this.actor.rollSkill(this);
  }
}
