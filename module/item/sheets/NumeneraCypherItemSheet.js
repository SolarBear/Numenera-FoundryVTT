import { NUMENERA } from "../../config.js";

export class NumeneraCypherItemSheet extends ItemSheet {
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
        return "systems/numenera/templates/item/cypherSheet.html";
    }

    get type() {
        return "cypher";
    }

    getData() {
        const sheetData = super.getData();

        const useCypherTypes = (game.settings.get("cypher", "systemVersion") === 1);
        sheetData.useCypherTypes = useCypherTypes;

        if (useCypherTypes) {
            sheetData.cypherTypes = NUMENERA.cypherTypes;
        }

        return sheetData;
    }
}