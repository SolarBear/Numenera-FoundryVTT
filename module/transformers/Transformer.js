/**
 * A Transformer is an abstract class with two methods: one to apply a transformation
 * to a given object, and another to undo that operation.
 * 
 * Each of these should act as a Redux-like reducer and return an updated copy of the
 * initial object, leaving the original untouched.
 * 
 * Also, as much as possible, such transforms should be totally reversible, meaning that
 * in the following example
 * 
 * const obj = {...};
 * const transformed = Transformer.transform(obj);
 * const reverted = Transformer.revert(transformed);
 * 
 * obj and reverted should be identical.
 * 
 * @abstract
 * @export
 * @class Transformer
 */
export class Transformer {

  /**
   * Apply a given transformation on an object.
   *
   * @param {*} obj
   * @memberof Transformer
   */
  transform(obj) {
    throw new Error(`transform() method not implemented in class ${this.constructor.name}`);
  }

  /**
   * Undo the effects of the transform() method.
   *
   * @param {*} obj
   * @memberof Transformer
   */
  revert(obj) {
    throw new Error(`transform() method not implemented in class ${this.constructor.name}`);
  }
}
