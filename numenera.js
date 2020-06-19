import { NumeneraActor } from './module/actor/NumeneraActor.js';
import { NumeneraNPCActor } from './module/actor/NumeneraNPCActor.js';
import { NumeneraNPCActorSheet } from './module/actor/sheets/NumeneraNPCActorSheet.js';
import { NumeneraPCActorSheet } from './module/actor/sheets/NumeneraPCActorSheet.js';

import { NumeneraItem } from './module/item/NumeneraItem.js';
import { NumeneraAbilityItemSheet } from './module/item/sheets/NumeneraAbilityItemSheet.js';
import { NumeneraArmorItemSheet } from './module/item/sheets/NumeneraArmorItemSheet.js';
import { NumeneraArtifactItemSheet } from './module/item/sheets/NumeneraArtifactItemSheet.js';
import { NumeneraCypherItemSheet } from './module/item/sheets/NumeneraCypherItemSheet.js';
import { NumeneraEquipmentItemSheet } from './module/item/sheets/NumeneraEquipmentItemSheet.js';
import { NumeneraOddityItemSheet } from './module/item/sheets/NumeneraOddityItemSheet.js';
import { NumeneraSkillItemSheet } from './module/item/sheets/NumeneraSkillItemSheet.js';
import { NumeneraWeaponItemSheet } from './module/item/sheets/NumeneraWeaponItemSheet.js';
import { StrangeRecursionItemSheet } from './module/item/sheets/StrangeRecursionItemSheet.js';

import { NUMENERA } from './module/config.js';
import { getInitiativeFormula, rollInitiative } from './module/combat.js';
import { preloadHandlebarsTemplates } from './module/templates.js';
import { registerSystemSettings } from './module/settings.js';
import { migrateWorld } from './module/migrations/migrate.js';
import { numeneraSocketListeners } from './module/socket.js';
import { RecoveryDialog } from './module/apps/RecoveryDialog.js';
import { registerHandlebarHelpers } from './module/handlebarHelpers.js';
import { add3rdBarToPCTokens, cypherToken } from './module/token.js';
import { registerHooks } from './module/hooks.js';
import { useItemMacro } from './module/macro.js';
import { cypherRuler } from './module/ruler.js';

Hooks.once("init", function() {
    console.log('Numenera | Initializing Numenera System');

    game.numenera = {
        applications: {
            RecoveryDialog,
        },
        useItemMacro,
    };

    // Record Configuration Values
    CONFIG.NUMENERA = NUMENERA;

    //Dirty trick to instantiate the right class. Kids, do NOT try this at home.
    CONFIG.Actor.entityClass = NumeneraActor;
    CONFIG.Item.entityClass = NumeneraItem;

    //Each type of Actor will provide its own personal, free-range, bio, nut-free formula.
    Combat.prototype._getInitiativeFormula = getInitiativeFormula;
    Combat.prototype.rollInitiative = rollInitiative;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("numenera", NumeneraNPCActorSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("numenera", NumeneraPCActorSheet, { types: ["pc"], makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("numenera", NumeneraAbilityItemSheet, { types: ["ability"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraArmorItemSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraArtifactItemSheet, { types: ["artifact"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraCypherItemSheet, { types: ["cypher"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraEquipmentItemSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraOddityItemSheet, { types: ["oddity"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraSkillItemSheet, { types: ["skill"], makeDefault: true });
    Items.registerSheet("numenera", NumeneraWeaponItemSheet, { types: ["weapon"], makeDefault: true });
    Items.registerSheet("numenera", StrangeRecursionItemSheet, { types: ["recursion"], makeDefault: true });

    //May seem weird but otherwise
    Items.registerSheet("numenera", ActorSheet, { types: ["npcAttack"], makeDefault: true });

    registerSystemSettings();
    registerHandlebarHelpers();
    preloadHandlebarsTemplates();
});

//Place asy clean, well-behaved hook here
Hooks.once("init", cypherToken);
Hooks.once("init", cypherRuler);
Hooks.once("ready", add3rdBarToPCTokens);
Hooks.once("ready", migrateWorld);
Hooks.once("ready", numeneraSocketListeners);

//Random hooks should go in there
<<<<<<< HEAD
Hooks.once("ready", registerHooks);
=======
Hooks.once("ready", registerHooks);
>>>>>>> 873211fb83313b36cb890699d5f9c24fd9aee9c9
