/**
 * GM intrusion dialog. Requires a stand-alone class since we need to force the player to answer the
 * dialog question. To do so we
 * 
 * 1. disable the upper-right corner "X" button
 * 2. disable the Escape key closing the form
 * 3. put no default value
 *
 * @export
 * @class GMIntrusionDialog
 * @extends {Dialog}
 */
export class GMIntrusionDialog extends Dialog {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    template: "templates/hud/dialog.html",
      classes: ["dialog"],
      width: 500,
      classes: ["numenera", "dialog"],
    });
  }

  constructor(actor, options = {}) {
    const dialogData = {
      title: game.i18n.localize("NUMENERA.gmIntrusion"),
      content: game.i18n.localize("NUMENERA.gmIntrusionContent"),
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("NUMENERA.gmIntrusionButtonAccept"),
          callback: async () => {
            await actor.onGMIntrusion(true);
            super.close();
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("NUMENERA.gmIntrusionButtonRefuse"),
          callback: async () => {
            await actor.onGMIntrusion(false);
            super.close();
          }
        },
      },
      defaultYes: false,
    };

    super(dialogData, options);
    this.actor = actor;
  }

  /** @override */
  _getHeaderButtons() {
    //No header buttons, this is one of the reasons for this class' existence!
    return [];
  }

  /** @override */
  close() {
    //Default to do nothing (ie. not close)
    //To really close the dialog, use super.close()
  }
}