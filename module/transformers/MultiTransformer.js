import { Transformer } from "./Transformer.js";

/**
 * A specialization of the basic Transformer class that applies a series
 * of transformations in order on the object to transform.  This way, one
 * can apply a "single" transform on an object while actually performing
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

    // Transforms must be applied in the reverse order
    for (const tr of this.transforms.reverse()) {
      newObj = tr.revert(newObj);
    }

    return obj;
  }
}