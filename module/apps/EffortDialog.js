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
      height: 300,
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

  /**
   * @inheritdoc
   */
  getData() {
    const data = super.getData();

    data.stats = NUMENERA.stats;
    // data.skills = this.object.actor.getEmbeddedCollection("OwnedItem")
    //   .filter(i => i.type === "skill")
    //   .map(sk => {
    //     return {
    //       id: sk._id,
    //       name: sk.name,
    //     };
    //   });
    // data.skill = this.object.skill;

    let shortStat = null,
        stat = null;
    if (this.object.stat) {
      shortStat = this.object.stat.split(".").pop(); // pool is saved as "NUMENERA.pool.POOLNAME";
      stat = this.object.actor.data.data.stats[shortStat];

      data.stat = this.object.stat;
    }
    
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
    debugger;
    const actor = this.object.actor;

    let skill = null;
    const skillId = this.object.skill;
    if (skillId) {
      skill = actor.getOwnedItem(skillId);
      return actor.rollSkill(skill);
    }
    else {
      return actor.rollAttribute(this.object.stat);
    }
  }

  _updateObject(event, formData) {
    this.object.stat = formData.stat;
    this.object.currentEffort = formData.currentEffort;
    //this.object.skill = formData.skill;
    
    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }
}