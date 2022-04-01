import { NUMENERA } from "../../config.js";

export class NumeneraSkillItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 625,
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
        return "systems/numenera/templates/item/skillSheet.html";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.data = sheetData.data.data;

        sheetData.data.stats = NUMENERA.stats;

        return sheetData;
    }
}
