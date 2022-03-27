import { NumeneraPCActor } from "../actor/NumeneraPCActor.js";
import { NUMENERA } from "../config.js";

export class RecoveryDialog extends FormApplication {

  /**
   * @inheritdoc
   */
  static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
      classes: ["numenera"],
      title: "Recovery",
      template: "systems/numenera/templates/dialog/recovery.html",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      editable: true,
      width: 480,
      height: "auto",
    });
  }

  /**
   * Creates an instance of RecoveryDialog. Useful to be called
   * from a macro.
   *
   * @static
   * @param {NumeneraPCActor} actor
   * @param {Number} [tempBonus=null] A temporary bonus to add to recovery rolls.
   * @memberof RecoveryDialog
   */
  static create(actor, options={}) {
    if (!actor)
      ui.notifications.error("Tried calling RecoveryDialog.create without an actor");

    (new RecoveryDialog(actor, options)).render(true);
  }

  /**
   * @inheritdoc
   */
  constructor(actor, {tempBonus=null}) {
    const pools = Object.entries(actor.data.data.stats)
    .map(([key, value]) => {
      return {
        name: key,
        value: value.pool.value,
        max: value.pool.max,
        min: value.pool.value,
      };
    });

    const poolsTotal = Object.entries(actor.data.data.stats)
    .reduce((sum, [key, value]) =>
       sum + value.pool.value
    , 0);

    const recoveryDialogObject = {
      actor,
      pools,
      poolsTotal,
      initialPoolsTotal: poolsTotal,
      initialRecoveriesLeft: [...actor.data.data.recoveries],
      recoveriesLeft: [...actor.data.data.recoveries],
      initialUnspentRecoveryPoints: 0,
      unspentRecoveryPoints: 0,
      tempBonus,
    };

    super(recoveryDialogObject, {});
  }

  /**
   * @inheritdoc
   */
  getData() {
    const data = super.getData();

    const recoveriesLabels = Object.entries(NUMENERA.recoveries);
    const recoveriesData = this.object.recoveriesLeft
      .map((recovery, index) => {
        const recoveryIndex = Math.max(0, index - (this.object.actor.data.data.recoveries.length - NUMENERA.totalRecoveries));
        const [key, label] = recoveriesLabels[recoveryIndex];
        return {
          key,
          label,
          checked: !recovery,
          disabled: !this.object.initialRecoveriesLeft[index],
        };
      }
    );

    const rollSelectionEnabled = this.object.recoveriesLeft.filter(Boolean).length > 0;
    const formula = this._getFormula(this.object.initialRecoveriesLeft.filter(Boolean).length - this.object.recoveriesLeft.filter(Boolean).length, this.object.tempBonus);

    const stats = {};
    for (const prop in NUMENERA.stats) {
      stats[prop] = game.i18n.localize(NUMENERA.stats[prop]);
    }

    return mergeObject(data, {
      rollSelectionEnabled,
      showFormula: formula !== false,
      formula,
      recoveriesData,
      nbRecoveries: this.object.initialRecoveriesLeft.filter(Boolean).length - this.object.recoveriesLeft.filter(Boolean).length,
      hasRecoveriesLeft: this.object.initialRecoveriesLeft.filter(Boolean).length > 0,
      disallowReset: this.object.initialRecoveriesLeft.filter(Boolean).length === this.object.actor.data.data.recoveries.length,
      recoveries: NUMENERA.recoveries,
      pools: this.object.pools,
      stats,
      hasUnspentRecoveryPoints: this.object.unspentRecoveryPoints !== null,
      unspentRecoveryPoints: this.object.unspentRecoveryPoints || 0,
      tempBonus: this.object.tempBonus || null,
    });
  }

  /**
   * @inheritdoc
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find("#reset-recoveries").click(this._reset.bind(this));
    html.find("#roll-recovery-dice").click(this._rollRecovery.bind(this));
    html.find("#apply-recovery-choices").click(this._accept.bind(this));
  }

  async _reset() {
    Dialog.confirm({
      title: game.i18n.localize("NUMENERA.recoveries.resetDialog.title"),
      content: game.i18n.localize("NUMENERA.recoveries.resetDialog.content"),
      yes: () => {
        this.object.recoveriesLeft = new Array(this.object.actor.nbRecoveries).fill(true);
        this.object.initialRecoveriesLeft = Array.from(this.object.recoveriesLeft);
        this.object.unspentRecoveryPoints = 0;

        this.object.actor.update({
          "data.recoveries": this.object.recoveriesLeft
        });

          ChatMessage.create({
            content: `<h3>${this.object.actor.data.name} ${game.i18n.localize("NUMENERA.recoveries.resetDialog.confirmation")}</h3>`,
          });

        this.render();
      }
    });
  }

  /**
   * Event handler for the "Roll" button. If any new recovery checkboxes have
   * been checked, roll that many recovery dice. The Actor will be updated
   * in that case.
   *
   * @param {*} event
   */
  async _rollRecovery(event) {
    event.preventDefault();

    //Make sure the Actor has enough unspent recoveries in the first place
    const nbDice = this.object.initialRecoveriesLeft.filter(Boolean).length - this.object.recoveriesLeft.filter(Boolean).length;
    if (!this.object.initialRecoveriesLeft.some(Boolean) || nbDice <= 0) {
      ui.notifications.warn("No Recovery rolls left");
      return;
    }

    const roll = new Roll(this._getFormula(nbDice, this.object.tempBonus)).roll();
    console.log(roll.terms);
    roll.evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: `${this.object.actor.data.name} rolls for Recovery`,
    });

    this.object.unspentRecoveryPoints += roll.total;
    this.object.initialUnspentRecoveryPoints += roll.total;
    this.object.initialRecoveriesLeft = [...this.object.recoveriesLeft];

    //Update the actor with its newly-found pool points to attribute and its new checked recoveries
    const actor = this.object.actor;
    actor.update({
      _id: actor.data._id,
      "data.recoveries": [...this.object.recoveriesLeft],
    });

    await this.render();
  }

  /**
   * Get the recovery formula used for `n` recoveries.
   *
   * @param {Number} n
   * @returns {} false if no formula could be generated, a formula String otherwise
   * @memberof RecoveryDialog
   */
  _getFormula(n, tempBonus = 0) {
    if (typeof n !== "number" || n <= 0) {
      return false;
    }

    if (typeof tempBonus !== "number") {
      tempBonus = 0;
    }

    const constant = n * (this.object.actor.data.data.recovery + tempBonus);
    return `${n}d6+${constant}`;
  }

  /**
   * Event handler for the "Accept" button. Applies the pool changes to the
   * Actor.
   *
   * @memberof RecoveryDialog
   */
  async _accept() {
    if (this.object.unspentRecoveryPoints < 0) {
      ui.notifications.error("You have spent more points than you rolled for");
      return;
    }

    //Apply new pool values to the Actor
    let data = null;
    const stats = this.object.actor.data.data.stats;

    for (let [stat, actorPool] of Object.entries(stats)) {
      const formPool = this.object.pools.find(p => p.name === stat);

      if (actorPool.pool.value !== formPool.value) {
        if (data === null)
          data = {};

        data[`data.stats.${stat}.pool.value`] = formPool.value;
      }
    }

    //Only update the actor if changes actually happened
    if (data !== null) {
      data["data.unspentRecoveryPoints"] = this.object.unspentRecoveryPoints;
      await this.object.actor.update(data);

      ui.notifications.info(game.i18n.localize("NUMENERA.effort.poolChangesApplied"));
    }

    //Leave this accursed place
    this.close();
  }

  _updateObject(event, formData) {
    let index = null;
    const matches = event.target.name.match(/recovery\[(\d+)\]/);
    if (matches) {
      index = parseInt(matches[1]);
      this.object.recoveriesLeft[index] = !this.object.recoveriesLeft[index];
    }

    //Update recovery checkboxes data in order
    if (index && !game.settings.get("numenera", "outOfOrderRecovery"))
      this._getNbCheckedInOrder(index);

    //Update remaining points and pools
    let poolsTotal = 0;
    for (let pool of this.object.pools) {
      pool.value = formData[`pools.${pool.name}.value`] || 0;
      poolsTotal += pool.value;
    }

    this.object.poolsTotal = poolsTotal;
    this.object.unspentRecoveryPoints = this.object.initialUnspentRecoveryPoints - poolsTotal + this.object.initialPoolsTotal;
    this.object.tempBonus = formData.tempBonus;

    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }

  _getNbCheckedInOrder(index) {
    //Get the highest-valued box that's still checked
    let highestChecked = -1;
    for (let i = 0; i < this.object.recoveriesLeft.length; i++)
      if (!this.object.recoveriesLeft[i])
        highestChecked = i;

    if (this.object.recoveriesLeft[index] && highestChecked <= index) {
      index--;
    }

    for (let i = 0; i < this.object.recoveriesLeft.length; i++) {
      this.object.recoveriesLeft[i] = (i > index);
    }
  }

  async close() {
    let closeMe = Promise.resolve(true);

    let currentPoolsTotal = 0;
    let maximumPoolsTotal = 0;
    for (let pool of this.object.pools) {
      currentPoolsTotal += pool.value;
      maximumPoolsTotal += pool.max;
    }

    if (this.object.unspentRecoveryPoints > 0 && currentPoolsTotal < maximumPoolsTotal) {
      closeMe = new Promise((resolve, reject) => {
        new Dialog({
          title: game.i18n.localize("NUMENERA.effort.confirmUnspentTitle"),
          content:  game.i18n.localize("NUMENERA.effort.confirmUnspent"),
          buttons: {
            ok: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize("NUMENERA.dialog.confirmDeletion.ok"),
              callback: () => resolve(true)
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize("NUMENERA.dialog.confirmDeletion.cancel"),
              callback: () => resolve(false)
            },
          },
          default: "cancel",
          close: () => resolve(false),
        }, {classes: ["numenera", "dialog"]}).render(true);
      });
    }

    if (await closeMe)
      super.close();
  }
}
