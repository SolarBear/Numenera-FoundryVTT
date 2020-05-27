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

        // Item sheets
        "systems/cypher/templates/item/abilitySheet.html",
        "systems/cypher/templates/item/armorSheet.html",
        "systems/cypher/templates/item/artifactSheet.html",
        "systems/cypher/templates/item/cypherSheet.html",
        "systems/cypher/templates/item/equipmentSheet.html",
        "systems/cypher/templates/item/skillSheet.html",
        "systems/cypher/templates/item/weaponSheet.html"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};