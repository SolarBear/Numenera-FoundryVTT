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
   * Given a skill ID, return this skill's modifier as a a numeric value.
   *
   * @param {string} skillId Item ID of the skill
   * @returns {Number} Skill modifier in the [-1, 2] range
   * @memberof ActorNumeneraPC
   */
  getSkillLevel(skill) {
    if (!skill)
      throw new Error("No skill provided");

    if (!skill.data.data)
      return 0; //skills are untrained by default

    skill = skill.data.data;
    let level = -Number(skill.inability); //Inability subtracts 1 from overall level

    if (skill.specialized) level += 2;
    else if (skill.trained) level += 1;

    return level;
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

  /**
   * BASE CLASS OVERRIDES
   */

  /**
   * @override
   */
  async createEmbeddedEntity(...args) {
    const [_, data] = args;

    //Prepare numenera items by rolling their level, if they don't have one already
    if (data.data && ['artifact', 'cypher'].indexOf(data.type) !== -1) {
      const itemData = data.data;

      if (!itemData.level && itemData.levelDie) {  
        try {
            //Try the formula as is first
            itemData.level = new Roll(itemData.levelDie).roll().total;
            await this.update({
                _id: this._id,
                "data.level": itemData.level,
            });
        }
        catch (Error) {
            try {
                itemData.level = parseInt(itemData.level)
            }
            catch (Error) {
                //Leave it as it is
            }
        }
      } else {
          itemData.level = itemData.level || null;
      }
    }

    return super.createEmbeddedEntity(...args);
  }
}
