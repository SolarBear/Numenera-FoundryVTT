import { Transformer } from "./Transformer.js";

/**
 * A specialization of the basic Transformer class that applies a series
 * of transformation in order on the object to transform.
 *
 * @export
 * @class MultiTransformer
 * @extends {Transformer}
 */
export class MultiTransformer extends Transformer {
  constructor(transforms = []) {
    super();
    this.transforms = transforms;
  }

  transform(obj) {
    if (!obj) {
      throw new Error("No object provided for transform()");
    }

    let newObj = obj;

    for (const tr of this.transforms) {
      newObj = tr.transform(newObj);
    }

    return obj;
  }

  revert(obj) {
    if (!obj) {
      throw new Error("No object provided for revert()");
    }

    let newObj = obj;

    for (const tr of this.transforms) {
      newObj = tr.revert(newObj);
    }

    return obj;
  }
}