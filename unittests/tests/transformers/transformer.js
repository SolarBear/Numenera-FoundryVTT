import test from 'ava';
import { Transformer } from '../../../module/transformers/Transformer.js';

test("A basic Transformer object throws when transforming", async t => {
  const tr = new Transformer();
  
  let error = null;
  try {
    tr.transform({});
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "transform() method not implemented in class Transformer");
});

test("A basic Transformer object throws when reverting", async t => {
  const tr = new Transformer();
  
  let error = null;
  try {
    tr.revert({});
    t.fail(); //should throw
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "transform() method not implemented in class Transformer");
});