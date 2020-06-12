export class NumeneraFocusItem extends Item {
  static get type() {
    return "focus";
}

prepareData() {
// Override common default icon
  if (!this.data.img) this.data.img = 'icons/svg/anchor.svg'; //TODO
    super.prepareData();

    const itemData = this.data.data || {};

    itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.equipment.newFocus");
    itemData.notes = itemData.notes || "";
    itemData.minorEffectSuggestions =  itemData.minorEffectSuggestions || "";
    itemData.majorEffectSuggestions = itemData.majorEffectSuggestions || "";
    itemData.additionalEquipment = itemData.additionalEquipment || "";
    itemData.tierAbilities = itemData.tierAbilities || {};
}