import { NUMENERA } from "../../config.js";
import { NumeneraCypherItem } from "../NumeneraCypherItem.js";

export class NumeneraCypherItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 615
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

        if (game.data.version.startsWith("0.8."))
            sheetData.data = sheetData.data.data;   

        const flavor = NumeneraCypherItem.cypherTypeFlavor;
        const useCypherTypes = !!flavor;
        
        sheetData.displayCypherType = useCypherTypes;
        if (useCypherTypes)
            sheetData.cypherTypes = NUMENERA.cypherTypes[flavor];

        return sheetData;
    }
}