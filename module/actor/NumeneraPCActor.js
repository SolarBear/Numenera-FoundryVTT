import { NUMENERA } from '../config.js';

const effortObject = {
  cost: 0,
  effortLevel: 0,
  warning: null,
};

/**
 * Extend the base Actor class to implement additional logic specialized for Numenera.
 */
export class NumeneraPCActor extends Actor {

  getInitiativeFormula() {
    //Check for an initiative skill
    const initSkill = 3 * this.getSkillLevel("Initiative");
    
    //TODO possible assets, effort on init roll
    let formula = "1d20"
    if (initSkill !== 0) {
      formula += `+${initSkill}`;
    }

    return formula;
  }

  get effort() {
    const data = this.data.data;

    return data.tier + (data.advances.effort ? 1 : 0);
  }

  /**
   * Get the current PC's level on the damage track as an integer, 0 being Hale and 3 being Dead.
   * @type {Object} stats Stats object (see template.json)
   */
  damageTrackLevel(stats = null) {
    if (stats === null)
      stats = this.data.data.stats;

    //Each stat pool whose value is 0 counts as being one step higher on the damage track
    return Object.values(stats).filter(stat => {
      return stat.pool.current === 0;
    }).length;
  }
  
  /**
   * Given a skill ID, return this skill's level as a a numeric value.
   *
   * @param {string} skillId
   * @returns {Number}
   * @memberof ActorNumeneraPC
   */
  getSkillLevel(skillId) {
    const skill = this.data.data.skills[skillId];

    let level = 0;
    
    if (skill) {
      if (skill.inability) level--;

      if (skill.specialized) level + 2;
      else if (skill.trained) level++;
    }

    return level; //defauklt skill level, aka unskilled
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
  }

  getEffortCostFromStat(event) {
    //Return value, copy from template object
    const value = {...effortObject};

    const effortLevel = event.target.value;
    if (effortLevel === 0) {
      return value;
    }
        
    const actorData = this.data.data;

    const statId = event.target.dataset.statId;
    const stat = actorData.stats[statId];

    //The first effort level costs 3 pts from the pool, extra levels cost 2
    //Substract the related Edge, too
    const availableEffortFromPool = (stat.pool.current + stat.edge - 1) / 2;

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
}
