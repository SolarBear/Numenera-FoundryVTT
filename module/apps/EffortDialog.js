import { NUMENERA } from "../config.js";
import { getShortStat } from "../utils.js";

import { RollData } from "../dice/RollData.js";

import { NumeneraPCActor } from "../actor/NumeneraPCActor.js";

import { NumeneraSkillItem } from "../item/NumeneraSkillItem.js";
import { NumeneraAbilityItem } from "../item/NumeneraAbilityItem.js";
import { NumeneraPowerShiftItem } from "../item/NumeneraPowerShiftItem.js";

export class EffortDialog extends FormApplication {
  /**
   * @inheritdoc
   */
  static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
      classes: ["numenera"],
      title: game.i18n.localize("NUMENERA.effort.title"),
      template: "systems/numenera/templates/dialog/effort.html",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      editable: true,
      width: 360,
      height: "auto",
    });
  }

  static get rollModes() {
    return [
      {
        label: game.i18n.localize("NUMENERA.rollMode.public"),
        value: CONST.DICE_ROLL_MODES.PUBLIC,
      },
      {
        label: game.i18n.localize("NUMENERA.rollMode.private"),
        value: CONST.DICE_ROLL_MODES.PRIVATE,
      },
      {
        label: game.i18n.localize("NUMENERA.rollMode.blind"),
        value: CONST.DICE_ROLL_MODES.BLIND,
      },
      {
        label: game.i18n.localize("NUMENERA.rollMode.self"),
        value: CONST.DICE_ROLL_MODES.SELF,
      }
    ];
  }


  /**
  * Creates an instance of EffortDialog, using IDs instead of items.
  * @param {NumeneraPCActor} actor
  * @param {string} [stat=null]
  * @param {string} [skill=null]
  * @param {string} [ability=null]
  * @param {string} [powerShift=null]
  * @param {Number} [assets=0]
  * @memberof EffortDialog
  */
  static async create(actor, options={}) {
    if (!actor) {
      ui.notifications.error("Tried calling EffortDialog.create without an actor");
    }

    //For all items we allow lookup by 
    // - ID
    // - name, filtered by item type
    if (options.ability) {
      const temp = options.ability;
      options.ability = await actor.items.get(temp);

      if (!options.ability)
        options.ability = actor.items.find(ab => ab.name === temp && ab.type === NumeneraAbilityItem.type);

      if (!options.ability)
        ui.notifications.error("The ability does not exist");
    }

    if (options.skill) {
      const temp = options.skill;
      options.skill = await actor.items.get(temp);

      if (!options.skill)
        options.skill = actor.items.find(sk => sk.name === temp && sk.type === NumeneraSkillItem.type);

      if (!options.skill)
        ui.notifications.error("The skill does not exist");
    }

    if (options.powerShift) {
      const temp = options.powerShift;
      options.powerShift = await actor.items.get(temp);

      if (!options.powerShift)
        options.powerShift = actor.items.find(ps => ps.name === temp && ps.type === NumeneraPowerShiftItem.type);

      if (!options.powerShift)
        ui.notifications.error("The power shift does not exist");
    }

    (new EffortDialog(actor, options)).render(true);
  }

  /**
   *Creates an instance of EffortDialog.
  * @param {NumeneraPCActor} actor
  * @param {string} [stat=null]
  * @param {NumeneraSkillItem} [skill=null]
  * @param {NumeneraAbilityItem} [ability=null]
  * @param {Number} [assets=0]
  * @param {Number} [taskLevel=null]
  * @param {NumeneraPowerShiftItem} [powerShift=null]
  * @param {RollData} [rollData=null]
  * @memberof EffortDialog
  */
  constructor(actor, {stat=null, skill=null, ability=null, assets=0, taskLevel=null, powerShift=null, rollData=null}) {
    if (!stat) {
      if (ability) {
        stat = getShortStat(ability.data.data.cost.pool);
        if (!skill) {
          skill = actor.data.items.find(
            i => i.name === ability.name && i.type === NumeneraSkillItem.type
          );
        }
      }
      else if (skill) {
        stat = getShortStat(skill.data.data.stat);
      }
    }

    let current = 0,
        remaining = 0;
    if (stat) {
      current = actor.data.data.stats[stat].pool.value;
      remaining = current;
    }    

    super({
      actor,
      stat,
      skill,
      skills: [],
      ability,
      current,
      remaining,
      assets,
      currentEffort: 0,
      cost: 0,
      taskLevel,
      useArmorSpeedEffortRule: (game.settings.get("numenera", "armorPenalty") === "new"),
      armorSpeedEffortIncrease: actor.extraSpeedEffortCost,
      powerShifts: [],
      powerShift,
      rollData,
  }, {});

    this._isInitialized = false;
  }
  
  /**
   * Initialize the EffortDialog. Required since we would need to make some async calls in the class
   * constructor, which would make the constructor async, which is not allowed, obviously.
   *
   * @returns {Promise<EffortDialog>}
   * @memberof EffortDialog
   */
  async init() {
    this.object.skills = (await this.object.actor.getEmbeddedCollection("Item"))
      .filter(i => i.type === NumeneraSkillItem.type);

    this.object.skills = this.object.skills.map(sk => {
      //Append an extra label to tell which skills are related to an ability
      if (sk.data.relatedAbilityId)
        sk.data.name += " " + game.i18n.localize("NUMENERA.effort.skillAbilitySuffix");

      return sk;
    });

    let powerShifts = null;
    if (game.settings.get("numenera", "usePowerShifts")) {
      this.object.powerShifts = (await this.object.actor.getEmbeddedCollection("Item"))
                                .filter(i => i.type === "powerShift");
    }

    this._isInitialized = true;
  }

  /**
   * Taking the current state of the EffortDialog, return a warning if any needs
   * to be displayed; return null if none is appropriate.
   *
   * @readonly
   * @returns {String|null} The warning to display, null if none.
   * @memberof EffortDialog
   */
  get warning() {
    if (!this.object.stat)
    {
      return game.i18n.localize("NUMENERA.effort.warning.provideStat");
    }

    if (this.object.remaining < 0)
    {
      return game.i18n.localize("NUMENERA.effort.warning.notEnoughPoolPoints");
    }

    return null;
  }

  /**
   * Get the final task level, taking into account the selected skill's level and
   * inability, if any, the number of assets as well as effort level as modifiers.
   *
   * @readonly
   * @returns {Number} The total task level.
   * @memberof EffortDialog
   */
  get finalLevel() {
    if (this.object.taskLevel === null)
      return null;

    let level = this.object.taskLevel
              - this.object.currentEffort
              - this.object.assets
              + (this.object.actor.data.data.damageTrack > 0 ? 1 : 0);
    
    if (this.object.skill) {
      //TODO use the SkillItem method to convert it when it's set instead of checking here
      let skillData = this.object.skill.data;
      if (skillData.hasOwnProperty("data"))
        skillData = skillData.data;

      level = level - skillData.skillLevel + (skillData.inability ? 1 : 0);

      if (skillData.stat === "speed")
        level += this.object.speedEffortCostIncrease;
    }

    if (this.object.powerShifts && this.object.powerShift) {
      level -= this.object.powerShift.data.data.level;
    }

    return Math.max(level, 0); //Level cannot be negative
  }

  /**
   * Checks whether the current task allows an automatic sucess.
   *
   * @readonly
   * @memberof EffortDialog
   */
  get automaticSuccess() {
    /* JS "fun" fact:
    null == 0 returns false
    null <= 0 and null >= 0 both return true

    ¯\_(ツ)_/¯

    #ididntchoosetheJSlife
    */
    const finalLevel = this.finalLevel;
    return finalLevel !== null && finalLevel <= 0;
  }

  /**
   *
   *
   * @readonly
   * @memberof EffortDialog
   */
  get automaticFailure() {
    const finalLevel = this.finalLevel;
    //A task level of 7 would require rolling a 21 on a d20. Good luck with that!
    //Also, see note in the automaticSuccess getter.
    return finalLevel !== null && finalLevel >= 7;
  }

  /**
   * Get the text to display on the roll button at the bottom of the dialog.
   *
   * @readonly
   * @returns {String} The button text.
   * @memberof EffortDialog
   */
  get rollButtonText() {
    let text = game.i18n.localize("NUMENERA.roll");
    if (this.object.currentEffort > 0) {
      text += ` ${game.i18n.localize("NUMENERA.with")} ${this.object.currentEffort} ${game.i18n.localize("NUMENERA.effort.title")}`;
    }

    if (this.object.taskLevel > 0) {
      text += ` ${game.i18n.localize("NUMENERA.effort.againstTaskLevel")} ${this.finalLevel}`;
    }

    return text;
  }

  get automaticSuccessText() {
    return game.i18n.localize("NUMENERA.effort.succeedAutomatically");
  }

  get automaticFailureText() {
    return game.i18n.localize("NUMENERA.effort.failAutomatically");
  }

  /**
   * @inheritdoc
   */
  getData() {
    if (!this._isInitialized) {
      //TODO translation
      ui.notifications.error("You need to call init() before using the EffortDialog");
      this.close();
      return;
    }

    const data = super.getData();

    data.stats = NUMENERA.stats;
    data.rollModes = EffortDialog.rollModes;

    data.skills = this.object.skills;
    data.skill = this.object.skill;

    data.powerShifts = this.object.powerShifts;
    data.powerShift = this.object.powerShift;

    if (this.object.stat)
      data.stat = "NUMENERA.stats." + this.object.stat;

    data.useArmorSpeedEffortRule = this.object.useArmorSpeedEffortRule;

    if (data.useArmorSpeedEffortRule) {
      if (this.object.stat === "speed")
        data.armorSpeedEffortIncrease = this.object.armorSpeedEffortIncrease;
      else
        data.armorSpeedEffortIncrease = "--";
    }

    data.assets = this.object.assets;
    data.damageTrackPenalty = this.object.actor.data.data.damageTrack > 0;
    data.currentEffort = this.object.currentEffort;
    data.maxEffortLevel = this.object.actor.data.data.effort;
    data.taskLevel = this.object.taskLevel;
    data.finalLevel = this.finalLevel;
    data.current = this.object.current;
    data.rollMode = this.object.rollMode;

    if (this.object.ability) {
      data.cost = this.object.actor.getEffortCostFromAbility(this.object.ability, this.object.currentEffort);
      data.remaining = data.current - data.cost;
    }
    else if (data.stat) {
      data.cost = this.object.actor.getEffortCostFromStat(this.object.stat, this.object.currentEffort);
      data.remaining = data.current - data.cost;
    }
    else {
      data.cost = 0;
      data.current = null;
      data.remaining = null;
    }

    data.warning = this.warning;
    data.displayWarning = !!data.warning;
    data.rollButtonText = this.rollButtonText;
    data.automaticFailureText = this.automaticFailureText;
    data.automaticSuccessText = this.automaticSuccessText;
    data.rollButtonText = this.rollButtonText;
    data.automaticFailure = this.automaticFailure;
    data.automaticSuccess = this.automaticSuccess;

    return data;
  }

  /**
   * @inheritdoc
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find("#roll-with-effort").click(this._rollWithEffort.bind(this));
    html.find("#failure-close").click(this._failAutomatically.bind(this));
    html.find("#succeed-automatically").click(this._succeedAutomatically.bind(this));
  }

  /**
   * Perform a roll with the values selected from the dialog.
   *
   * @param {Event} event
   * @memberof EffortDialog
   */
  async _rollWithEffort(event) {
    event.preventDefault();

    const actor = this.object.actor;
    const shortStat = getShortStat(this.object.stat);

    if (!this.object.stat)
      throw new Error("You must provide a stat before using Effort");

    const poolValue = actor.data.data.stats[shortStat].pool.value;

    let cost;
    if (this.object.ability)
      cost = actor.getEffortCostFromAbility(this.object.ability, this.object.currentEffort);
    else
      cost = actor.getEffortCostFromStat(shortStat, this.object.currentEffort);
    
    if (cost > poolValue) {
      ui.notifications.warn(game.i18n.localize("NUMENERA.effort.warning.notEnoughPoolPoints"));
      return;
    }

    const rollData = this.object.rollData ? this.object.rollData : new RollData();

    rollData.effortLevel = this.object.currentEffort;
    rollData.taskLevel = this.finalLevel;
    rollData.rollMode = this.object.rollMode;
    rollData.damageTrackPenalty = this.object.actor.data.data.damageTrack;
    rollData.assets = this.object.assets;

    if (this.object.skill) {
      let skill = this.object.skill;

      //Fetch the skill, might be one of these weird kind-of-Item objects
      if (skill._id)
        skill = this.object.actor.items.get(this.object.skill.id);

      actor.rollSkill(skill, rollData, this.object.ability, this.object.assets);
    }
    else {
      await actor.rollAttribute(shortStat, rollData);
    }

    if (cost > 0) {
      const poolProp = `data.stats.${shortStat}.pool.value`;

      const data = { _id: actor.id };
      data[poolProp] = poolValue - cost;
  
      //TIME TO PAY THE PRICE MWAHAHAHAHAHAHAH
      actor.update(data);
    }

    this.close();
  }

  async _failAutomatically() {
    //Ensure that is really the case
    if (!this.automaticFailure || this.automaticSuccess) {
      throw new Error("Should not fail automatically in this case");
    }

    const flavor = `${game.i18n.localize("NUMENERA.rolling")} ${this.object.skill ? this.object.skill.name : getShortStat(this.object.stat)}`;

    await ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      sound: CONFIG.sounds.dice,
      content: await renderTemplate("systems/numenera/templates/chat/automaticResult.html", {
        flavor,
        result: game.i18n.localize("NUMENERA.effort.failAutomatically"),  
      }),
    });

    this.close();
  }

  async _succeedAutomatically() {
    //Ensure that is really the case
    if (this.automaticFailure || !this.automaticSuccess) {
      throw new Error("Should not succeed automatically in this case");
    }
    
    const flavor = `${game.i18n.localize("NUMENERA.rolling")} ${this.object.skill ? this.object.skill.name : getShortStat(this.object.stat)}`;

    await ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({user: game.user}),
      sound: CONFIG.sounds.dice,
      content: await renderTemplate("systems/numenera/templates/chat/automaticResult.html", {
        flavor,
        result: game.i18n.localize("NUMENERA.effort.succeedAutomatically"),
      }),
    });

    this.close();
  }

  /**
   * @inheritdoc
   */
  _updateObject(event, formData) {
    this.object.assets = formData.assets;
    this.object.taskLevel = formData.taskLevel;
    this.object.currentEffort = formData.currentEffort;
    this.object.rollMode = formData.rollMode;

    if (formData.stat)
      formData.stat = getShortStat(formData.stat);

    // Did the skill change?
    if (formData.skill && (this.object.skill == null || formData.skill !== this.object.skill.id)) {
      //In that case, update the stat to be the skill's stat
      this.object.skill = this.object.actor.items.get(formData.skill);

      if (this.object.skill) {
        this.object.stat = getShortStat(this.object.skill.data.data.stat);

        //Check for a related ability, use for calculating the final cost
        if (this.object.skill.data.data.relatedAbilityId) {
          this.object.ability = this.object.actor.items.get(this.object.skill.data.data.relatedAbilityId);
        }
        else {
          this.object.ability = null;
        }
      }
    }
    // Otherwise, did the stat change?
    else if (formData.stat && formData.stat !== this.object.stat) {
      this.object.stat = formData.stat;

      //Changing the stat for a skill is fine, but not if an ability was linked to it
      if (this.object.ability) {
        this.object.skill = null;
        this.object.ability = null;
      }
    } 
    else if (!formData.skill) {
      //Skill deselected
      this.object.skill = null;
      this.object.ability = null;
    }

    if (this.object.ability) {
      this.object.cost = this.object.actor.getEffortCostFromAbility(this.object.ability, this.object.currentEffort);
    }
    else {
      this.object.cost = this.object.actor.getEffortCostFromStat(this.object.stat, this.object.currentEffort);
    }

    //Recompute current and remaining pool values
    const actor = this.object.actor;
    const shortStat = getShortStat(this.object.stat);
    this.object.current = actor.data.data.stats[shortStat].pool.value;
    this.object.remaining = this.object.current - this.object.cost;

    if (formData.powerShift)
      this.object.powerShift = actor.getEmbeddedCollection("Item")
                           .find(i => i._id === formData.powerShift);
    else
      this.object.powerShift = null;
    
    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }
}
