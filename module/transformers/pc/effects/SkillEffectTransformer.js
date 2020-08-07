import { EffectTransformer } from "./EffectTransformer.js";

export class EffectTransformer extends EffectTransformer {
  constructor(name, description, effect) {
    super();

    this.name = name;
    this.description = description;
    this.effect = effect;
  }
}
