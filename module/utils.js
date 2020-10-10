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
  return stat.split(".").pop();
}
