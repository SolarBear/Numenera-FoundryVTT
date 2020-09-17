import { NUMENERA } from "../config.js";

export class EffortDialog extends FormApplication {
  /**
   * @inheritdoc
   */
  static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
      classes: ["numenera"],
      title: "Effort",
      template: "systems/numenera/templates/dialog/effort.html",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      editable: true,
      width: 480,
      height: 340,
    });
  }

  constructor(actor, stat=null, skill=null) {
    super({actor, stat, skill}, {});
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
      })

    data.effortLevel = 0;
    data.maxEffortLevel = this.object.actor.effort;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    //Listener pour pool
  }

  _updateObject(event, formData) {
    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }
}