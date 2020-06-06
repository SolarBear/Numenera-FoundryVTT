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
      width: 850,
      height: 650,
    tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "#npc-sheet-body",
        },
      ],
    });
  }

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/numenera/templates/actor/npcSheet.html";
  }

  /**
   * @inheritdoc
   */
  getData() {
    const sheetData = super.getData();

    sheetData.ranges = NUMENERA.ranges.map(r => game.i18n.localize(r));

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
}
