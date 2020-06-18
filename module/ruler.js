import { NUMENERA } from "./config.js";

export function cypherRuler() {
    Ruler.prototype._getSegmentLabel = (function() {
        let superFunction = Ruler.prototype._getSegmentLabel;
        return function() {
            if (useCypherDistances()) {
                return getCypherSegmentLabel.apply(this, arguments);
            } else {
                return superFunction.apply(this, arguments);
            }
        };
    })();

    MeasuredTemplate.prototype._refreshRulerText = (function() {
        let superFunction = MeasuredTemplate.prototype._refreshRulerText;
        return function() {
            if (useCypherDistances()) {
                return cypherRefreshRulerText.apply(this, arguments);
            } else {
                return superFunction.apply(this, arguments);
            }
        };
    })();
}

function useCypherDistances() {
    let units = game.settings.get("numenera", "measureDistanceInUnits");
    if (units === "none") {
        return false;
    }

    return units;
}

function getDistanceBand(unit, distance) {
    if (unit === "NUMENERA.units.meters") {
        return getDistanceBandInMeters(distance);
    }
    else if (unit === "NUMENERA.units.feet") {
        return getDistanceBandInFeet(distance);
    }
}

function getDistanceBandInFeet(distance) {
    if (distance <= 10.0) {
        return game.i18n.localize("NUMENERA.range.immediate");
    } else if (distance <= 15.0) {
        return game.i18n.localize("NUMENERA.range.short");
    } else if (distance <= 30.0) {
        return game.i18n.localize("NUMENERA.range.long");
    } else {
        return game.i18n.localize("NUMENERA.range.veryLong");
    }
}

function getDistanceBandInMeters(distance) {
    if (distance <= 3.0) {
        return game.i18n.localize("NUMENERA.range.immediate");
    } else if (distance <= 15.0) {
        return game.i18n.localize("NUMENERA.range.short");
    } else if (distance <= 30.0) {
        return game.i18n.localize("NUMENERA.range.long");
    } else {
        return game.i18n.localize("NUMENERA.range.veryLong");
    }
}

/**
 * Override to append the cypher-ly distance to the text shown in the ruler
 */
function getCypherSegmentLabel(segmentDistance, totalDistance, isTotal) {
    const units = canvas.scene.data.gridUnits;
    let distance = Math.round(segmentDistance * 100) / 100;
    let label = `${distance} ${units}`;
    let distanceBand = getDistanceBand(game.settings.get("numenera", "measureDistanceInUnits"), distance);
    if ( isTotal ) {
        label += ` [${Math.round(totalDistance * 100) / 100} ${units}]`;
    }
    label += `\n(${distanceBand})`;

    return label;
}

/**
 * Override to append cypher-ly distance to the label shown on the measured templates
 */
function cypherRefreshRulerText() {
    let text;
    let u = canvas.scene.data.gridUnits;
    let distanceBand;
    let cypherUnit = game.settings.get("numenera", "measureDistanceInUnits");
    if ( this.data.t === "rect" ) {
      let d = canvas.dimensions;
      let dx = Math.round(this.ray.dx) * (d.distance / d.size);
      let dy = Math.round(this.ray.dy) * (d.distance / d.size);
      let w = Math.round(dx * 10) / 10;
      let h = Math.round(dy * 10) / 10;
      text = `${w}${u} x ${h}${u}`;
      distanceBand = getDistanceBand(cypherUnit, Math.abs(dx)) + ` x ` + getDistanceBand(cypherUnit, Math.abs(dy));
    } else {
      let d = Math.round(this.data.distance * 10) / 10;
      distanceBand = getDistanceBand(cypherUnit, d);
      text = `${d}${u}`;
    }

    text += `\n(${distanceBand})`;

    this.ruler.text = text;
    this.ruler.position.set(this.ray.dx, this.ray.dy);
}