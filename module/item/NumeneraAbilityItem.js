import { confirmSpellUse,  selectRecoveryToUse } from "../apps/SpellDialog.js";
import { NumeneraSkillItem } from "./NumeneraSkillItem.js";

export class NumeneraAbilityItem extends Item {
  static get type() {
      return "ability";
  }

  get spellCastingTime() {
    if (this.data.data.tier >= 5) {
      return "1 hour";
    }
    else if (this.data.data.tier >= 3) {
      return "30 minutes";
    }
    else if (this.data.data.tier >= 1) {
      return "10 minutes";
    }
  }

  prepareData() {
      // Override common default icon
      if (!this.data.img) this.data.img = 'icons/svg/lightning.svg';

      super.prepareData();

      let itemData = this.data;
      if (itemData.hasOwnProperty("data"))
        itemData = itemData.data;

      itemData.name = this.data ? this.data.name : game.i18n.localize("NUMENERA.item.ability.newAbility");
      itemData.category = itemData.category || "";
      itemData.categoryValue = itemData.categoryValue || "";
      itemData.abilityType = itemData.abilityType || false;
      itemData.cost = itemData.cost || {};
      itemData.cost.amount = itemData.cost.amount || 0;
      itemData.cost.pool = itemData.cost.pool || "";
      itemData.tier = itemData.tier || 1;
      itemData.range = itemData.range || "";
      itemData.notes = itemData.notes || "";
  }

  /**
   * Gets the Ability cost as an object representing the pool name and amount.
   *
   * @returns {Object}
   * @memberof NumeneraAbilityItem
   */
  getCost() {
    return {
      pool: this.data.data.cost.pool.split(".").pop(), // pool is saved as "NUMENERA.pool.POOLNAME"
      amount: this.data.data.cost.amount,
    };
  }

  async updateRelatedSkill(skill, options = {}) {
    //If it is not owned by an Actor, it has no related skill
    if (!this.actor || !skill)
      return;

    if (
      skill.data.data.stat === this.data.data.cost.pool &&
      skill.data.name === this.data.name
    )
      return;

    const updated = await skill.update({
      _id: skill._id,
      name: this.name,
      "data.relatedAbilityId": this._id,
      "data.stat": this.data.data.cost.pool,
    },
    options);

    return updated;
  }

  async use() {
    //An ability must be related to an Actor to be used
    if (this.actor === null) {
      return ui.notifications.error(game.i18n.localize("NUMENERA.item.ability.useNotLinkedToActor"));
    }

    //Get the skill related to that ability
    let skill = this.actor.data.items.find(
      i => i.name === this.data.name && i.type === NumeneraSkillItem.type
    );

    if (!skill) {
      skill = new NumeneraSkillItem();
      skill.data.name = `${game.i18n.localize(this.data.data.weight)} ${game.i18n.localize(this.data.data.weaponType)}`;
      skill.options.actor = this.actor;
    }
    else if (skill.prototype !== NumeneraSkillItem) {
      skill = NumeneraSkillItem.fromOwnedItem(skill, this.actor);
    }

    //Is this a spell?
    if (this.data.data.abilityType === "NUMENERA.item.ability.type.spell") {
      //Hold on! We need to know how they wish to cast that spell      
      const use = await confirmSpellUse(this);

      switch (use) {
        case "time":
          //TODO add extra label to ability use
          break;
        case "recovery":
          const recoveries = this.actor.data.data.recoveries;
          switch (await selectRecoveryToUse(this.actor)) {
            case "1-action":
              //Get the first 1-action that is available
              //We've already confirmed that at least one is available
              for (let i = 0; i < recoveries.length - 3; i++)
                if (recoveries[i]) {
                  recoveries[i] = false;
                  break;
                }
              break;
            case "10-minutes":
              recoveries[recoveries.length - 3] = false;
              break;
            case "1-hour":
              recoveries[recoveries.length - 2] = false;
              break;
            default:
              return;
          }

          //Save the actor data for that recovery's use
          await this.actor.update({"data.recoveries": recoveries});
          break;
        default:
          //That one's easy.
          return;
      }
    }

    skill.use();
  }
}