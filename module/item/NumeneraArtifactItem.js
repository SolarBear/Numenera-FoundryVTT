export class NumeneraArtifactItem extends Item {
    static get type() {
        return "artifact";
    }

    static get object() {
        return {
          type: NumeneraArtifactItem.type,
          name: game.i18n.localize("NUMENERA.item.artifact.newArtifact"),
        }
      }

    /**
     * Transform the current artifact so it doesn't look identified.
     *
     * @memberof NumeneraArtifactItem
     */
    static asUnidentified(artifact) {
        if (artifact.constructor === Object)
            artifact = NumeneraArtifactItem.fromOwnedItem(artifact);

        artifact.data.name = game.i18n.localize("NUMENERA.pc.numenera.artifact.unidentified");
        artifact.data.data.level = game.i18n.localize("NUMENERA.unknown");
        artifact.data.data.effect = game.i18n.localize("NUMENERA.unknown");
        artifact.data.data.laws = game.i18n.localize("NUMENERA.unknown");
        artifact.data.data.depletion = null;

        return artifact;
    }

    /**
     * Convert an artifact POJO to a NumeneraArtifactItem.
     *
     * @static
     * @param {Object} ownedItem
     * @param {NumeneraPCActor} actor
     * @returns
     * @memberof NumeneraArtifactItem
     */
    static async fromOwnedItem(ownedItem, actor) {
        let artifactItem;

        if (actor === null)
            artifactItem = new Item(NumeneraArtifactItem.object);
        else
            artifactItem = await actor.createEmbeddedDocuments("Item", [NumeneraArtifactItem.object]);

        artifactItem.data._id = ownedItem._id;
        artifactItem.data.name = ownedItem.name;
        artifactItem.data.price = ownedItem.data.price;
        artifactItem.data.notes = ownedItem.data.notes;
        artifactItem.data.efffect = ownedItem.data.effect;
        artifactItem.data.form = ownedItem.data.form;
        artifactItem.data.laws = ownedItem.data.laws;
        artifactItem.data.range = ownedItem.data.range;
        artifactItem.data.level = ownedItem.data.level;
        artifactItem.data.levelDie = ownedItem.data.levelDie;
        artifactItem.data.depletion = ownedItem.data.depletion;

        artifactItem.options.actor = actor;

        artifactItem.prepareData();

        return artifactItem;
    }

    async prepareData() {
        super.prepareData();

        // Override common default icon
        if (!this.data.img || this.data.img === this.data.constructor.DEFAULT_ICON)
            this.data.img = 'icons/svg/mage-shield.svg';

        let itemData = this.data;
        if (itemData.hasOwnProperty("data"))
            itemData = itemData.data;

        itemData.name = this.data.name || game.i18n.localize("NUMENERA.item.artifact.newArtifact");
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";
        itemData.form = itemData.form || "";
        itemData.laws = itemData.laws || "";
        itemData.effect = itemData.effect || "";
        itemData.range = itemData.range || "";

        itemData.depletion = itemData.depletion || {
            isDepleting: true,
            die: "d6",
            threshold: 1
        };

        itemData.levelDie = itemData.levelDie || "";
        itemData.level = itemData.level || "";
    }

    async toChatMessage() {
        const data = {
          id: this.id,
          actorId: this.actor.id,
          type: this.type,
          name: this.data.name,
          img: this.data.img,
          form: this.data.data.form,
          level: this.data.data.level,
          effect: this.data.data.effect,
          laws: this.data.data.laws,
          depletion: this.data.data.depletion,
        };
    
        if (!this.data.data.identified) {
          data.name = game.i18n.localize("NUMENERA.pc.numenera.artifact.unidentified");
          data.level = game.i18n.localize("NUMENERA.unknown");
          data.effect = game.i18n.localize("NUMENERA.unknown");
          data.depletion = null;
        }
    
        await ChatMessage.create({
          user: game.user._id,
          speaker: ChatMessage.getSpeaker({user: game.user}),
          content: await renderTemplate(
            "systems/numenera/templates/chat/items/artifact.html", 
            data,
          )
        });
      }
}
