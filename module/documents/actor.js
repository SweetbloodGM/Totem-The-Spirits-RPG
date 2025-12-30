/**
 * Extend the base Actor document
 */
export class TotemActor extends Actor {

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    // Set default images for actors if not specified
    const updates = {};
    
    if (!data.img) {
      if (data.type === "character") {
        updates.img = "systems/totem/assets/black sheet.webp";
        updates["prototypeToken.texture.src"] = "systems/totem/assets/black sheet.webp";
      } else if (data.type === "npc") {
        updates.img = "systems/totem/assets/spirit_sheet.webp";
        updates["prototypeToken.texture.src"] = "systems/totem/assets/spirit_sheet.webp";
      }
    }

    if (Object.keys(updates).length > 0) {
      this.updateSource(updates);
    }
  }

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    const actorData = this;
    // Make separate methods for each Actor type (character, npc, etc.) to keep things organized
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;
    
    // Count filled trauma slots and enforce max of 3
    const traumas = [systemData.trauma1, systemData.trauma2, systemData.trauma3];
    systemData.traumaCount = Math.min(traumas.filter(t => (t || "").trim().length > 0).length, 3);
  }

  /**
   * Prepare NPC type specific data
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    const systemData = actorData.system;
  }

  /**
   * Override getRollData() to provide actor data to rolls
   */
  getRollData() {
    const data = super.getRollData();
    
    // Add trauma count for potential modifiers
    data.traumaCount = this.system.traumaCount || 0;
    
    return data;
  }

  /**
   * Handle coin flip rolls for this actor
   */
  async rollCoinFlip(options = {}) {
    const speaker = ChatMessage.getSpeaker({ actor: this });
    
    // Import the dice module function
    const { rollCoinFlip } = await import("../dice.js");
    return rollCoinFlip({ 
      speaker,
      actor: this,
      ...options 
    });
  }
}
