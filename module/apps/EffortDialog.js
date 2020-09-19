import { NUMENERA } from "../config.js";

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
      width: 400,
      height: 350,
    });
  }

  constructor(actor, stat=null, skill=null) {
    super({
      actor,
      stat,
      skill,
      currentEffort: 0,
      cost: 0,
    }, {});
  }

  get warning() {
    if (!this.object.stat)
    {
      return "You must provide a stat before using Effort";
    }

    const actor = this.object.actor;
    const shortStat = this.object.stat.split(".").pop();
    const poolValue = actor.data.data.stats[shortStat].pool.value;
    const cost = actor.getEffortCostFromStat(shortStat, this.object.currentEffort);
    
    if (cost > poolValue)
    {
      return "Insufficient points in this pool for this level of Effort";
    }

    return null;
  }

  /**
   * @inheritdoc
   */
  getData() {
    const data = super.getData();

    data.stats = NUMENERA.stats;
    data.skills = this.object.actor.getEmbeddedCollection("OwnedItem")
      .filter(i => i.type === "skill")
      .map(sk => {
        return {
          id: sk._id,
          name: sk.name,
        };
      });
    data.skill = this.object.skill;

    let shortStat = null,
        stat = null;
    if (this.object.stat) {
      shortStat = this.object.stat.split(".").pop(); // pool is saved as "NUMENERA.pool.POOLNAME";
      stat = this.object.actor.data.data.stats[shortStat];

      data.stat = this.object.stat;
    }
    
    data.warning = this.warning;
    data.displayWarning = !!data.warning;
    data.currentEffort = this.object.currentEffort;
    data.maxEffortLevel = this.object.actor.data.data.effort;

    if (data.stat) {
      data.current = stat.pool.value;
      data.cost = this.object.actor.getEffortCostFromStat(shortStat, this.object.currentEffort);
      data.remaining = data.current - data.cost;
    }
    else {
      data.cost = 0;
      data.current = null;
      data.remaining = null;
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("#roll-with-effort").click(this._rollWithEffort.bind(this));
  }

  async _rollWithEffort(event) {
    const actor = this.object.actor;
    //TODO make this into some kind of helper/static method
    const shortStat = this.object.stat.split(".").pop();

    if (!this.object.stat)
      throw new Error("You must provide a stat before using Effort");

    const poolValue = actor.data.data.stats[shortStat].pool.value;
    const cost = actor.getEffortCostFromStat(shortStat, this.object.currentEffort);
    
    if (cost > poolValue)
      throw new Error("You must provide a stat before using Effort");

    let skill = null;
    const skillId = this.object.skill;
    if (skillId) {
      skill = actor.getOwnedItem(skillId);
      actor.rollSkill(skill);
    }
    else {
      actor.rollAttribute(shortStat);
    }

    if (cost <= 0)
      return;

    const poolProp = `data.stats.${shortStat}.pool.value`;

    const data = { _id: actor._id };
    data[poolProp] = poolValue - cost;

    //TIME TO PAY THE PRICE MWAHAHAHAHAHAHAH
    actor.update(data);
  }

  _updateObject(event, formData) {
    this.object.currentEffort = formData.currentEffort;

    // Did the skill change?
    if (formData.skill && formData.skill !== this.object.skill) {
      //In that case, update the stat to be the skill's stat
      this.object.skill = formData.skill;
      const skill = this.object.actor.getOwnedItem(formData.skill);

      if (skill) {
        this.object.stat = skill.data.data.stat;
      }
    }
    // Otherwise, did the stat change?
    else if (formData.stat && formData.stat !== this.object.stat) {
      this.object.stat = formData.stat;
      //If the stat did change, the skill is not relevant anymore
      this.object.skill = null;
    } else if (!formData.skill) {
      //Skill deselected
      this.object.skill = null;
    }
    
    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }
}