import { MultiTransformer } from "../MultiTransformer.js";
import { Effect } from "./effects/EffectTransformer.js";
import { NumeneraPCActor } from "../../actor/NumeneraPCActor.js";

export class DescriptorTransformer extends MultiTransformer {
  constructor(name, description, effects = []) {
    super(effects);

    this.name = name;
    this.description = description;
  }

  addEffect(effect) {
    // Only allow subclasses of EffectTransform
    if (!(effect instanceof Effect)) {
      throw new Error("Effect should be an EffectTransformer");
    }

    // Append effect
    this.effects = [...this.effects, effect];
  }

  /**
   * @inheritdoc
   *
   * @param {NumeneraPCActor} obj
   * @memberof DescriptorTransformer
   */
  transform(obj) {
    this._validateObject(obj);

    const transformed = super.transform(obj);

    //TODO update to DB

    return transformed;
  }

  /**
   * @inheritdoc
   *
   * @param {NumeneraPCActor} obj
   * @memberof DescriptorTransformer
   */
  revert(obj) {
    this._validateObject(obj);

    const reverted = super.revert(obj);

    //TODO update to DB
  
    return reverted;
  }


  /**
   * Perform some validations on the object to apply/revert the transform on.
   *
   * @param {Object} obj
   * @memberof DescriptorTransformer
   */
  _validateObject(obj) {
    // Ensure the object is an Actor
    if (!(obj instanceof NumeneraPCActor)) {
      throw new Error("Tried to apply Descriptor transform on an object which is not a NumeneraPCActor");
    }
  }
}
