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
      title: "GM Intrusion!",
      content: `<p>The game master offers you an intrusion. Do you accept?</p>
      <ul>
        <li>Should you accept, the GM will introduce an unexpected complication for your character; however, you will receive 2 XP, 1 of which you must give to another player.</li>
        <li>Should you refuse, the complication will not happen but 1 XP will be subtracted from your current amount.</li>
      </ul>`,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "Accept",
          callback: async () => {
            await actor.onGMIntrusion(true);
            super.close();
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Refuse",
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