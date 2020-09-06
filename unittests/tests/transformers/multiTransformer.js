import test from 'ava';
import { MultiTransformer } from "../../../module/transformers/MultiTransformer.js";

test("A MultiTransformer transform() method throws when object is falsy", async t => {
  const tr = new MultiTransformer();
  
  let error = null;
  try {
    tr.transform(null);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "No object provided for transform()");
});

test("A MultiTransformer revert() method throws when object is falsy", async t => {
  const tr = new MultiTransformer();
  
  let error = null;
  try {
    tr.revert(null);
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "No object provided for revert()");
});

test("A MultiTransformer transform+revert performs no operation when no transforms have been specified", async t => {
  const tr = new MultiTransformer([]);

  const o = {
    test: 1,
    otherTest: "wassup",
  };

  const transformed = tr.transform(o);
  t.is(o, transformed);

  const reverted = tr.revert(transformed);

  t.is(reverted, transformed);
  t.is(reverted, o);
});
