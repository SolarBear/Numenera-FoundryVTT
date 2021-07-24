import { createNumeneraMacro } from './macro.js';
import { RollData } from './dice/RollData.js';
import { NumeneraCommunityActor } from './actor/NumeneraCommunityActor.js';
import { NumeneraNPCActor } from './actor/NumeneraNPCActor.js';

/**
 * This function is simply meant to be the place where all hooks are registered.
 *
 * @export
 */
export async function registerHooks() {
  Hooks.once("ready", () => ui.notifications.info(
    `Numenera and its logo are trademarks of Monte Cook Games, LLC in the U.S.A. and other countries.
    All Monte Cook Games characters and character names, and the distinctive likenesses thereof,
    are trademarks of Monte Cook Games, LLC. Content derived from Monte Cook Games publications is
    © 2013-2019 Monte Cook Games, LLC.`)
  );

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
      const npcs = game.actors.entities.filter(e => e.constructor === NumeneraNPCActor || e.constructor === NumeneraCommunityActor);

      html.find(".entry-name")
          .each((i, el) => {
          const actor = npcs.find(npc => el.innerText.indexOf(npc.data.name) !== -1);
          if (!actor)
              return;

          //Display the NPC's target between parentheses
          el.innerHTML += ` (${actor.data.data.level * 3})`;
      });

  });

    //Change a chat message when it contains some roll data
    Hooks.on("renderChatMessage", (app, html, data) => {
        if (!app.isRoll || !app.isContentVisible)
            return;

        const roll = JSON.parse(data.message.roll);

        //Only apply ChatMessage enhancement to rolls performed from RollData
        if (roll && roll.hasOwnProperty("numenera")) {
            const { special, text, combat, color } = RollData.rollText(roll);
            const dt = html.find("h4.dice-total")[0];
            dt.textContent = text;

            if (combat)
                dt.insertAdjacentHTML('afterend', `<h4 class="dice-total">${combat}</h4>`);
        }
    });

    //Change a chat message when it contains some roll data
    Hooks.on("renderChatMessage", (app, html, data) => {
        html.find("a.sheet").click(function(event) {
            event.preventDefault();

            const element = event.currentTarget;
            const actor = game.actors.get(element.dataset.actorId);
            const item = actor.items.get(element.dataset.id);
            const sheet = item.sheet;
        
            if (sheet.rendered) {
              sheet.bringToTop();
              return sheet.maximize();
            }
        
            sheet.render(true);
        });
    });

  /**
   * Add additional system-specific sidebar directory context menu options for D&D5e Actor entities
   * @param {jQuery} html         The sidebar HTML
   * @param {Array} entryOptions  The default array of context menu options
   */
  Hooks.on("getActorDirectoryEntryContext", (html, entryOptions) => {
      entryOptions.push({
          name: game.i18n.localize("NUMENERA.gmIntrusion"),
          icon: '<i class="fas fa-exclamation-circle"></i>',
          callback: li => {
              const actor = game.actors.get(li.data("entityId"));
              const ownerIds = Object.entries(actor.data.permission)
                  .filter(entry => {
                      const [id, permissionLevel] = entry;
                      return permissionLevel >= CONST.ENTITY_PERMISSIONS.OWNER
                          && id !== game.user.id
                  })
                  .map(usersPermissions => usersPermissions[0]);

              game.socket.emit("system.numenera", {type: "gmIntrusion", data: {
                  userIds: ownerIds,
                  actorId: actor.data._id,
              }});

              ChatMessage.create({
                  content: `<h2>${game.i18n.localize("NUMENERA.gmIntrusion")}</h2><br/>${game.i18n.localize("NUMENERA.gmIntrusionText")} ${actor.data.name}`,
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

  // Many thanks to @asacolips for their awesome tutorial: https://gitlab.com/asacolips-projects/foundry-mods/foundryvtt-system-tutorial/-/blob/master/pages/16-macrobar-support.md
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (_, data, slot) => createNumeneraMacro(data, slot));
}
