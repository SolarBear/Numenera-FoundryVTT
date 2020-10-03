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

    //TODO REMOVE COMMIT THIS SHIT, Y'HEAR ME
    actor.data.data.recoveriesLeft = [true, true, true, true];

    const recoveryDialogObject = {
      actor,
      unspentRecoveryPoints: 0,
      pools,
      poolsTotal,
      initialPoolsTotal: poolsTotal,
      initialRecoveriesLeft: [...actor.data.data.recoveriesLeft],
      recoveriesLeft: [...actor.data.data.recoveriesLeft],
      initialUnspentRecoveryPoints: 0,
      unspentRecoveryPoints: 0,
    };

    super(recoveryDialogObject, options);
  }

  /**
   * @inheritdoc
   */
  getData() {
    const data = super.getData();

    let recoveriesData;
    recoveriesData = Object.entries(NUMENERA.recoveries)
    .map(([key, value], idx) => {
      return {
        key,
        label: value,
        checked: !this.object.recoveriesLeft[idx],
        disabled: !this.object.initialRecoveriesLeft[idx]
      };
    });

    const rollSelectionEnabled = this.object.recoveriesLeft.filter(Boolean).length > 0;
    const formula = this._getFormula(this.object.initialRecoveriesLeft.filter(Boolean).length - this.object.recoveriesLeft.filter(Boolean).length);

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
      disallowReset: this.object.initialRecoveriesLeft.filter(Boolean).length === 0,
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
      title: game.i18n.localize("NUMENERA.recoveries.resetDialog.title"),
      content: game.i18n.localize("NUMENERA.recoveries.resetDialog.content"),
      yes: () => {
        this.object.recoveriesLeft = [true, true, true, true];
        this.object.initialRecoveriesLeft = [true, true, true, true];
        this.object.unspentRecoveryPoints = 0;
        this.object.hasUnspentRecoveryPoints = false;

        this.object.actor.update({
          "data.recoveriesLeft": 4,
          "data.unspentRecoveryPoints": 0,
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
      data["data.unspentRecoveryPoints"] = this.object.unspentRecoveryPoints;
      await this.object.actor.update(data);

      ui.notifications.info("Pool changes have been applied");
    }

    //Leave this accursed place
    this.close();
  }

  _updateObject(event, formData) {
    switch (event.target.name) {
      case "recovery[action]":
        this.object.recoveriesLeft[0] = !this.object.recoveriesLeft[0];
        break;

      case "recovery[tenMin]":
        this.object.recoveriesLeft[1] = !this.object.recoveriesLeft[1];
        break;

      case "recovery[oneHour]":
        this.object.recoveriesLeft[2] = !this.object.recoveriesLeft[2];
        break;

      case "recovery[tenHours]":
        this.object.recoveriesLeft[3] = !this.object.recoveriesLeft[3];
        break;
    }

    //Update recovery checkboxes data in order
    if (!game.settings.get("numenera", "outOfOrderRecovery"))
      this._getNbCheckedInOrder(event);

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

  _getNbCheckedInOrder(event) {
    let clicked;
    switch (event.target.name) {
      case "recovery[action]":
        clicked = 0;
        break;

      case "recovery[tenMin]":
        clicked = 1;
        break;

      case "recovery[oneHour]":
        clicked = 2;
        break;

      case "recovery[tenHours]":
        clicked = 3;
        break;
    }

    //Get the highest-valued box that's still checked
    let highestChecked = -1;
    for (let i = 0; i < this.object.recoveriesLeft.length; i++)
      if (!this.object.recoveriesLeft[i])
        highestChecked = i;

    if (this.object.recoveriesLeft[clicked])
      highestChecked = clicked;

    for (let i = 0; i < this.object.recoveriesLeft.length; i++) {
      this.object.recoveriesLeft[i] = (i > highestChecked);
    }
  }

  close() {
    super.close();

    //Just a friendly warning :)
    if (this.object.unspentRecoveryPoints > 0) {
      //TODO put this in language files
      ui.notifications.warn("You have unspent recovery points");
    }
  }
}
