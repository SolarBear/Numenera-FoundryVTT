import { NUMENERA } from "../../config.js";

export class NumeneraAbilityItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 630,
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
        return "systems/numenera/templates/item/abilitySheet.html";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.data.ranges = NUMENERA.optionalRanges;
        sheetData.data.stats = NUMENERA.stats;

        if (game.settings.get("numenera", "useSpells"))
            sheetData.abilityTypes = NUMENERA.abilityTypesWithSpells;
        else
            sheetData.abilityTypes = NUMENERA.abilityTypes;

        return sheetData;
    }
}
