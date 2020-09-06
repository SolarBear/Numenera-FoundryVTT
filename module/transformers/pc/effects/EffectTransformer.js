import { Transformer } from "../../Transformer.js";

//import { NumeneraPCActor } from "../../../actor/NumeneraPCActor.js";
//import { NumeneraSkillItem } from "../../../item/NumeneraSkillItem.js";

export class EffectTransformer extends Transformer {
  constructor(name, description, targetActor) {
    super();

    this.name = name;
    this.description = description;
    this.targetActor = targetActor;
  }

  /**
   * Perform some validations on the object to apply/revert the transform on.
   *
   * @param {Object} obj
   * @memberof DescriptorTransformer
   */
  _validateObject(obj) {
    // Ensure the object is an Actor
    if (!(obj instanceof this.targetActor)) {
      throw new Error("Tried to apply Descriptor transform on an object which is not a " + this.targetActor.name);
    }
  }
}
/**
 * A Skill Effect is one that provides you with a new skill.
 * 
 * Be careful, though! The PC might already have that skill. So if one provides
 * a skill specialization, for instance, one must not simply remove the skill
 * but restore its previous value.
 *
 * @export
 * @class SkillEffect
 * @extends {Effect}
 */
export class SkillEffectTransformer extends EffectTransformer {
  constructor(name, description, targetActor, targetItem) {
    super(name, description, targetActor);

    this.targetItem = targetItem;
  }

  _createSkillItem() {
    // const skill = new NumeneraSkillItem();
    // skill.name = this.name;
    // skill.data.notes = this.description;
    const skill = {
      name: this.name,
      data: {
        notes: this.description,
      }
    }

    // TODO constants for skill levels
    skill.data.skillLevel = 1; // TODO handle mastery

    return skill;
  }

  /**
   * Get the key that is going to be used as a flag name when backuping
   * an existing Item.
   *
   * @param {*} skill
   * @returns
   * @memberof SkillEffectTransformer
   */
  _effectKey(skill) {
    return `backup.skill.${skill.name}`;
  }

  /**
   * @inheritdoc
   *
   * @param {object} actor
   * @memberof DescriptorTransformer
   */
  async transform(actor) {
    this._validateObject(actor);

    // Check for existing skill(s) with the same name
    const skills = actor.getItemsByName(this.name, this.targetItem.type);

    // TODO handle mastery (if even possible/necessary)
    let existingSkill = null,
        skill = null;

    if (skills) {
      // Create the new skill object
      skill = this._createSkillItem();

      if (skills.length === 1) {
        // A single skill exists with that name
        existingSkill = skills[0];

        // Compare skill levels
        if (existingSkill.data.skillLevel < skill.data.skillLevel) {
          // PC actor does not have a higher level than the new one
          
        }
        else {
          // Effect skill is an improvement to the current, apply it to the PC
        }
      }
      else if (skills.length > 1) {
        // Multiple skills with same name: we won't handle this case
        console.warn(`Multiple skills with name ${this.name}`);
        return actor;
      }
    }
    else {
      skill = this._createSkillItem();
    }

    // If the skill variable is not null, it means it is meant to be applied to the Actor
    if (skill !== null) {
      skill.data.skillLevel = 1; // TODO constants
    }

    // If the existing skill variable is not null, it means it needs to be backuped
    if (existingSkill !== null) {
      actor.setFlag("numenera", this._effectKey(this.name) , existingSkill.data);
    }

    // Update the actor
    if (skills) {
      //Existing item
      await actor.updateEmbeddedEntity("OwnedItem", skill);
    }
    else {
      //New item
      await actor.createOwnedItem(skill);
    }

    return actor;
  }

  /**
   * @inheritdoc
   *
   * @param {NumeneraPCActor} obj
   * @memberof DescriptorTransformer
   */
  async revert(obj) {
    this._validateObject(actor);

    // Check for current skill(s) with the same name
    const skills = actor.getItemsByName(this.name, NumeneraSkillItem.type);
    const previousSkill = actor.getFlag("numenera", this._effectKey(this.name));

    // TODO what happens when you `getFlag()` an unexisting flag?
    if (previousSkill === undefined) {
      // Simply remove the skill
    }
    else {

    }

    return actor;
  }
}