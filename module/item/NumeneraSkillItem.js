import { NUMENERA } from "../config.js";
import { EffortDialog } from "../apps/EffortDialog.js";
import { useAlternateButtonBehavior } from "../utils.js";

export class NumeneraSkillItem extends Item {
  static get type() {
    return "skill";
  }

  static get object() {
    return {
      type: NumeneraSkillItem.type,
      name: game.i18n.localize("NUMENERA.item.skill.newSkill"),
    }
  }

  static async fromOwnedItem(ownedItem, actor) {
    let skillItem;

    //TODO find a more elegant way plz
    if (actor === null)
      skillItem = new Item(NumeneraSkillItem.object);
    else
      skillItem = await actor.createEmbeddedDocuments("Item", [this.object]);

    skillItem.data.id = ownedItem.id;
    skillItem.data.name = ownedItem.name;
    skillItem.data.notes = ownedItem.data.notes;
    skillItem.data.relatedAbilityId = ownedItem.data.relatedAbilityId;
    skillItem.data.stat = ownedItem.data.data.stat;
    skillItem.data.inability = ownedItem.data.data.inability;
    skillItem.data.skillLevel = ownedItem.data.data.skillLevel;

    skillItem.prepareData();

    return skillItem;
  }

  prepareData() {
    super.prepareData();

    // Override common default icon
    if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
      this.data.img = 'icons/svg/book.svg';

    if (!this.data.hasOwnProperty("data")) {
      this.data.data = {};
    }

    const itemData = this.data.data;
    itemData.name = this.data && this.data.name ? this.data.name : game.i18n.localize("NUMENERA.item.skill.newSkill");
    itemData.notes = itemData.notes || "";
    //To avoid problems, set the first stat in the list as the default one
    itemData.stat = itemData.stat || Object.values(NUMENERA.stats)[0];
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
      id: ability.id,
      name: this.name,
      "data.cost.pool": this.data.data.stat,
    },
      options);

    return updated;
  }

  async use(event = null) {
    if (event === null)
      event = window.event;

    //An ability must be related to an Actor to be used
    if (this.actor === null) {
      return ui.notifications.error(game.i18n.localize("NUMENERA.item.skill.useNotLinkedToActor"));
    }

    if (event && useAlternateButtonBehavior()) {
      const dialog = new EffortDialog(this.actor, { skill: this });
      await dialog.init();
      return dialog.render(true);
    } else {
      await this.actor.rollSkill(this);
    }
  }
}
