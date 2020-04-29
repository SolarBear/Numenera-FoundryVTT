import { NumeneraActor } from './module/actor/NumeneraActor.js';
import { NumeneraNPCActorSheet } from './module/actor/sheets/NumeneraNPCActorSheet.js';
import { NumeneraPCActorSheet } from './module/actor/sheets/NumeneraPCActorSheet.js';
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
    CONFIG.Actor.entityClass = NumeneraActor;
    CONFIG.Item.entityClass = NumeneraItem;

    //Each type of Actor will provide its own personal, free-range, bio, nut-free formula.
    Combat.prototype._getInitiativeFormula = combatant => combatant.actor.getInitiativeFormula();

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("numenera", NumeneraNPCActorSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("numenera", NumeneraPCActorSheet, { types: ["pc"], makeDefault: true });

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
  
  /*
  Display an NPC's difficulty between parentheses in the Actors list
  */
  Hooks.on('renderActorDirectory', (app, html, options) => {
    const found = html.find(".entity-name");
    
    app.entities
        .filter(actor => actor.data.type === 'npc')
        .forEach(actor => {
            found.filter((i, elem) => elem.innerText === actor.data.name)
                 .each((i, elem) => elem.innerText += ` (${actor.data.data.level * 3})`);
        })
});
