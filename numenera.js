import { ActorNumeneraNPC } from './module/actor/actorNumeneraNPC.js';
import { ActorNumeneraPC } from './module/actor/actorNumeneraPC.js';
import { ActorSheetNumeneraNPC } from './module/actor/sheets/actorSheetNumeneraNPC.js';
import { ActorSheetNumeneraPC } from './module/actor/sheets/actorSheetNumeneraPC.js';
import { NUMENERA } from './module/config.js';
import { preloadHandlebarsTemplates } from './module/templates.js';
import { NumeneraItem } from './module/item/NumeneraItem.js';
import { NumeneraArmorItemSheet } from './module/item/sheets/NumeneraArmorItemSheet.js';
import { NumeneraArtifactItemSheet } from './module/item/sheets/NumeneraArtifactItemSheet.js';
import { NumeneraCypherItemSheet } from './module/item/sheets/NumeneraCypherItemSheet.js';
import { NumeneraEquipmentItemSheet } from './module/item/sheets/NumeneraEquipmentItemSheet.js';
import { NumeneraOddityItemSheet } from './module/item/sheets/NumeneraOddityItemSheet.js';
import { NumeneraWeaponItemSheet } from './module/item/sheets/NumeneraWeaponItemSheet.js';

Hooks.once("init", function() {
    console.log('Numenera | Initializing Numenera System');

    // Record Configuration Values
    CONFIG.NUMENERA = NUMENERA;

    //Dirty trick to instantiate the right class. Kids, do NOT try this at home.
    CONFIG.Actor.entityClass = new Proxy(function() {}, {
        //Calling a constructor from this proxy object
        construct: function(target, args) {
            const [data] = args;
            switch (data.type) {
                case "pc":
                    return new ActorNumeneraPC(...args);

                case "npc":
                    return new ActorNumeneraNPC(...args);

                default:
                    debugger;
                    throw new Error("Unsupported Entity type for create(): " + data.type);
            }
        },
        //Property access on this weird, dirty proxy object
        get: function(target, prop, receiver) {
            switch (prop) {
                case "config":
                    //Getting the class' config
                    //Since both classes inherit from Actor, we can
                    //return from any one of the two
                    return ActorNumeneraPC.config;

                case "entity":
                    //Getting the class' entity
                    //Since both classes inherit from Actor, we can
                    //return from any one of the two
                    return ActorNumeneraPC.entity;

                case "create":
                    //Calling the class' create() static function
                    return function(data, options) {
                        switch (data.type) {
                            case "pc":
                                return ActorNumeneraPC.create(data, options);
                            case "npc":
                                return ActorNumeneraNPC.create(data, options);
                            default:
                                throw new Error("Unsupported Entity type for create(): " + data.type);
                        }
                    }

                case "name":
                    return target.name;

                case Symbol.hasInstance:
                    //Applying the "instanceof" operator on the instance object
                    return function(instance) {
                        return instance instanceof ActorNumeneraPC ||
                            instance instanceof ActorNumeneraNPC;
                    }
                default:
                    debugger;
                    console.error("Unsupported proxy property: " + prop);
            }
        }
    });

    CONFIG.Item.entityClass = NumeneraItem;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("numenera", ActorSheetNumeneraNPC, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("numenera", ActorSheetNumeneraPC, { types: ["pc"], makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("numenera", NumeneraArmorItemSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraArtifactItemSheet, { types: ["artifact"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraCypherItemSheet, { types: ["cypher"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraEquipmentItemSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraOddityItemSheet, { types: ["oddity"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraWeaponItemSheet, { types: ["weapon"], makeDefault: true });


    // Preload Handlebars Templates
    preloadHandlebarsTemplates();
});