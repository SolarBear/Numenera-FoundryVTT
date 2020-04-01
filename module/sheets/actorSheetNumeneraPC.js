import { NUMENERA } from '../config.js';
import { NUMENERA } from '../config.js'

/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class ActorSheetNumeneraPC extends ActorSheet {
  /**
  * Define default rendering options for the NPC sheet
  * @return {Object}
  */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 925,
      height: 1100
    });
  }

  static get advances() {
    return NUMENERA.advances;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/characterSheet.html";
  }

  /**
   * Get the current PC's level on the damage track as an integer, 0 being Hale and 3 being Dead.
   * @type {Number}
   */
  damageTrackLevel(data) {
    //Each stat whose value is 0 counts as being one step higher on the damage track
    return Object.values(data.stats).filter(stat => {
      return stat.pool.current === 0;
    }).length;
  }

  /**
   * Provides the data objects provided to the character sheet. Use that method
   * to insert new values or mess with existing ones.
   */
  getData() {
    const sheetData = super.getData();

    const actorType = sheetData.actor.data.characterType || "";

    //Copy labels to be used as is
    sheetData.ranges = NUMENERA.ranges;
    sheetData.skillLevels = NUMENERA.skillLevels;
    sheetData.weaponTypes = NUMENERA.weaponTypes;
    sheetData.weightClasses = NUMENERA.weightClasses;

    //"Augment" the types objects with a new "isActorType" property
    sheetData.types = NUMENERA.types.map(value => {
      return {
        ...value,
        isActorType: value.abbrev === actorType,
      }
    });

    sheetData.advances = Object.entries(sheetData.actor.data.advances).map(([key, value]) => {
      return {
        name: key,
        label: NUMENERA.advances[key],
        isChecked: value,
      }
    });

    const currentDamageTrack = this.damageTrackLevel(sheetData.actor.data);
    sheetData.damageTrackData = Object.values(NUMENERA.damageTrack).map(trackLevel => {
      return {
        ...trackLevel,
        checked: trackLevel.index === currentDamageTrack,
      }
    });
    sheetData.damageTrackDescription = sheetData.damageTrackData.filter(d => d.checked)[0].description;

    sheetData.recoveriesData = Object.entries(sheetData.actor.data.recoveries).map(([key, value]) => {
      return {
        key,
        label: NUMENERA.recoveries[key],
        checked: value,
      };
    });

    return sheetData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".skills").on("click", ".skill-control", this.onClickSkillControl.bind(this));

    //Roll!
    //html.find(".roll").click(this.onStatRoll.bind(this));
  }

  //Mostly taken from the Simple Worlduiblding sheet: https://gitlab.com/foundrynet/worldbuilding/-/blob/master/module/actor-sheet.js
  async onClickSkillControl(event) {
    event.preventDefault();

    const a = event.currentTarget;
    const action = a.dataset.action;

    switch (action) {
      case "create":
        const table = a.closest("table");
        const template = table.getElementsByTagName("template")[0];
        const body = table.getElementsByTagName("tbody")[0];

        if (!template)
          throw new Error("No row template found in table for onClickSkillControl");

        const newRow = template.content.cloneNode(true);
        body.appendChild(newRow);
        await this._onSubmit(event);
        break;
        
      case "delete":
        const row = a.closest(".skill");
        row.parentElement.removeChild(row);
        await this._onSubmit(event);
        break;
      default:
        return;
    }
  }

  onStatRoll(event) {
    // event.preventDefault();

    // //TODO major YUCK, fix this!
    // const stat = event.target.parentElement.parentElement.dataset.stat;

    // //TODO await?
    // RollDialog.create(this.actor, stat);
  }

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   * @private
   */
  _updateObject(event, formData) {

    // Handle the free-form skills list
    const formSkills = expandObject(formData).data.skills || {};
    const pcSkills = this.object.data.data.skills || {};

    const newSkills = new Set(
      [...Object.keys(formSkills)].filter(s => !pcSkills.hasOwnProperty(s))
    );
    const deletedSkills = new Set(
      [...Object.keys(pcSkills)].filter(s => !formSkills.hasOwnProperty(s))
    );

    //Remove deleted skills
    deletedSkills.forEach(sk => {
      //delete pcSkills[sk];
      this.object.deleteSkill(sk);
    });

    newSkills.forEach(sk => {
      const skill = formSkills[sk];
      if (typeof skill === 'undefined')
        throw new Error("Unknown skill " + sk);

      let level;
      switch (true) {
        case skill.specialized:
          level = 2;
          break;
        case skill.trained:
          level = 1;
          break;
        default:
          level = 0;
      }
    });

    // Re-combine formData
    // formData = Object.entries(formData).filter(e => !e[0].startsWith("data.skills"))
    //   .reduce((obj, e) => {
    //     obj[e[0]] = e[1];
    //     return obj;
    //   }, {_id: this.object._id, "data.skills": pcSkills});

    // Update the Actor
    return this.object.update(formData);
  }
}
