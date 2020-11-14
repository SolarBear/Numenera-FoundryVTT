export class GameFeatures extends FormApplication
{
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: "Game Features",
      id: "game-features",
      template: "systems/numenera/templates/settings/features.html",
      popOut: true,
      submitOnChange: false,
      width: 380,
      height: "auto",
      tabs: [
        {navSelector: ".tabs", contentSelector: "form", initial: "general"}
      ],
    });
  }

  /**
   * System settings to be handled by this dialog.
   *
   * @readonly
   * @static
   * @memberof GameFeatures
   */
  static get features() {
    return [
      "useOddities",
      "usePowerShifts",
      "useRecursions",
      "useSpells",
    ];
  }

  static get presets() {
    return {
      custom: {
        name: "Cypher System / Custom",
        features: [
        ],
      },
      numenera: {
        name: "Numenera",
        features: [
          "useOddities",
        ],
      },
      theStrange: {
        name: "The Strange",
        features: [
          "useRecursions",
        ],
      },
      godsOfTheFall: {
        name: "Gods of the Fall",
        features: [
          "usePowerShifts",
          "useSpells",
        ],
      },
    };
  }
  
  async getData(options) {
    const data = super.getData(options);

    data.presets = GameFeatures.presets;
    data.preset = game.settings.get("numenera", "gameFeaturesPreset");

    data.features = {};
    for (let feature of GameFeatures.features) {
      data.features[feature] = game.settings.get("numenera", feature);
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("select[name='preset']").on("change", this.onChangePreset.bind(this));
  }

  /**
   * Event handler for the selection of a different preset. Will require confirmation
   * from the user before messing with game features.
   *
   * @param {Event} event
   * @memberof GameFeatures
   */
  async onChangePreset(event) {
    event.preventDefault();

    const preset = event.target.value;

    if (preset !== game.settings.get("numenera", "gameFeaturesPreset")) {
      const presetGameFeatures = GameFeatures.presets[preset].features;

      let content = null;;
      if (presetGameFeatures.length === 0) {
        content = `Selecting the ${preset} preset will enable no specific features: you will need to enable the features you require.`;
      }
      else {
        content = `Selecting the ${preset} preset will enable the following features:<ul>`;

        for (let feature of presetGameFeatures) {
          content += `<li>${feature}</li>`
        }

        content += "</ul>";
      }

      const confirm = await new Promise((resolve, reject) => {
        new Dialog({
          title: "Confirm new preset",
          content,
          buttons: {
            ok: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize("NUMENERA.dialog.confirmDeletion.ok"),
              callback: () => resolve(true)
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize("NUMENERA.dialog.confirmDeletion.cancel"),
              callback: () => resolve(false)
            },
          },
          default: "cancel",
          close: () => resolve(false),
        }, {classes: ["numenera", "dialog"]}).render(true);
      });

      if (confirm) {
        await this._changePreset(preset);
        this.render();
        ui.notifications.info(`Game settings set for ${preset}`);
      }
    }

    this.render();
  }

  /** @override */
  async _updateObject(event, formData) {
    event.preventDefault();

    for (let feature of GameFeatures.features) {
      const formFeatureName = "features." + feature;

      if (formData[formFeatureName] !== game.settings.get("numenera", feature))
        await game.settings.set("numenera", feature, formData[formFeatureName]);
    }
    
    this.render();
  }

  /**
   * This method will enable all game features linked to a given preset.
   *
   * @param {String} preset Preset name
   * @memberof GameFeatures
   */
  async _changePreset(preset) {
    let presetFeatures;
    try {
      presetFeatures = GameFeatures.presets[preset].features;
    }
    catch {
      throw new Error(`No game preset named ${preset}`);
    }

    for (let feature of GameFeatures.features) {
      const enabled = presetFeatures.some(pr => pr === feature);
      await game.settings.set("numenera", feature, enabled);
    }

    await game.settings.set("numenera", "gameFeaturesPreset", preset);
  }
}