/**
 * Get the short name of a stat from its full name.
 * 
 * Pool names are saved as "NUMENERA.pool.POOLNAME", this
 * function would return the final part.
 *
 * @export
 * @param {object} stat
 * @returns {string}
 */
export function getShortStat(stat) {
  if (typeof stat !== "string")
    return null;
    
  return stat.split(".").pop().toLowerCase();
}

export function useAlternateButtonBehavior() {
  let useAlt = window.event.ctrlKey || window.event.metaKey;
  
  if (game.settings.get("numenera", "defaultToTaskDialog"))
    useAlt = !useAlt;

  return useAlt;
}

//Function to remove any HTML markup from eg. item descriptions
export function removeHtmlTags(str) {
  // Replace any HTML tag ('<...>') by an empty string
  // and then un-escape any HTML escape codes (eg. &lt;)
  return htmlDecode(str.replace(/<.+?>/gi, ""));
}

// Stolen from https://stackoverflow.com/a/34064434/20043
export function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}