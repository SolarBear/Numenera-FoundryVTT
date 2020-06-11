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
      height: 340,
    });
  }

  /**
   * @inheritdoc
   */
  constructor(actor, options = {}) {
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
      initialUnspentRecoveryPoints: actor.data.data.unspentRecoveryPoints,
      unspentRecoveryPoints: actor.data.data.unspentRecoveryPoints,
      initialRecoveriesLeft: actor.data.data.recoveriesLeft,
      recoveriesLeft: actor.data.data.recoveriesLeft,
      pools,
      poolsTotal,
      initialPoolsTotal: poolsTotal,
    };

    super(recoveryDialogObject, options);
  }

  /**
   * @inheritdoc
   */
  getData() {
    const data = super.getData();

    const recoveriesData = Object.entries(NUMENERA.recoveries)
      .map(([key, value], idx) => {
        return {
          key,
          label: value,
          checked: 4 - this.object.recoveriesLeft > idx,
          disabled: 4 - this.object.initialRecoveriesLeft > idx,
        };
      });

    const rollSelectionEnabled = this.object.recoveriesLeft > 0;
    const pointAttributionEnabled = this.object.initialUnspentRecoveryPoints > 0;
    const formula = this._getFormula(this.object.initialRecoveriesLeft - this.object.recoveriesLeft);

    const stats = {};
    for (const prop in NUMENERA.stats) {
      stats[prop] = game.i18n.localize(NUMENERA.stats[prop]);
    }

    return mergeObject(data, {
      rollSelectionEnabled,
      pointAttributionEnabled,
      showFormula: formula !== false,
      formula,
      recoveriesData,
      nbRecoveries: this.object.initialRecoveriesLeft - this.object.recoveriesLeft,
      hasRecoveriesLeft: this.object.initialRecoveriesLeft > 0,
      disallowReset: this.object.initialRecoveriesLeft >= 4,
      recoveries: NUMENERA.recoveries,
      pools: this.object.pools,
      stats,
      hasUnspentRecoveryPoints: this.object.unspentRecoveryPoints !== null,
      unspentRecoveryPoints: this.object.unspentRecoveryPoints || 0,
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
      title: "Reset Recoveries",
      content: "Really reset your Recoveries?",
      yes: () => {
        this.object.recoveriesLeft = 4;
        this.object.initialRecoveriesLeft = 4;
        this.object.actor.update({
          "data.recoveriesLeft": 4,
        });
        ChatMessage.create({
          content: `<h3>${this.object.actor.data.name} has reset their daily Recoveries</h3>`,
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
    const nbDice = this.object.initialRecoveriesLeft - this.object.recoveriesLeft;
    if (this.object.initialRecoveriesLeft <= 0 || nbDice <= 0) {
      ui.notifications.warn("No Recovery rolls left");
      return;
    }

    const roll = new Roll(this._getFormula(nbDice)).roll();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.object.actor }),
      flavor: `${this.object.actor.data.name} rolls for Recovery`,
    });

    this.object.unspentRecoveryPoints += roll.total;
    this.object.initialUnspentRecoveryPoints += roll.total;
    this.object.initialRecoveriesLeft = this.object.recoveriesLeft;

    //Update the actor with its newly-found pool points to attribute and its new checked recoveries
    const actor = this.object.actor;
    actor.update({
      _id: actor.data._id,
      "data.unspentRecoveryPoints": this.object.unspentRecoveryPoints,
      "data.recoveriesLeft": this.object.recoveriesLeft,
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
  _getFormula(n) {
    if (typeof n !== "number" || n <= 0) {
      return false;
    }

    const constant = n * this.object.actor.data.data.tier;
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
      data["data.unspentRecoveryPoints"] = this.object.unspentRecoveryPoin
      await this.object.actor.update(data);

      ui.notifications.info("Pool changes have been applied");
    }

    //Leave this accursed place
    this.close();
  }

  _updateObject(event, formData) {
    //Update recovery checkboxes data
    let nbChecked = 4 - this.object.recoveriesLeft;
    switch (event.target.name) {
      case "recovery[action]":
        nbChecked = 1;
        break;
      case "recovery[tenMin]":
        nbChecked = 2;
        break;
      case "recovery[oneHour]":
        nbChecked = 3;
        break;
      case "recovery[tenHours]":
        nbChecked = 4;
        break;
      default:
    }

    if (nbChecked !== this.object.recoveriesLeft) {
      this.object.recoveriesLeft = 4 - nbChecked;
    }

    //Update remaining points and pools
    let poolsTotal = 0;
    for (let pool of this.object.pools) {
      pool.value = formData[`pools.${pool.name}.value`] || 0;
      poolsTotal += pool.value;
    }

    this.object.poolsTotal = poolsTotal;
    this.object.unspentRecoveryPoints = this.object.initialUnspentRecoveryPoints - poolsTotal + this.object.initialPoolsTotal;

    //Re-render the form since it's not provided for free in FormApplications
    this.render();
  }

  close() {
    super.close();

    //Just a friendly warning :)
    if (this.object.unspentRecoveryPoints > 0) {
      ui.notifications.warn("You have unspent recovery points");
    }
  }
}
