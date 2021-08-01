/**
 * Data class for Numenera roll options (stat, skill, effort level, etc.)
 *
 * @export
 * @class RollData
 */
export class RollData {
  static getTotalModifier(obj) {
    return parseInt(obj.skillLevel)
      + obj.nbAssets
      - (obj.isHindered ? 1 : 0)
      - (obj.damageTrackPenalty ? 1 : 0)
      + obj.effortLevel
      + obj.enhancements;
  }

  constructor() {
    this.topic = "";
    this.taskLevel = null;
    this.nbAssets = 0;
    this.skillLevel = 0;
    this.isHindered = false;
    this.damageTrackPenalty = false;
    this.effortLevel = 0;
    this.enhancements = 0;
    this.rollMode = CONST.DICE_ROLL_MODES.PUBLIC;
  }

  get flavorText() {
    let text = `${game.i18n.localize("NUMENERA.rolling")} ${this.topic}`;
    if (this.effortLevel)
      text += `+ ${this.effortLevel} ${game.i18n.localize("NUMENERA.effortLevels")}`;

    return text;
  }

  /**
   * Initiative-specific to get the roll formula for an Actor. Foundry does not use
   * the same "level" scale we use in Cypher and when in Rome...
   *
   * @memberof RollData
   * @returns {String} The formula to use for initiative.
   */
  getInitiativeRollFormula() {
    const bonus = 3 * RollData.getTotalModifier(this);

    let formula = "1d20";
    if (bonus > 0)
      formula += "+" + bonus;
    else if (bonus < 0)
      formula += bonus.toString();

    return formula;
  }

  /**
   * Get the roll formula for the Foundry Roll API (eg. "1d20+3").
   *
   * @export
   * @returns {string}
   */
  getRollFormula() {
    if (this.taskLevel === null)
      return "1d20";

    let target;
    if (this.taskLevel <= 0)
      target = 1; //in Foundry 0.7.9 there is a "bug" (?) where "{1dX}>=0" is always a failure
    else
      target = 3 * this.taskLevel;

    return `{1d20}cs>=${target}`;
  }

  /**
   * Given a RollData object, get the related Roll object.
   *
   * @export
   * @returns {Roll}
   */
  getRoll() {
    const rollFormula = this.getRollFormula();
    const roll = new Roll(rollFormula);

    //Pin our rollData object to the roll to tell it was handled by this system
    roll.numenera = this;

    return roll;
  }

  /**
   * Given a Roll object, determine the text for the roll's results.
   *
   * @export
   * @returns {object}  
   */
  static rollText(roll) {
    if (!roll.hasOwnProperty("numenera") || roll.numenera.taskLevel === null) {
      return RollData._rollTextWithoutTaskLevel(roll);
    }
    else {
      return RollData._rollTextWithTaskLevel(roll);
    }
  }

  static _rollTextWithTaskLevel(roll) {
    let dieRoll, success;
    dieRoll = roll.terms[0].rolls[0].total  ;
    success = !!roll.total;

    if (success) {
      let combat = "";
      if (dieRoll >= 17) {  
        combat = `Combat: +${dieRoll - 16} damage`;
      }

      switch (dieRoll) {  
        case 19:
          return {
            special: true,
            text: game.i18n.localize("NUMENERA.minorEffect"),
            combat,
            color: 0x000000,
          };
  
        case 20:
          return {
            special: true,
            text: game.i18n.localize("NUMENERA.majorEffect"),
            combat,
            color: 0x000000,
          };
  
        default:
          return {
            special: false,
            text: game.i18n.localize("NUMENERA.rollSuccess"),
            combat,
            color: 0x000000,
          };
      }
    }
    else {
      //Sorry.
      switch (dieRoll) {
        case 1:
          return {
            special: true,
            text: game.i18n.localize("NUMENERA.gmIntrusion"),
            combat: "",
            color: 0x000000,
          };
        
        default:
          return {
            special: false,
            text: game.i18n.localize("NUMENERA.rollFailure"),
            combat: "",
            color: 0x000000,
          };
      }
    }
  }

  static _rollTextWithoutTaskLevel(roll) {
    //TODO Roll.roll() now gives some weird warnings, perhaps switch to evaluate()?
    let dieRoll = roll.terms[0].results[0].result;
    let total = roll.total;

    let combat = "";
    if (dieRoll >= 17) {
      combat = `Combat: +${dieRoll - 16} damage`;
    }

    switch (dieRoll) {
      case 1:
        return {
          special: true,
          text: game.i18n.localize("NUMENERA.gmIntrusion"),
          combat,
          color: 0x000000,
        }

      case 19:
        return {
          special: true,
          text: game.i18n.localize("NUMENERA.minorEffect"),
          combat,
          color: 0x000000,
        }

      case 20:
        return {
          special: true,
          text: game.i18n.localize("NUMENERA.majorEffect"),
          combat,
          color: 0x000000,
        }

      default:
        const rolled = total;
        let taskLevel = Math.floor(rolled / 3);

        if (game.settings.get("numenera", "d20Rolling") === "addModifiers")
          taskLevel += RollData.getTotalModifier(roll.numenera);

        return {
          special: false,
          text: `${game.i18n.localize("NUMENERA.successLevel")} ${taskLevel}`,
          combat,
          color: 0x000000,
        }
    }
  }
}
