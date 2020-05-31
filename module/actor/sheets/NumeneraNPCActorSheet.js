import { NUMENERA } from "../../config.js";

/**
 * Extend the basic ActorSheet class to do all the Numenera things!
 *
 * @type {ActorSheet}
 */
export class NumeneraNPCActorSheet extends ActorSheet {
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 750,
      height: 700,
    });
  }

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/npcSheet.html";
  }

  /**
   * @inheritdoc
   */
  getData() {
    const sheetData = super.getData();

    sheetData.ranges = NUMENERA.ranges;

    return sheetData;
  }

  /**
   * Add character sheet-specific event listeners.
   *
   * @param {*} html
   * @memberof ActorSheetNumeneraNPC
   */
  activateListeners(html) {
    super.activateListeners(html);

    html
      .find("table.attacks")
      .on("click", ".attack-control", this.onAttackControl.bind(this));
  }

  /**
   * Handles the click event on add/delete attack controls.
   *
   * @param {*} event
   * @memberof NumeneraNPCActorSheet
   */
  async onAttackControl(event) {
    event.preventDefault();

    const a = event.currentTarget;
    const action = a.dataset.action;

    switch (action) {
      case "create":
        const table = a.closest("table");
        const template = table.getElementsByTagName("template")[0];
        const body = table.getElementsByTagName("tbody")[0];

        if (!template)
          throw new Error(`No row template found in attacks table`);

        //Let's keep things simple here: get the largest existing id and add one
        const id =
          Math.max(
            ...[...body.children].map((c) => c.children[0].children[0].value || 0)
          ) + 1 + "";

        const newRow = template.content.cloneNode(true);
        body.appendChild(newRow);

        //That "newRow"? A DocumentFragment. AN IMPOSTOR.
        const actualRow = body.children[body.children.length - 1];
        actualRow.children[0].children[0].name = `data.attacks.${id}.id`;
        actualRow.children[0].children[0].value = id;
        actualRow.children[0].children[1].name = `data.attacks.${id}.description`;

        await this._onSubmit(event);
        break;

      case "delete":
        const row = a.closest(".attack");
        row.parentElement.removeChild(row);

        await this._onSubmit(event);
        break;

      default:
        throw new Error("Unhandled case in onAttackControl");
    }
  }

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   *
   * Mostly handles the funky behavior of dynamic tables inside the form.
   *
   * @private
   */
  async _updateObject(event, formData) {
    //TODO this is repeated in NumeneraPCActorSheet, try to abstract all of this a bit plz
    const fd = expandObject(formData);

    const formAttacks = fd.data.attacks || {};

    //***************************
    //DISGUSTING WORKAROUND ALERT
    //***************************

    //TODO FIX THIS SHIT
    //For some extra-weird reason, I get NaN sometimes as an ID, so just swap it around
    let nAnPatch = 1000;

    for (let at of Object.values(formAttacks)) {
      if (typeof at.id !== "string") {
        console.warn("Oops! Weird NaN problem here, buddy");
        
        //Avoid collisions, in case this is not the first time this happens
        while (Object.values(formAttacks).some(at => at.id == nAnPatch))
          ++nAnPatch;

        at.id = nAnPatch.toString();
        ++nAnPatch;
      }
    }

    //*******************************
    //END DISGUSTING WORKAROUND ALERT
    //*******************************

    const formDataReduceFunction = function (obj, v) {
      if (v.hasOwnProperty("id")) {
        const id = v["id"].trim();
        if (id) obj[id] = v;
      }

      return obj;
    };

    const attacks = Object.values(formAttacks).reduce(formDataReduceFunction, {});

    // Remove attacks which are no longer used
    for (let at of Object.keys(this.object.data.data.attacks)) {
      if (at && !attacks.hasOwnProperty(at)) attacks[`-=${at}`] = null;
    }

    // Re-combine formData
    formData = Object.entries(formData)
      .filter((e) => !e[0].startsWith("data.attacks"))
      .reduce(
        (obj, e) => {
          obj[e[0]] = e[1];
          return obj;
        },
        {
          _id: this.object._id,
          "data.attacks": attacks,
        }
      );

    // Update the Actor
    await this.object.update(formData);

    //In case the NPC level changed, re-render the ActorDirectory
    ui.actors.render();
  }
}
