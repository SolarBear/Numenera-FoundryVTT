import { NUMENERA } from "../../config.js";

export class NumeneraWeaponItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 400
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
        return "systems/numenera/templates/item/weaponSheet.html";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.ranges = NUMENERA.ranges;
        sheetData.weaponTypes = NUMENERA.weaponTypes;
        sheetData.weights = NUMENERA.weightClasses;

        return sheetData;
    }
}