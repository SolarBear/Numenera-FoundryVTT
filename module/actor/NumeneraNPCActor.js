export class NumeneraNPCActor extends Actor {
  getInitiativeFormula() {   
    /* TODO: improve this
    The init system expects a formula for initiative: fixed values don't seem to work.
    I needed a workaround but "0d20+6" does not even parse. However, "1d1-1" works.
    The "0.1" part is to make it impossible to get ties on init rolls.
    */
    
    return "1d1-1.1+" + 3 * this.data.data.level;
  }
}
