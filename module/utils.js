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
  debugger;
  let useAlt = window.event.ctrlKey || window.event.metaKey;
  
  if (game.settings.get("numenera", "defaultToTaskDialog"))
    useAlt = !useAlt;

  return useAlt;
}
