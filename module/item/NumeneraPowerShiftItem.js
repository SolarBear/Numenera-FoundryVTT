import { NUMENERA } from "../config.js";
import { EffortDialog } from "../apps/EffortDialog.js";

export class NumeneraPowerShiftItem extends Item {
  static get type() {
      return "powerShift";
  }

  static fromOwnedItem(ownedItem, actor) {
    let powerShiftItem = new NumeneraPowerShiftItem();
    powerShiftItem.data._id = ownedItem._id;
    powerShiftItem.data.name = ownedItem.name;
    powerShiftItem.data.data.notes = ownedItem.data.notes;
    powerShiftItem.data.data.relatedAbilityId = ownedItem.data.relatedAbilityId;
    powerShiftItem.data.data.stat = ownedItem.data.stat;
    powerShiftItem.data.data.inability = ownedItem.data.inability;
    powerShiftItem.data.data.powerShiftLevel = ownedItem.data.powerShiftLevel;
    powerShiftItem.options.actor = actor;

    powerShiftItem.prepareData();

    return powerShiftItem;
  }

  prepareData() {
    // Override common default icon
	  if (!this.data.img) this.data.img = 'icons/svg/upgrade.svg';

      super.prepareData();

      if (!this.data.hasOwnProperty("data")) {
        this.data.data = {};
      }
      
      const itemData = this.data.data;
      itemData.name = this.data && this.data.name ? this.data.name : game.i18n.localize("NUMENERA.item.powerShift.newpowerShift");
      itemData.notes = itemData.notes || "";
      //To avoid problems, set the first stat in the list as the default one
      itemData.effect = itemData.effect || Object.keys(NUMENERA.powerShiftEffects)[0];
      itemData.level = itemData.level || 0;
  }
}
