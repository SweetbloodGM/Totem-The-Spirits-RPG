/**
 * Extend the basic ActorSheet
 */
export class TotemActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["totem", "sheet", "actor"],
      width: 632,
      height: 919,
      tabs: [],
      resizable: true
    });
  }

  /** @override */
  get template() {
    return `systems/totem/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.system = this.actor.system;
    context.flags = this.actor.flags;
    context.rollData = this.actor.getRollData();

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Listen for archetype changes to update token
    html.find('select[name="system.archetipo"]').change(this._onArchetypeChange.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle archetype selection to automatically update token
   * @param {Event} event - The change event
   * @private
   */
  async _onArchetypeChange(event) {
    const archetype = event.target.value;
    
    // Map archetypes to token images
    const tokenMap = {
      "Veterano": "systems/totem/assets/veterano token.webp",
      "Poeta": "systems/totem/assets/poeta_token.webp",
      "Medium": "systems/totem/assets/medium_token.webp",
      "Martire": "systems/totem/assets/martire token.webp",
      "Esorcista": "systems/totem/assets/esorcista_token.webp"
    };

    const tokenPath = tokenMap[archetype];
    if (tokenPath) {
      // Update actor's image and prototype token
      await this.actor.update({
        "img": tokenPath,
        "prototypeToken.texture.src": tokenPath
      });
      
      // Update any placed tokens on the canvas
      for (let token of this.actor.getActiveTokens()) {
        await token.document.update({"texture.src": tokenPath});
      }
      
      ui.notifications.info(`Token aggiornato per archetipo: ${archetype}`);
    }
  }
}
