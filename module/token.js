import { NUMENERA } from './config.js';

export function cypherToken() {
    let t;
    if (game.data.version.startsWith("0.7."))
        t = Token;
    else
        t = TokenDocument;

    // Here we monkey-patch in a bunch of crap because I can see no better way to have custom token behavior
    Token.prototype._drawAttributeBars = cypherTokenDrawAttributeBars;

    //TODO still required???
    //Token.prototype._onUpdateBarAttributes = cypherOnUpdateBarAttributes;

    // Trying to get the bar data from the config form seems a little janky (model not expecting a third bar?),
    // so let's just shove the bars onto PC characters. At least you can still configure _if_ they're shown or not!
    t.prototype._onCreate =  (function () {
        let superFunction = t.prototype._onCreate;
        return async function() {
            await superFunction.apply(this, arguments);
            
            if (this.actor && this.actor.data.type == "pc" && this.actor.data.token) {
                this.data.bar1 = {attribute: "stats.might.pool"};
                this.data.bar2 = {attribute: "stats.speed.pool"};
                this.data.bar3 = {attribute: "stats.intellect.pool"};

            if (game.data.version.startsWith("0.7."))
                this.drawBars();
            else
                this.object.drawBars();
            }
        }
    })();

    t.prototype._onUpdate = (function () {
        const superFunction = t.prototype._onUpdate;
        return async function() {
            superFunction.apply(this, arguments);

            if (game.data.version.startsWith("0.7."))
                this.drawBars();
            else
                this.object.drawBars();
        }
    })();
    
    // Override drawBars to call our special draw function for PCs only
    Token.prototype.drawBars = (function() {
        let superFunction = Token.prototype.drawBars;
        return function() {
            if (this.actor && this.actor.data.type === "pc") {
                return cypherTokenDrawBars.apply(this, arguments);
            } else {
                return superFunction.apply(this, arguments);
            }
        };

    })();

    
    // Override the actual draw call so we can apply our own positioning and styling to the bars
    Token.prototype._drawBar = (function() {
        let superFunction = Token.prototype._drawBar;
        return function() {
            if (this.actor && this.actor.data.type === "pc") {
                return drawCypherBar.apply(this, arguments);
            } else {
                return superFunction.apply(this, arguments);
            }
        };
        
    })();

    // Since we're hard-coding what stats our bars link against, we'll selective override the getter for PCs
    t.prototype.getBarAttribute = (function () {
        let superFunction = t.prototype.getBarAttribute;
        return function (barName, { alternative } = {}) {
            if (!this.actor)
                return;

            switch (this.actor.data.type) {
                case "pc":
                    return getCypherPCTokenBarAttribute.apply(this, arguments);

                case "npc":
                    return getCypherNPCTokenBarAttribute.apply(this, arguments);

                case "community":
                    return superFunction.apply(this, arguments);

                default:
                    throw new Error("No such Actor type");
            }
        }
    })();

    // Surely there's a better way to set the template than this...
    let defaultTokenHUDOptions = TokenHUD.defaultOptions;
    Object.defineProperty(TokenHUD, "defaultOptions", {
        get: function () {
            return mergeObject(defaultTokenHUDOptions, {
                template: "systems/numenera/templates/hud/tokenHUD.html"
            });
        }
    });

    // Add the third bar to the Token HUD's model
    TokenHUD.prototype.getData = (function () {
        const superFunction = TokenHUD.prototype.getData;
        return function (options) {
            let result = superFunction.apply(this, arguments);

            let actor = game.actors.get(result.actorId);
            if (actor && actor.data.type === "pc") {
                let bar3 = this.object.getBarAttribute("bar3");
                result.displayBar3 = bar3 && (bar3.type !== "none");
                result.bar3Data = bar3;
                result.isPC = this.object.actor.data.type === "pc";
                result.isNPC = !result.isPC;
            }

            return result;
        };
    })();

    // Again, this is really stupid and should be fixed somehow, in an ideal world.
    let defaultTokenConfigOptions = TokenConfig.defaultOptions;
    Object.defineProperty(TokenConfig, "defaultOptions", {
        get: function () {           
            return mergeObject(defaultTokenConfigOptions, {
                template: "systems/numenera/templates/scene/tokenConfig.html"
            });
        }
    });

    TokenConfig.prototype.getData = (function () {
        const superFunction = TokenConfig.prototype.getData;
        return async function (options) {
            let result = await superFunction.apply(this, arguments);

            result.isPC = this.actor && this.actor.data.type === "pc";
            if (result.isPC)
                result.bar3 = this.token.getBarAttribute("bar3");

            return result;
        };
    })();
}

export function add3rdBarToPCTokens() {
    //Update existing tokens with the extra attribute
    game.scenes.entities.forEach(scene => {
        scene.data.tokens.forEach(token => {
            if (game.data.version.startsWith("0.7.")) {
                if (!token.hasOwnProperty("bar3")) {
                    token.bar1 = {attribute: "stats.might.pool"};
                    token.bar2 = {attribute: "stats.speed.pool"};
                    token.bar3 = {attribute: "stats.intellect.pool"};
                }
            }
            else {
                if (!token.data.hasOwnProperty("bar3")) {
                    token.bar1 = {attribute: "stats.might.pool"};
                    token.bar2 = {attribute: "stats.speed.pool"};
                    token.bar3 = {attribute: "stats.intellect.pool"};
                }
            }
        })
    });
}

/**
 * Override to add a third attribute bar to the token
 */
function cypherTokenDrawAttributeBars() {
    const bars = new PIXI.Container();
    bars.bar1 = bars.addChild(new PIXI.Graphics());
    bars.bar2 = bars.addChild(new PIXI.Graphics());
    bars.bar3 = bars.addChild(new PIXI.Graphics());
    return bars;
}

/**
 * Override to add and draw a third attribute bar
 */
function cypherTokenDrawBars() {
    if (!this.actor || this.data.displayBars === CONST.TOKEN_DISPLAY_MODES.NONE)
        return;

    ["bar1", "bar2", "bar3"].forEach((b, i) => {
        //0.8: when creating a new tokens, the bars property does not exist...
        if (!this.hasOwnProperty("bars"))
            return;

        const bar = this.bars[b];
        const attr = this.getBarAttribute(b);

        if (!attr || attr.type !== "bar")
            return bar.visible = false;

        this._drawBar(i, bar, attr);
        bar.visible = true;
    });
}

/**
 * Override to update a third attribute bar
 */
function cypherOnUpdateBarAttributes(updateData) {
    const update = ["bar1", "bar2", "bar3"].some(b => {
      let bar = this.data[b];
      if (!bar)
        return false;

      return bar.attribute && hasProperty(updateData, "data."+bar.attribute);
    });

    if (update) {
        if (game.data.version.startsWith("0.7."))
            this.drawBars();
        else
            this.object.drawBars();
    }
  }

/**
 * Override to change the way we draw bars, making them a bit more configurable
 */
function drawCypherBar(number, bar, data) {
    const val = Number(data.value);
    const pct = Math.clamped(val, 0, data.max) / data.max;
    let h = Math.max((canvas.dimensions.size / 12), 8);
    if (this.data.height >= 2) h *= 1.6;  // Enlarge the bar for large tokens

    // Stacked bars, all atop one another
    let yPositions = {
        0: this.h - (3 * h),
        1: this.h - (2 * h),
        2: this.h - h
    };

    // Let's do at least one good thing by making these colors configurable
    let colors = {
        0: NUMENERA.attributeColors[0],
        1: NUMENERA.attributeColors[1],
        2: NUMENERA.attributeColors[2]
    }

    let color = colors[number];

    bar.clear()
        .beginFill(0x000000, 0.5)
        .lineStyle(2, 0x000000, 0.9)
        .drawRoundedRect(0, 0, this.w, h, 3)
        .beginFill(color, 0.8)
        .lineStyle(1, 0x000000, 0.8)
        .drawRoundedRect(1, 1, pct * (this.w - 2), h - 2, 2);

    // Set position
    let posY = yPositions[number];
    bar.position.set(0, posY);
}

// Since the model for the Token config doesn't seem to want to cooperate, these stats are hard-coded to the 3 Cypher vitals
function getCypherPCTokenBarAttribute(barName, { alternative } = {}) {
    let stat;
    if (barName === "bar1") {
        stat = "stats.might.pool";
    } else if (barName === "bar2") {
        stat = "stats.speed.pool";
    } else if (barName === "bar3") {
        stat = "stats.intellect.pool";
    }

    let data = getProperty(this.actor.data.data, stat);
    data = duplicate(data);

    return {
        type: "bar",
        attribute: stat,
        value: parseInt(data.value || 0),
        max: parseInt(data.max || 0)
    }
}

// NPCs are like me: simple.
function getCypherNPCTokenBarAttribute(barName, { alternative } = {}) {
    if (barName !== "bar1")
        return null;

    let data = getProperty(this.actor.data.data, "health");
    data = duplicate(data);
    return {
        type: "bar",
        attribute: "health",
        value: parseInt(data.value || 0),
        max: parseInt(data.max || 0)
    }
}