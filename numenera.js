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


import { NUMENERA } from './module/config.js';
import { getInitiativeFormula, rollInitiative } from './module/combat.js';
import { rollText } from './module/roll.js';
import { preloadHandlebarsTemplates } from './module/templates.js';
import { registerSystemSettings } from './module/settings.js';
import { migrateWorld } from './module/migrations/migrate.js';
import { numeneraSocketListeners } from './module/socket.js';
import { RecoveryDialog } from './module/apps/RecoveryDialog.js';
import { registerHandlebarHelpers } from './module/handlebarHelpers.js';

Hooks.once("init", function() {
    console.log('Numenera | Initializing Numenera System');

    game.numenera = {
        applications: {
            RecoveryDialog,
        },
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
    
    registerSystemSettings();
    registerHandlebarHelpers();
    preloadHandlebarsTemplates();
});

//TODO cleanup the functions here, it's gonna get messy real quick
  
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

Hooks.on('renderCompendium', async (app, html, options) => {
    const npcs = game.actors.entities.filter(e => e.constructor === NumeneraNPCActor);

    html.find(".entry-name")
        .each((i, el) => {
        const actor = npcs.find(npc => el.innerText.indexOf(npc.data.name) !== -1);
        if (!actor)
            return;

        //Display the NPC's target between parentheses
        el.innerHTML += ` (${actor.data.data.level * 3})`;
    });

});

Hooks.on("renderChatMessage", (app, html, data) => {
    if (!data.message.roll)
        return;

    const roll = JSON.parse(data.message.roll);

    //Don't apply ChatMessage enhancement to recovery rolls
    if (roll && roll.dice[0].faces === 20)
    {
        const special = rollText(roll.total);
        const dt = html.find("h4.dice-total")[0];

        //"special" refers to special attributes: minor/major effect or GM intrusion text, special background, etc.
        if (special) {
            const { text, color } = special;
            const newContent = `<span class="numenera-message-special">${text}</span>`;

            $(newContent).insertBefore(dt);
        }

        if (game.settings.get("numenera", "d20Rolling") === "taskLevels") {
            const rolled = roll.dice[0].rolls[0].roll;
            const taskLevel = Math.floor(rolled / 3);
            const skillLevel = (roll.total - rolled) / 3;
            const sum = taskLevel + skillLevel;

            let text = `Success Level ${sum}`;

            if (skillLevel !== 0) {
                const sign = sum > 0 ? "+" : "-";
                text += ` (${taskLevel}${sign}${skillLevel})`;
            }

            dt.textContent = text;
        }

    }
});

/**
 * Add additional system-specific sidebar directory context menu options for D&D5e Actor entities
 * @param {jQuery} html         The sidebar HTML
 * @param {Array} entryOptions  The default array of context menu options
 */
Hooks.on("getActorDirectoryEntryContext", (html, entryOptions) => {
    entryOptions.push({
        name: "GM Intrusion",
        icon: '<i class="fas fa-exclamation-circle"></i>',
        callback: li => {
            const actor = game.actors.get(li.data("entityId"));
            const ownerIds = Object.entries(actor.data.permission)
                .filter(entry => {
                    const [id, permissionLevel] = entry;
                    return permissionLevel >= ENTITY_PERMISSIONS.OWNER
                        && id !== game.user.id
                })
                .map(usersPermissions => usersPermissions[0]);

            game.socket.emit("system.numenera", {type: "gmIntrusion", data: {
                userIds: ownerIds,
                actorId: actor.data._id,
            }});

            ChatMessage.create({
                content: `<h2>GM Intrusion</h2><br/>The GM offers an intrusion to ${actor.data.name}`,
            });
        },
        condition: li => {
            if (!game.user.isGM)
                return false;

            const actor = game.actors.get(li.data("entityId"));
            return actor && actor.data.type === "pc";
        }
    });
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", migrateWorld);
Hooks.once("ready", numeneraSocketListeners);
