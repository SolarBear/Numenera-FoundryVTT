import { NUMENERA } from "../../config.js";

export class NumeneraArmorItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
            height: 625
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
        return "systems/numenera/templates/item/armorSheet.html";
    }

    getData() {
        const data = super.getData();

        data.weightClasses = NUMENERA.weightClasses;
        
        return data;
    }
}