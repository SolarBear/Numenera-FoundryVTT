import { NUMENERA } from "../config.js";

export class NumeneraSkillItem extends Item {
  static get type() {
      return "skill";
  }

  prepareData() {
	  // Override common default icon
	  if (!this.data.img) this.data.img = 'icons/svg/book.svg';

      super.prepareData();

      let itemData = this.data;
      if (itemData.hasOwnProperty("data"))
        itemData = itemData.data;

      itemData.name = this.data && this.data.name ? this.data.name : game.i18n.localize("NUMENERA.item.skill.newSkill");
      itemData.notes = itemData.notes || "";
      //To avoid problems, set the first stat in the list as the default one
      itemData.stat = itemData.stat || Object.keys(NUMENERA.stats)[0];
      itemData.inability = itemData.inability || false;
      itemData.skillLevel = itemData.skillLevel || 0;
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

    const gmRoll = window.event ? window.event.shiftKey : false;
    
    this.actor.rollSkill(this, gmRoll);
  }
}
