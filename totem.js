/**
 * Totem - The Spirits' RPG
 * A Foundry VTT system for narrative gameplay based on coin flips and traumas
 */

// Import document classes
import { TotemActor } from "./module/documents/actor.js";
import { TotemItem } from "./module/documents/item.js";

// Import sheet classes
import { TotemActorSheet } from "./module/sheets/actor-sheet.js";

// Import helpers
import * as dice from "./module/dice.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  console.log('Totem | Initializing Totem - The Spirits\' RPG System');

  // Add custom constants
  game.totem = {
    TotemActor,
    TotemItem,
    rollCoinFlip: dice.rollCoinFlip
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = TotemActor;
  CONFIG.Item.documentClass = TotemItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("totem", TotemActorSheet, { 
    types: ["character", "npc"],
    makeDefault: true,
    label: "TOTEM.SheetLabels.Actor"
  });

  // Skip custom Item sheet registration (not used)

  // Preload Handlebars templates
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Dice So Nice Integration                    */
/* -------------------------------------------- */

Hooks.once('diceSoNiceReady', (dice3d) => {
  console.log('Totem | Initializing Dice So Nice integration');
  
  // Add Totem system
  dice3d.addSystem({ id: "totem", name: "Totem - The Spirits' RPG" }, "preferred");
  
  // Add custom texture for coin
  dice3d.addTexture("totem_coin", {
    name: "Totem Coin",
    composite: "source-over",
    source: "systems/totem/assets/yes.webp"
  });
  
  // Add custom d2 preset with Sì/No faces
  dice3d.addDicePreset({
    type: "d2",
    labels: [
      "systems/totem/assets/no.webp",  // No face
      "systems/totem/assets/yes.webp"   // Sì face
    ],
    system: "totem"
  });
  
  // Add Totem colorset
  dice3d.addColorset({
    name: 'totem',
    description: "Totem Coin",
    category: "Totem",
    foreground: '#FFFFFF',
    background: '#8B7355',
    outline: 'none',
    edge: '#6B5A45',
    texture: 'totem_coin',
    material: 'metal'
  }, "preferred");
});

/* -------------------------------------------- */
/*  Ready Hook - Set Drawing Permissions       */
/* -------------------------------------------- */

Hooks.once('ready', async function() {
  // Only GM can modify permissions
  if (!game.user.isGM) return;

  // Get current permissions
  const permissions = game.settings.get("core", "permissions");
  
  // Ensure PLAYER role can create drawings
  if (!permissions.DRAWING_CREATE) {
    permissions.DRAWING_CREATE = [1, 2, 3, 4]; // PLAYER, TRUSTED, ASSISTANT, GAMEMASTER
  } else if (!permissions.DRAWING_CREATE.includes(1)) {
    permissions.DRAWING_CREATE.push(1); // Add PLAYER role
  }

  // Remove PLAYER role from template creation (only GM can create templates)
  if (!permissions.TEMPLATE_CREATE) {
    permissions.TEMPLATE_CREATE = [2, 3, 4]; // TRUSTED, ASSISTANT, GAMEMASTER (no PLAYER)
  } else if (permissions.TEMPLATE_CREATE.includes(1)) {
    permissions.TEMPLATE_CREATE = permissions.TEMPLATE_CREATE.filter(role => role !== 1); // Remove PLAYER role
  }

  // Save updated permissions
  await game.settings.set("core", "permissions", permissions);
  console.log("Totem | Drawing permissions configured for players");
  console.log("Totem | Template creation restricted to GM");
  
  // Add dice tray after a short delay
  setTimeout(addTotemDiceTray, 500);
});

/* -------------------------------------------- */
/*  Dice Tray Creation Function                 */
/* -------------------------------------------- */

function addTotemDiceTray() {
  // Try multiple selectors
  let chatForm = document.querySelector("#chat-form");
  if (!chatForm) chatForm = document.querySelector("form.chat-form");
  if (!chatForm) chatForm = document.querySelector("#chat textarea")?.closest("form");
  if (!chatForm) chatForm = document.querySelector("#chat-message")?.parentElement;
  
  if (!chatForm) {
    console.warn("Totem | Chat form not found, searching in sidebar...");
    const sidebar = document.querySelector("#sidebar");
    const chatLog = document.querySelector("#chat-log");
    
    if (chatLog) {
      // Insert after chat log
      const existingTray = document.querySelector(".totem-dice-tray");
      if (existingTray) return; // Already exists
      
      const tray = document.createElement("div");
      tray.className = "totem-dice-tray";
      tray.innerHTML = `
        <div class="tray-row">
          <button class="dice-btn" data-dice="d4" title="D4">d4</button>
          <button class="dice-btn" data-dice="d6" title="D6">d6</button>
          <button class="dice-btn" data-dice="d8" title="D8">d8</button>
          <button class="dice-btn" data-dice="d10" title="D10">d10</button>
          <button class="dice-btn" data-dice="d12" title="D12">d12</button>
          <button class="dice-btn" data-dice="d20" title="D20">d20</button>
          <button class="dice-btn" data-dice="d100" title="D100">d100</button>
        </div>
        <div class="tray-row">
          <button class="modifier-btn minus" title="Diminuisci">-</button>
          <input type="number" class="modifier-value" value="0" min="0" max="99" />
          <button class="modifier-btn plus" title="Aumenta">+</button>
          <button class="roll-btn" title="Tira i dadi">Tira</button>
        </div>
        <div class="tray-row">
          <button class="coin-flip-btn" title="Lancia una moneta">
            <i class="fas fa-coins"></i> Lancia una moneta
          </button>
        </div>
      `;
      
      chatLog.parentElement.insertBefore(tray, chatLog.nextSibling);
      setupDiceTrayHandlers(tray);
      console.log("Totem | Dice tray added after chat-log");
      return;
    }
    
    console.error("Totem | Cannot find suitable location for dice tray");
    return;
  }
  
  // Remove existing tray if present
  const existingTray = document.querySelector(".totem-dice-tray");
  if (existingTray) existingTray.remove();
  
  // Create dice tray HTML
  const tray = document.createElement("div");
  tray.className = "totem-dice-tray";
  tray.innerHTML = `
    <div class="tray-row">
      <button class="dice-btn" data-dice="d4" title="D4">d4</button>
      <button class="dice-btn" data-dice="d6" title="D6">d6</button>
      <button class="dice-btn" data-dice="d8" title="D8">d8</button>
      <button class="dice-btn" data-dice="d10" title="D10">d10</button>
      <button class="dice-btn" data-dice="d12" title="D12">d12</button>
      <button class="dice-btn" data-dice="d20" title="D20">d20</button>
      <button class="dice-btn" data-dice="d100" title="D100">d100</button>
    </div>
    <div class="tray-row">
      <button class="modifier-btn minus" title="Diminuisci">-</button>
      <input type="number" class="modifier-value" value="0" min="0" max="99" />
      <button class="modifier-btn plus" title="Aumenta">+</button>
      <button class="roll-btn" title="Tira i dadi">Tira</button>
    </div>
    <div class="tray-row">
      <button class="coin-flip-btn" title="Lancia una moneta">
        <i class="fas fa-coins"></i> Lancia una moneta
      </button>
    </div>
  `;
  
  // Insert before chat form
  chatForm.parentElement.insertBefore(tray, chatForm);
  setupDiceTrayHandlers(tray);
  console.log("Totem | Dice tray added before chat form");
}

function setupDiceTrayHandlers(tray) {
  let selectedDice = [];
  const modifierInput = tray.querySelector(".modifier-value");
  
  function updateDiceCount() {
    modifierInput.value = selectedDice.length;
  }
  
  tray.querySelectorAll(".dice-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const diceType = this.dataset.dice;
      selectedDice.push(diceType);
      updateDiceCount();
      this.classList.add("selected");
      setTimeout(() => this.classList.remove("selected"), 200);
    });
  });
  
  tray.querySelector(".minus").addEventListener("click", () => {
    if (selectedDice.length > 0) {
      selectedDice.pop();
      updateDiceCount();
    }
  });
  
  tray.querySelector(".plus").addEventListener("click", () => {
    if (selectedDice.length > 0) {
      const lastDice = selectedDice[selectedDice.length - 1];
      selectedDice.push(lastDice);
      updateDiceCount();
    }
  });
  
  tray.querySelector(".roll-btn").addEventListener("click", () => {
    if (selectedDice.length > 0) {
      const formula = selectedDice.map(d => `1${d}`).join(" + ");
      const roll = new Roll(formula);
      roll.toMessage();
      selectedDice = [];
      updateDiceCount();
    }
  });
  
  tray.querySelector(".coin-flip-btn").addEventListener("click", () => {
    dice.rollCoinFlip();
  });
}

/* -------------------------------------------- */
/*  Dice Tray Button - Alternative Hook        */
/* -------------------------------------------- */

// Additional hook to ensure tray is added when chat log renders
Hooks.on("renderChatLog", (app, html) => {
  setTimeout(addTotemDiceTray, 100);
});

/* -------------------------------------------- */
/*  Dice So Nice Configuration                  */
/* -------------------------------------------- */

Hooks.once("diceSoNiceReady", (dice3d) => {
  // Register custom coin texture
  dice3d.addTexture("totem_coin", {
    name: "Totem Coin",
    composite: "source-over",
    source: "systems/totem/assets/yes_coin.png",
    bump: "systems/totem/assets/yes_coin.png"
  });
  
  // Set custom coin appearance
  dice3d.addSystem({id: "totem_coin", name: "Totem Coin"}, "preferred");
  
  console.log("Totem | Dice So Nice custom coin texture registered");
});

/* -------------------------------------------- */
/*  Drawing Visibility Hook                     */
/* -------------------------------------------- */

// Ensure player drawings are visible to everyone
Hooks.on("preCreateDrawing", (drawing, data, options, userId) => {
  if (!drawing.hidden) {
    drawing.updateSource({ hidden: false });
  }
});
/* -------------------------------------------- */
/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

function registerHandlebarsHelpers() {
  Handlebars.registerHelper('concat', function() {
    let outStr = '';
    for (let arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
}

/* -------------------------------------------- */
/*  Handlebars Templates                        */
/* -------------------------------------------- */

async function preloadHandlebarsTemplates() {
  registerHandlebarsHelpers();

  return loadTemplates([
    // No partials needed for the simplified sheet
  ]);
}

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log('Totem | System Ready');
});

/* -------------------------------------------- */
/*  Coin Flip Widget (Floating Button)          */
/* -------------------------------------------- */

Hooks.on("renderSidebar", (app, html) => {
  if (document.querySelector("#totem-coin-widget")) return; // already rendered

  const widget = document.createElement("div");
  widget.id = "totem-coin-widget";
  widget.className = "totem-coin-widget";
  widget.title = "Lancia una moneta";

  const img = document.createElement("img");
  img.src = "systems/totem/assets/totem-coins.webp";
  img.alt = "Lancia una moneta";

  widget.appendChild(img);
  widget.addEventListener("click", () => dice.rollCoinFlip());

  document.body.appendChild(widget);
  
  // Update position when sidebar toggles
  updateWidgetPosition();
});

// Watch for sidebar collapse/expand
Hooks.on("collapseSidebar", updateWidgetPosition);

// Set default black background and red grid for new scenes
Hooks.on("preCreateScene", (scene, data, options, userId) => {
  const gridSize = 100; // Dimensione di ogni quadrato in pixel
  const gridWidth = 40; // Numero di quadratini in larghezza
  const gridHeight = 30; // Numero di quadratini in altezza
  
  if (!data.backgroundColor) {
    scene.updateSource({ backgroundColor: "#000000" });
  }
  if (!data.grid?.color) {
    scene.updateSource({ 
      "grid.color": "#ff0000",
      "grid.alpha": 1,
      "grid.thickness": 1,
      "grid.size": gridSize,
      "width": gridWidth * gridSize,
      "height": gridHeight * gridSize,
      "fogExploration": false,
      "globalLight": true,
      "tokenVision": false
    });
  }
});

// Set default token settings: show name on hover and lock rotation
Hooks.on("preCreateToken", (token, data, options, userId) => {
  token.updateSource({
    "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER, // Show name on hover for everyone
    "lockRotation": true // Disable token rotation
  });
});

function updateWidgetPosition() {
  const widget = document.querySelector("#totem-coin-widget");
  if (!widget) return;
  
  const sidebar = document.querySelector("#sidebar");
  const isCollapsed = sidebar?.classList.contains("collapsed");
  
  if (isCollapsed) {
    widget.style.right = "20px";
  } else {
    widget.style.right = "380px"; // sidebar width (300px) + extra margin
  }
}
