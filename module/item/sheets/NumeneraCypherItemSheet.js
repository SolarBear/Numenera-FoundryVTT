import { NUMENERA } from "../../config.js";

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

        //TODO improve this, c'mon man, you can do better!
        let cypherTypeFlavor;
        switch (game.settings.get("numenera", "cypherTypesFlavor")) {
            case 1: //none
                cypherTypeFlavor = null;
                break;

            case 2: //anoetic/occultic
                cypherTypeFlavor = "numenerav1";
                break;

            case 3: //subtle/manifest/fantastic
                cypherTypeFlavor = "cypherSystem";
                break;
        }

        const useCypherTypes = !!cypherTypeFlavor;
        sheetData.displayCypherType = useCypherTypes;
        if (useCypherTypes)
            sheetData.cypherTypes = NUMENERA.cypherTypes[cypherTypeFlavor];

        return sheetData;
    }
}