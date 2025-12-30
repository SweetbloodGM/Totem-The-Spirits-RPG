/**
 * Extend the base Item document
 */
export class TotemItem extends Item {

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    // Set default image for items if not specified
    if (!data.img) {
      const updates = {
        img: "systems/totem/assets/img1.png"
      };
      this.updateSource(updates);
    }
  }

  /** @override */
  prepareData() {
    super.prepareData();
  }
}
