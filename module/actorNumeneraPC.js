import { NUMENERA } from "./config.js";

const skillTemplate = {
  id: "",
  name: "",
  stat: "", //related stat: might, speed or intellect
  inability: false,
  level: 0, //0: unskilled (default), 1: trained, 2: specialized
};

const effortObject = {
  cost: 0,
  effortLevel: 0,
  warning: null,
};

/**
 * Extend the base Actor class to implement additional logic specialized for Numenera.
 */
export class ActorNumeneraPC extends Actor {
  get effort() {
    const data = this.data.data;

    return data.tier + (data.advances.effort ? 1 : 0);
  }
  
  /**
   * Given a skill ID, return this skill's level as a a numeric value.
   *
   * @param {string} skillId
   * @returns {Number}
   * @memberof ActorNumeneraPC
   */
  getSkillLevel(skillId) {
    const skills = this.data.data.skills || {};

    if (skills.hasOwnProperty(skillId)) {
      return skills[skillId].level;
    }

    return 0; //defauklt skill level, aka unskilled
  }

  /**
   * Add a new skill to the PC actor.
   *
   * @param {string} name Name of the skill
   * @param {string} stat Stat used for that skill (Might, Speed or Intellect)
   * @param {number} [level=1] Skill level (0 = untrained, 1 = trained, 2 = specialized)
   * @param {boolean} [inability=false] Inability
   * @returns The new skill object
   * @memberof ActorNumeneraPC
   */
  addSkill(name, stat, level=1, inability=false) {
    if (this.getSkillLevel(name)) {
      throw new Error("This PC already have the skill " + name);
    }

    const id = name.replace(" ", ""); //id will be the skill name, without whitespace
    const skill = {
      id,
      name,
      stat,
      level,
      inability,
    };

    this.data.data.skills[id] = skill;
    return skill;
  }

  /**
   * Delete a skill from a PC actor's list.
   *
   * @param {string} skillId String ID of the skill to delete
   * @returns The remaining skills
   * @memberof ActorNumeneraPC
   */
  deleteSkill(skillId) {
    if (!this.data.data.skills.hasOwnProperty(skillId)) {
      throw new Error("This PC does not have that skill");
    }

    delete this.data.data.skills[skillId];
    return this.data.data.skills;
  }

  /**
   * Given a stat ID, return all skills related to that stat.
   *
   * @param {string} statId
   * @returns {Array}
   * @memberof ActorNumeneraPC
   */
  filterSkillsByStat(statId) {
    if (!statId) {
      return this.skills;
    }

    return this.data.data.skills.filter(id => id == statId);
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   *
   * @memberof ActorNumeneraPC
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data.data;

    if (actorData.version === undefined || actorData.version < 1)
    {
      Object.entries(actorData.stats).forEach((stat, i) => {
        return {
          ...stat,
          name: NUMENERA.stats[i[0]]
        };
      });
    }

    actorData.effort = actorData.tier + actorData.advances.effort ? 1 : 0;
  }

  getEffortCostFromStat(event) {
    const effortLevel = event.target.value;
    const statId = event.target.dataset.statId;

    const value = {...effortObject};
    if (effortLevel === 0) {
      return value;
    }

    const actorData = this.data.data;
    const stat = actorData.stats[statId];

    //The first effort level costs 3 pts from the pool, extra levels cost 2
    //Substract the Edge, too
    const availableEffortFromPool = (stat.pool.current - stat.edge - 1) / 2;

    //A PC can use as much as their Effort score, but not more
    //They're also limited by their current pool value
    const finalEffort = Math.max(effortLevel, actorData.effort, availableEffortFromPool);
    const cost = 1 + 2 * finalEffort - stat.edge;

    //TODO take free levels of Effort into account here

    let warning = null;
    if (effortLevel > availableEffortFromPool) {
      warning = `Not enough points in your ${statId} pool for that level of Effort`;
    }

    value.cost = cost;
    value.effortLevel = finalEffort;
    value.warning = warning;

    return value;
  }

  // rollStat(statId, options={}) {
  //   return numeneraRoll({
  //     statId,
  //     event: options.event,
  //     actor: this,
  //     title: `${NUMENERA.stats[statId[0]]} Roll`,
  //     speaker: ChatMessage.getSpeaker({actor: this}),
  //   });
  // }
}
