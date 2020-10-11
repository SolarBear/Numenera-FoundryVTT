/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async() => {

    // Define template paths to load
    const templatePaths = [
        // Actor Sheets
        "systems/numenera/templates/actor/characterSheet.html",
        "systems/numenera/templates/actor/communitySheet.html",
        "systems/numenera/templates/actor/npcSheet.html",

        // Actor partials
        "systems/numenera/templates/actor/partials/artifacts.html",
        "systems/numenera/templates/actor/partials/cyphers.html",
        "systems/numenera/templates/actor/partials/oddities.html",
        "systems/numenera/templates/actor/partials/recursions.html",

        // Dialog Sheets
        "systems/numenera/templates/dialog/effort.html",
        "systems/numenera/templates/dialog/recovery.html",

        //Item sheets
        "systems/numenera/templates/item/abilitySheet.html",
        "systems/numenera/templates/item/armorSheet.html",
        "systems/numenera/templates/item/artifactSheet.html",
        "systems/numenera/templates/item/cypherSheet.html",
        "systems/numenera/templates/item/equipmentSheet.html",
        "systems/numenera/templates/item/odditySheet.html",
        "systems/numenera/templates/item/skillSheet.html",
        "systems/numenera/templates/item/weaponSheet.html",
        "systems/numenera/templates/item/recursionSheet.html",

        //Token stuff
        "systems/numenera/templates/hud/tokenHUD.html",
        "systems/numenera/templates/scene/tokenConfig.html",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
