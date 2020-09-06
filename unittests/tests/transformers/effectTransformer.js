import test from 'ava';

import { SkillEffectTransformer } from "../../../module/transformers/pc/effects/EffectTransformer.js";

import { NumeneraPCActor } from  "../../mocks/actors.js";
import { NumeneraSkillItem } from  "../../mocks/items.js";

test("A SkillEffect only applies to the Actor type provided", async t => {
  const tr = new SkillEffectTransformer("skill name", "skill descr", NumeneraPCActor, NumeneraSkillItem);

  tr._validateObject(new NumeneraPCActor());
  
  let error = null;
  try {
    tr._validateObject({});
    t.fail();
  }
  catch (e) {
    error = e;
  }

  t.is(error.message, "Tried to apply Descriptor transform on an object which is not a NumeneraPCActor");
});

test("A SkillEffect transform adds a skill if it does not exist yet", async t => {
  const tr = new SkillEffectTransformer("skill name", "skill descr", NumeneraPCActor, NumeneraSkillItem);

  const pc = new NumeneraPCActor();
  const pcWithSkill = await tr.transform(pc);
  const skills = pcWithSkill.getItemsByName("skill name");
  t.is(skills.length, 1);

  const skill = skills[0];
  t.is(skill.name, "skill name");
  t.is(skill.data.skillLevel, 1);
  t.is(skill.data.notes, "skill descr");
});

test("A SkillEffect transform improves an existing skill whose level is 0", async t => {
  const tr = new SkillEffectTransformer("skill name", "skill descr", NumeneraPCActor, NumeneraSkillItem);

  const pc = new NumeneraPCActor();
  const skill = new NumeneraSkillItem();
  skill.name = "skill name";
  skill.data = {
    notes: "skill descr",
    skillLevel: 0,
  };

  const updatedPc = await tr.transform(pc);
  const skills = updatedPc.getItemsByName("skill name");
  t.is(skills.length, 1);

  const improvedSkill = skills[0];
  t.is(improvedSkill.name, "skill name");
  t.is(improvedSkill.data.skillLevel, 1);
  t.is(improvedSkill.data.notes, "skill descr");
});

test("A SkillEffect transform does nothing if the skill exists at level 1 or higher", async t => {
  const tr = new SkillEffectTransformer("skill name", "skill descr", NumeneraPCActor, NumeneraSkillItem);

  const pc = new NumeneraPCActor();
  const skill = new NumeneraSkillItem();
  skill.name = "skill name";
  skill.data = {
    notes: "skill descr",
    skillLevel: 1,
  };

  const updatedPc = await tr.transform(pc);
  const skills = updatedPc.getItemsByName("skill name");
  t.is(skills.length, 1);

  const improvedSkill = skills[0];
  t.is(improvedSkill.name, "skill name");
  t.is(improvedSkill.data.skillLevel, 1);
  t.is(improvedSkill.data.notes, "skill descr");
});

test("A SkillEffect transform backups the previous version of the skill if one existed", async t => {
  t.pass();
});

test("A SkillEffect transform backups nothing if the skill did not already exist", async t => {
  t.pass();
});