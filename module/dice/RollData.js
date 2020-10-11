/**
 * Data class for Numenera roll options (stat, skill, effort level, etc.)
 *
 * @export
 * @class RollData
 */
export class RollData {
  constructor() {
    this.topic = "";
    this.taskLevel = null;
    this.nbAssets = 0;
    this.skillLevel = 0;
    this.isHindered = false;
    this.effortLevel = 0;
    this.rollMode = DICE_ROLL_MODES.PUBLIC;
  }

  get flavorText() {
    let text = `${game.i18n.localize("NUMENERA.rolling")} ${this.topic}`;
    if (this.effortLevel)
      text += `+ ${this.effortLevel} ${game.i18n.localize("NUMENERA.effortLevels")}`;

    return text;
  }

  /**
   * Get the roll formula for the Foundry Roll API (eg. "d20+3").
   *
   * @export
   * @returns {string}
   */
  getRollFormula() {
    let formula = "d20";
    if (this.taskLevel === null) {
      return formula;
    }

    let level = parseInt(this.skillLevel) || 0;

    if (this.isHindered)
      level--;

    if (this.effortLevel)
      level += parseInt(this.effortLevel);

    if (level > 0)
      formula += "+";

    if (level !== 0)
      formula += (3 * level).toString();

    return `{${formula}}cs>=${3 * this.taskLevel}`;
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
    const die = roll.dice[0].rolls[0].roll;

    switch (parseInt(roll.result)) {
      case 0:
        //Sorry.
        switch (die) {
          case 1:
            return {
              special: true,
              text: game.i18n.localize("NUMENERA.gmIntrusion"),
              color: 0x000000,
            };
          
          default:
            return {
              special: false,
              text: game.i18n.localize("NUMENERA.rollFailure"),
              color: 0x000000,
            };
        }

      case 1:
        //Success!
        switch (die) {  
          case 19:
            return {
              special: true,
              text: game.i18n.localize("NUMENERA.minorEffect"),
              color: 0x000000,
            };
    
          case 20:
            return {
              special: true,
              text: game.i18n.localize("NUMENERA.majorEffect"),
              color: 0x000000,
            };
    
          default:
            return {
              special: false,
              text: game.i18n.localize("NUMENERA.rollSuccess"),
              color: 0x000000,
            };
        }

      default:
        throw new Error("Unhandled case in _rollTextWithTaskLevel");
    }
  }

  static _rollTextWithoutTaskLevel(roll) {
    switch (roll.dice[0].rolls[0].roll) {
      case 1:
        return {
          special: true,
          text: game.i18n.localize("NUMENERA.gmIntrusion"),
          color: 0x000000,
        }

      case 19:
        return {
          special: true,
          text: game.i18n.localize("NUMENERA.minorEffect"),
          color: 0x000000,
        }

      case 20:
        return {
          special: true,
          text: game.i18n.localize("NUMENERA.majorEffect"),
          color: 0x000000,
        }

      default:
        const rolled = roll.dice[0].rolls[0].roll;
        const taskLevel = Math.floor(rolled / 3);

        return {
          special: false,
          text: `${game.i18n.localize("NUMENERA.successLevel")} ${taskLevel}`,
          color: 0x000000,
        }
    }
  }
}
