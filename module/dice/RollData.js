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
    this.gmRoll = false;
    this.roll = null;
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
    let level = this.skillLevel || 0;

    if (this.isHindered)
      level--;

    if (this.effortLevel)
      level += parseInt(this.effortLevel);

    if (level > 0)
      formula += "+";

    if (level !== 0)
      formula += (3 * level).toString();

    if (this.taskLevel) {
      formula = `{${formula}}cs>=${3 * this.taskLevel}`;
    }

    return formula;
  }

  /**
   * Given a RollData object, get the related Roll object.
   *
   * @export
   * @returns {Roll}
   */
  getRoll() {
    const rollFormula = this.getRollFormula();
    this.roll = new Roll(rollFormula);

    //Pin our rollData object to the roll to tell it was handled by this system
    this.roll.numenera = this;

    return this.roll;
  }

  /**
   * Given a Roll object, determine the text for the roll's results.
   *
   * @export
   * @returns {object}
   */
  static rollText(roll) {
    const die = roll.dice[0].rolls[0].roll;

    //TODO YUUUUUUUUUUUUUUUUCK
    if (!roll.hasOwnProperty("numenera") || roll.numenera.taskLevel === null) {
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
          //const skillLevel = (roll.total - rolled) / 3;
          //const sum = taskLevel + skillLevel;

          // return `${game.i18n.localize("NUMENERA.successLevel")} ${taskLevel}`;

          return {
            special: true,
            text: `${game.i18n.localize("NUMENERA.successLevel")} ${taskLevel}`,
            color: 0x000000,
          }
      }
    }
    else {
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
          break;
  
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
          break;
      }
    }
  }
}
