/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

    // Define template paths to load
    const templatePaths = [
  
      // Actor Sheets
      "systems/numenera/templates/characterSheet.html",
      "systems/numenera/templates/npcSheet.html",

      // Item Sheet Partials
    ];
  
    // Load the template parts
    return loadTemplates(templatePaths);
  };
  