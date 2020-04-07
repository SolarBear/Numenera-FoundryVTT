import { ActorNumeneraNPC } from './module/actorNumeneraNPC.js';
import { ActorNumeneraPC } from './module/actorNumeneraPC.js';
import { ActorSheetNumeneraNPC } from './module/sheets/actorSheetNumeneraNPC.js';
import { ActorSheetNumeneraPC } from './module/sheets/actorSheetNumeneraPC.js';
import { NUMENERA } from './module/config.js';
import { preloadHandlebarsTemplates } from './module/templates.js';

Hooks.once("init", function() {
    console.log('Numenera | Initializing Numenera System');
  
    // Record Configuration Values
    CONFIG.NUMENERA = NUMENERA;

    //Dirty trick to instantiate the right class. Kids, do NOT try this at home.
    CONFIG.Actor.entityClass = new Proxy(function(){}, {
      //Calling a constructor from this proxy object
      construct: function(target, args) {
        const [data] = args;
        switch(data.type) {
          case "pc":
            return new ActorNumeneraPC(...args);

          case "npc":
            return new ActorNumeneraNPC(...args);

          default:
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
            return function (data, options) {
              switch(data.type) {
                case "pc":
                  return ActorNumeneraPC.create(data, options);
                case "npc":
                  return ActorNumeneraNPC.create(data, options);
                default:
                  throw new Error("Unsupported Entity type for create(): " + data.type);
               }
            }
          case Symbol.hasInstance:
            //Applying the "instanceof" operator on the instance object
            return function(instance) {
              return instance instanceof ActorNumeneraNPC
                  || instance instanceof ActorNumeneraPC;
            }
          default:
            console.error("Unsupported proxy property: " + prop);
        }
      }
    });
  
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("numenera", ActorSheetNumeneraNPC, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("numenera", ActorSheetNumeneraPC, { types: ["pc"], makeDefault: true });
  
    // Preload Handlebars Templates
    preloadHandlebarsTemplates();
  });
  