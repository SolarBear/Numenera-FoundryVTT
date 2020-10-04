/**
 * Numenera-specific Roll class overrides.
 * 
 * Required to perform some dirty shenanigans when serializing rolls.
 *
 * @export
*/
export function cypherRoll() {
  Roll.prototype.toJSON = (function() {
    const superFunction = Roll.prototype.toJSON;
    return function() {
      const toSerialize = superFunction.apply(this, arguments);

      if (this.hasOwnProperty("numenera")) //regular dice roll?
        toSerialize.numenera = this.numenera;

      return toSerialize;
    }
  })();

  Roll.fromJSON = (function() {
    return function(json) {
      const obj = JSON.parse(json);
      const roll = Roll.fromData(obj);

      if (obj.hasOwnProperty("numenera")) {
        roll.numenera = obj.numenera;
      }

      return roll;
    }
  })();
}
