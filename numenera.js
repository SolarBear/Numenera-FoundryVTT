import './numenera.css';

import { ActorNumeneraPC } from './module/actorNumeneraPC.js';
import { ActorSheetNumeneraPC } from './module/sheets/actorSheetNumeneraPC.js';
import { NUMENERA } from './module/config.js';
import { preloadHandlebarsTemplates } from './module/templates.js';

Hooks.once("init", function() {
    console.log('Numenera | Initializing Numenera System');
  
    // Record Configuration Values
    CONFIG.NUMENERA = NUMENERA;
    CONFIG.Actor.entityClass = ActorNumeneraPC;
  
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("numenera", ActorSheetNumeneraPC, { types: ["pc"], makeDefault: true });
  
    // Preload Handlebars Templates
    preloadHandlebarsTemplates();
  });
  