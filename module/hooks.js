import { rollText } from './roll.js';


/**
 * This function is simply meant to be the place where all hooks are registered.
 *
 * @export
 */
export function registerHooks() {
  Hooks.on("ready", () => ui.notifications.info(
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
          const special = rollText(roll.dice[0].rolls[0].roll);
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

              let text = `${game.i18n.localize("NUMENERA.successLevel")} ${sum}`;

              if (skillLevel !== 0) {
                  const sign = sum > 0 ? "+" : "";
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
          name: game.i18n.localize("NUMENERA.gmIntrusion"),
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
}