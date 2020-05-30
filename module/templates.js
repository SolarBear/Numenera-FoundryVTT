/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async() => {

    // Define template paths to load
    const templatePaths = [
        // Actor Sheets
        "systems/numenera/templates/characterSheet.html",
        "systems/numenera/templates/npcSheet.html",

        //Item sheets
        "systems/numenera/templates/item/abilitySheet.html",
        "systems/numenera/templates/item/armorSheet.html",
        "systems/numenera/templates/item/artifactSheet.html",
        "systems/numenera/templates/item/cypherSheet.html",
        "systems/numenera/templates/item/equipmentSheet.html",
        "systems/numenera/templates/item/odditySheet.html",
        "systems/numenera/templates/item/skillSheet.html",
        "systems/numenera/templates/item/weaponSheet.html"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};