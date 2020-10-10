export class NumeneraArtifactItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 640
        });
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /**
     * Get the correct HTML template path to use for rendering this particular sheet
     * @type {String}
     */
    get template() {
        return "systems/numenera/templates/item/artifactSheet.html";
    }
    getData() {
      const sheetData = super.getData();

      //Is it The Strange?
      if (game.settings.get("numenera", "characterSheet") == 2) {
        sheetData.isTheStrange = true;
      }
      return sheetData;
    };
  }
