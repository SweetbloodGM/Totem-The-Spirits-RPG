/**
 * Totem Actor Sheet (Foundry VTT v14+)
 * Migrated to the Application V2 framework to avoid V1 deprecation warnings.
 */
export class TotemActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {

  /** @type {{start: number, end: number} | null} */
  _pendingNameSelection = null;

  /** @type {(() => void) | null} */
  _totemWindowResizeHandler = null;

  /** @type {ResizeObserver | null} */
  _totemScaleObserver = null;

  /** @type {number | null} */
  _totemScaleRaf = null;

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["totem", "sheet", "actor"],
    tag: "div",
    position: {
      width: 632,
      height: 919
    },
    resizable: true,
    window: {
      ...(super.DEFAULT_OPTIONS?.window ?? {}),
      resizable: true
    },
    form: {
      ...(super.DEFAULT_OPTIONS?.form ?? {}),
      selector: "form",
      submitOnChange: false,
      closeOnSubmit: false
    }
  });

  static PARTS = {
    form: {
      template: "systems/totem/templates/actor/actor-character-sheet.hbs"
    }
  };

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const actor = this.document ?? this.actor;
    const actorType = actor?.type ?? "character";
    const template = `systems/totem/templates/actor/actor-${actorType}-sheet.hbs`;

    const partKey = ["form", "main", "body"].find((k) => parts?.[k]) ?? Object.keys(parts ?? {})[0];
    if (partKey) parts[partKey].template = template;

    return parts;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document ?? this.actor;

    const baseCss = String(context?.cssClass ?? "").trim();
    const ownCss = Array.isArray(this.options?.classes) ? this.options.classes.join(" ") : "";
    const cssClass = [baseCss, ownCss].filter(Boolean).join(" ").trim();

    return {
      ...context,
      cssClass,
      actor,
      system: actor?.system,
      flags: actor?.flags,
      rollData: actor?.getRollData?.() ?? {}
    };
  }

  /** @override */
  _attachPartListeners(partId, htmlElement, options) {
    super._attachPartListeners(partId, htmlElement, options);

    this._setupResponsiveLayout();

    const form = htmlElement?.matches?.("form") ? htmlElement : htmlElement?.querySelector?.("form");
    if (form && !form.dataset.totemSubmitBound) {
      form.dataset.totemSubmitBound = "1";
      form.addEventListener("submit", (event) => this._onTotemFormSubmit(event), true);
      form.addEventListener("change", (event) => {
        void this._onTotemFormChange(event);
      }, true);
      form.addEventListener("keydown", (event) => this._onTotemFormKeydown(event), true);
    }
  }

  _setupResponsiveLayout() {
    if (!this.element) return;

    // Ensure we stay on-screen and content scales when monitor/resolution changes.
    // Use window resize only; ResizeObserver+setPosition can prevent opening on some setups.

    if (!this._totemWindowResizeHandler) {
      this._totemWindowResizeHandler = () => {
        this._applyViewportClamp();
        this._applySheetScale();
      };
      window.addEventListener("resize", this._totemWindowResizeHandler);
    }

    // Update scale also when the app is manually resized (drag handle).
    if (!this._totemScaleObserver && typeof globalThis.ResizeObserver === "function") {
      const windowContent = this.element.querySelector?.(".window-content") ?? this.element;
      if (windowContent) {
        this._totemScaleObserver = new ResizeObserver(() => {
          if (this._totemScaleRaf != null) return;
          const raf = globalThis.requestAnimationFrame;
          if (typeof raf !== "function") {
            this._applyViewportClamp();
            this._applySheetScale();
            return;
          }
          this._totemScaleRaf = raf(() => {
            this._totemScaleRaf = null;
            this._applyViewportClamp();
            this._applySheetScale();
          });
        });
        this._totemScaleObserver.observe(windowContent);
      }
    }

    // Initial pass after the current render frame
    const raf = globalThis.requestAnimationFrame;
    if (typeof raf === "function") {
      raf(() => {
        this._applyViewportClamp();
        this._applySheetScale();
      });
    } else {
      this._applyViewportClamp();
      this._applySheetScale();
    }
  }

  _applyViewportClamp() {
    const el = this.element;
    if (!el) return;
    if (this.rendered === false) return;

    const pos = this.position ?? {};
    const currentLeft = Number(pos.left ?? 0);
    const currentTop = Number(pos.top ?? 0);

    // Only clamp the window position here. Window size is constrained in setPosition()
    // so resizing doesn't overshoot and "snap back".
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const left = clamp(currentLeft, 0, Math.max(0, window.innerWidth - (Number(pos.width) || 0)));
    const top = clamp(currentTop, 0, Math.max(0, window.innerHeight - (Number(pos.height) || 0)));

    const changed = (Number(pos.left) !== left) || (Number(pos.top) !== top);
    if (changed && typeof super.setPosition === "function") super.setPosition({ left, top });
  }

  /** @override */
  setPosition(position = {}) {
    const margin = 20;
    const viewportMaxWidth = Math.max(1, window.innerWidth - margin);
    const viewportMaxHeight = Math.max(1, window.innerHeight - margin);

    // Hard cap: don't allow resizing larger than the designed sheet window.
    const designedMaxWidth = Number(this.options?.position?.width ?? 632);
    const designedMaxHeight = Number(this.options?.position?.height ?? 919);

    const maxWidth = Math.min(viewportMaxWidth, designedMaxWidth);
    const maxHeight = Math.min(viewportMaxHeight, designedMaxHeight);

    const next = { ...position };

    // Keep window resizing proportional (prevents empty space around the artwork).
    // We express resize intent as a scale factor relative to the designed window size.
    const hasWidth = next.width != null;
    const hasHeight = next.height != null;
    const intendedScale = hasWidth && hasHeight
      ? Math.min(Number(next.width) / designedMaxWidth, Number(next.height) / designedMaxHeight)
      : hasWidth
        ? Number(next.width) / designedMaxWidth
        : hasHeight
          ? Number(next.height) / designedMaxHeight
          : null;

    if (intendedScale != null && Number.isFinite(intendedScale)) {
      const clampedScale = Math.max(0.05, Math.min(
        intendedScale,
        maxWidth / designedMaxWidth,
        maxHeight / designedMaxHeight
      ));
      next.width = Math.round(designedMaxWidth * clampedScale);
      next.height = Math.round(designedMaxHeight * clampedScale);
    } else {
      if (next.width != null) next.width = Math.min(Number(next.width), maxWidth);
      if (next.height != null) next.height = Math.min(Number(next.height), maxHeight);
    }

    const result = super.setPosition(next);

    // Keep the sheet fully visible when shrinking by updating scale immediately.
    const raf = globalThis.requestAnimationFrame;
    if (typeof raf === "function") raf(() => this._applySheetScale());
    else this._applySheetScale();

    return result;
  }

  _applySheetScale() {
    const el = this.element;
    if (!el) return;

    const windowContent = el.querySelector?.(".window-content") ?? el;
    const sheetBackground = el.querySelector?.(".sheet-background");
    if (!windowContent || !sheetBackground) return;

    // These are the designed pixel dimensions of the sheet artwork.
    const baseWidth = 612;
    const baseHeight = 859;

    const padding = 16;
    const availableWidth = Math.max(1, windowContent.clientWidth - padding);
    const availableHeight = Math.max(1, windowContent.clientHeight - padding);

    const scale = Math.min(1, availableWidth / baseWidth, availableHeight / baseHeight);
    windowContent.style.setProperty("--totem-sheet-scale", String(scale));
  }

  /** @override */
  async close(options = {}) {
    try {
      if (this._totemWindowResizeHandler) {
        window.removeEventListener("resize", this._totemWindowResizeHandler);
        this._totemWindowResizeHandler = null;
      }
      if (this._totemScaleObserver) {
        this._totemScaleObserver.disconnect();
        this._totemScaleObserver = null;
      }
      if (this._totemScaleRaf != null && typeof globalThis.cancelAnimationFrame === "function") {
        cancelAnimationFrame(this._totemScaleRaf);
        this._totemScaleRaf = null;
      }
    } finally {
      return super.close(options);
    }
  }

  _onTotemFormSubmit(event) {
    // Safety net: never allow a native HTML form submission to refresh the page.
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
  }

  _onTotemFormKeydown(event) {
    if (!event) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (event.key !== "Enter") return;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== "name") return;

    // Prevent triggering a form submit; instead persist just the name.
    event.preventDefault();
    event.stopImmediatePropagation();
    void this._persistFieldChange(target);
  }

  async _onTotemFormChange(event) {
    const target = event?.target;
    if (!(target instanceof HTMLElement)) return;
    if (!("name" in target)) return;
    if (!target.name) return;

    await this._persistFieldChange(target);
  }

  async _persistFieldChange(target) {
    const actor = this.document ?? this.actor;
    if (!actor) return;

    const fieldName = target.name;
    const value = "value" in target ? target.value : undefined;

    if (fieldName === "system.archetipo") {
      await this._applyArchetype(value);
      return;
    }

    if (fieldName === "name") {
      const input = target instanceof HTMLInputElement ? target : null;
      const start = input?.selectionStart ?? null;
      const end = input?.selectionEnd ?? null;
      if (typeof start === "number" && typeof end === "number") {
        this._pendingNameSelection = { start, end };
      }

      const previousName = actor.name;
      const nextName = typeof value === "string" ? value : "";
      if (!nextName.trim()) return;

      await actor.update({ name: nextName });

      if (nextName !== previousName) ui.notifications.info(`Nome aggiornato: ${nextName}`);
      this._restoreNameSelectionSoon();
      return;
    }

    if (typeof fieldName === "string" && fieldName.length) {
      const update = foundry.utils.expandObject({ [fieldName]: value });
      await actor.update(update);
    }
  }

  _restoreNameSelectionSoon() {
    const selection = this._pendingNameSelection;
    if (!selection) return;

    const tryRestore = () => {
      const nameInput = this.element?.querySelector?.('input[name="name"]');
      if (!(nameInput instanceof HTMLInputElement)) return false;

      const len = nameInput.value?.length ?? 0;
      const start = Math.max(0, Math.min(selection.start, len));
      const end = Math.max(0, Math.min(selection.end, len));
      nameInput.focus();
      nameInput.setSelectionRange(start, end);
      this._pendingNameSelection = null;
      return true;
    };

    // Try a few times across frames to survive any re-render.
    let attempts = 0;
    const tick = () => {
      attempts += 1;
      if (tryRestore()) return;
      if (attempts >= 6) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async _applyArchetype(archetype) {
    if (typeof archetype !== "string") return;
    const actor = this.document ?? this.actor;
    if (!actor) return;

  /* -------------------------------------------- */

  /**
   * Handle archetype selection to automatically update token
   * @param {Event} event - The change event
   * @private
   */
    // Map archetypes to token images
    const tokenMap = {
      "Veterano": "systems/totem/assets/veterano token.webp",
      "Poeta": "systems/totem/assets/poeta_token.webp",
      "Medium": "systems/totem/assets/medium_token.webp",
      "Martire": "systems/totem/assets/martire token.webp",
      "Esorcista": "systems/totem/assets/esorcista_token.webp"
    };

    const tokenPath = tokenMap[archetype];
    if (!tokenPath) {
      await actor.update({ "system.archetipo": archetype });
      return;
    }

    // Update actor's image and prototype token
    await actor.update({
      "system.archetipo": archetype,
      "img": tokenPath,
      "prototypeToken.texture.src": tokenPath
    });
    
    // Update any placed tokens on the canvas
    for (const token of actor.getActiveTokens()) {
      await token.document.update({"texture.src": tokenPath});
    }
    
    ui.notifications.info(`Token aggiornato per archetipo: ${archetype}`);
  }
}
