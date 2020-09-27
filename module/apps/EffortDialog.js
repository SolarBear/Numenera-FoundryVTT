import { NUMENERA } from "../config.js";
import { getShortStat } from "../utils.js";
import { RollData } from "../dice/RollData.js";
import { NumeneraPCActor } from "../actor/NumeneraPCActor.js";
import { NumeneraSkillItem } from "../item/NumeneraSkillItem.js";

export class EffortDialog extends FormApplication {
  /**
   * @inheritdoc
   */
  static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
      classes: ["numenera"],
      title: "Roll with Effort",
      template: "systems/numenera/templates/dialog/effort.html",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      editable: true,
      width: 360,
      height: 425,
    });
  }

  /**
   *Creates an instance of EffortDialog.
  * @param {NumeneraPCActor} actor
  * @param {string} [stat=null]
  * @param {NumeneraSkillItem} [skill=null]
  * @memberof EffortDialog
  */
  constructor(actor, stat=null, skill=null, ability=null) {
    if (!stat) {
      if (ability)
        stat = ability.data.data.cost.pool;
        //TODO if ability but no skill, fetch skill by its related skill ID
      else if (skill)
        stat = skill.data.data.stat;
    }

    super({
      actor,
      stat,
      skill,
      ability,
      assets: 0,
      current: 0,
      currentEffort: 0,
      cost: 0,
      taskLevel: null,
    }, {});
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
      return "You must provide a stat before using Effort";
    }

    if (this.object.remaining < 0)
    {
      return "Insufficient points in this pool for this level of Effort";
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

    let level = this.object.taskLevel - this.object.currentEffort - this.object.assets;

    if (this.object.skill) {
      level = level - this.object.skill.data.data.skillLevel
                    + (this.object.skill.data.data.inability ? 1 : 0);
    }

    return Math.max(level, 0); //Level cannot be negative
  }

  /**
   * @inheritdoc
   */
  getData() {
    const data = super.getData();

    data.stats = NUMENERA.stats;
    data.rollModes = [
      {
        label: "Public",
        value: DICE_ROLL_MODES.PUBLIC,
      },
      {
        label: "Private",
        value: DICE_ROLL_MODES.PRIVATE,
      },
      {
        label: "Blind",
        value: DICE_ROLL_MODES.BLIND,
      },
      {
        label: "Self",
        value: DICE_ROLL_MODES.SELF,
      }
    ];
    data.skills = this.object.actor.getEmbeddedCollection("OwnedItem")
      .filter(i => i.type === "skill")
      .map(sk => {
        return {
          id: sk._id,
          name: sk.name,
        };
      });
    data.skill = this.object.skill;

    if (this.object.stat)
      data.stat = "NUMENERA.stats." + this.object.stat;

    data.assets = this.object.assets;
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

    return data;
  }

  /**
   * @inheritdoc
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find("#roll-with-effort").click(this._rollWithEffort.bind(this));
  }

  /**
   * Perform a roll with the values selected from the dialog.
   *
   * @param {Event} event
   * @memberof EffortDialog
   */
  async _rollWithEffort(event) {
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
      ui.notifications.warn("Not enough points in your pool for this roll");
      return;
    }

    const rollData = new RollData();
    rollData.effortLevel = this.object.currentEffort;
    rollData.taskLevel = this.finalLevel;
    rollData.rollMode = this.object.rollMode;

    if (this.object.skill) {
      actor.rollSkill(this.object.skill, rollData, this.object.ability);
    }
    else {
      actor.rollAttribute(shortStat, rollData);
    }

    if (cost <= 0)
      return;

    const poolProp = `data.stats.${shortStat}.pool.value`;

    const data = { _id: actor._id };
    data[poolProp] = poolValue - cost;

    //TIME TO PAY THE PRICE MWAHAHAHAHAHAHAH
    actor.update(data);

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

    //TODO OMG clean this up

    // Did the skill change?
    if (formData.skill && (this.object.skill == null || formData.skill !== this.object.skill._id)) {
      //In that case, update the stat to be the skill's stat
      this.object.skill = this.object.actor.getOwnedItem(formData.skill);

      if (this.object.skill) {
        this.object.stat = getShortStat(this.object.skill.data.data.stat);

        //Check for a related ability, use for calculating the final cost
        const relatedAbilityId = this.object.skill.data.data.relatedAbilityId;
        if (relatedAbilityId) {
          this.object.ability = this.object.actor.getOwnedItem(relatedAbilityId);
          this.object.cost = this.object.actor.getEffortCostFromAbility(this.object.ability, this.object.currentEffort);
        }
        else {
          this.object.ability = null;
          this.object.cost = this.object.actor.getEffortCostFromStat(getShortStat(this.object.stat), this.object.currentEffort);
        }
      }
    }
    // Otherwise, did the stat change?
    else if (formData.stat && formData.stat !== this.object.stat) {
      this.object.stat = formData.stat;
      this.object.cost = this.object.actor.getEffortCostFromStat(getShortStat(this.object.stat), this.object.currentEffort);

      //Changing the stat for a skill is fine, but not if an ability was linked to it
      if (this.object.ability) {
        this.object.skill = null;
        this.object.ability = null;
      }
    } else if (!formData.skill) {
      //Skill deselected
      this.object.skill = null;
      this.object.ability = null;
      this.object.cost = this.object.actor.getEffortCostFromStat(this.object.stat, this.object.currentEffort);
    }

    //Recompute current and remaining pool values
    const actor = this.object.actor;
    const shortStat = getShortStat(this.object.stat);
    this.object.current = actor.data.data.stats[shortStat].pool.value;
    this.object.remaining = this.object.current - this.object.cost;
    
    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }
}