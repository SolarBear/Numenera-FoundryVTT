import { Transformer } from "../../Transformer.js";
import { NumeneraPCActor } from "../../../actor/NumeneraPCActor.js";
import { NumeneraSkillItem } from "../../../item/NumeneraSkillItem.js";

export class Effect extends Transformer {
  constructor(name, description) {
    super();

    this.name = name;
    this.description = description;
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
      throw new Error("Tried to apply Descriptor transform on an object which is not a NumeneraActor");
    }
  }
}

export class SkillEffect extends Effect {
  /**
   * @inheritdoc
   *
   * @param {NumeneraPCActor} obj
   * @memberof DescriptorTransformer
   */
  transform(obj) {
    this._validateObject(obj);

    const actor = obj;
    const skills = actor.getItemsByName(this.name, NumeneraSkillItem.type);

    // TODO handle mastery (if even possible/necessary)
    let skill;
    if (skills) {
      if (skills.length === 1) {
        skill = skills[0];

        if (skill.data.skillLevel > 0) {
          // PC actor already has a skill level over 0
          return obj;
        }
      }
      else {
        // Multiple skills with same name: we won't handle this case
        console.warn(`Multiple skills with name ${this.name}`);
        return obj;
      }
    }
    else {
      skill = new NumeneraSkillItem();
      skill.name = this.name;
      skill.data.notes = this.description;
    }

    // TODO constants for skill levels
    skill.data.skillLevel = 1; // skilled
  }

  /**
   * @inheritdoc
   *
   * @param {NumeneraPCActor} obj
   * @memberof DescriptorTransformer
   */
  revert(obj) {
    this._validateObject(obj);

    
  }
}