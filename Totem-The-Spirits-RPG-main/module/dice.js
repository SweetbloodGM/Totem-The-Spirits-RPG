/**
 * Coin flip mechanics for Totem - Rewritten
 */

/**
 * Roll a coin flip (50/50 chance)
 * @param {Object} options - Roll options
 * @returns {Promise<ChatMessage>}
 */
export async function rollCoinFlip(options = {}) {
  const speaker = options.speaker || ChatMessage.getSpeaker();
  
  // Create a d2 roll for Dice So Nice
  const roll = await new Roll("1d2").evaluate();
  const isSuccess = roll.total === 2; // 2 = Sì, 1 = No
  
  // Select the appropriate sound based on result
  const soundPath = isSuccess ? "systems/totem/assets/yes.mp3" : "systems/totem/assets/no.mp3";
  
  // Play the custom sound
  const audio = new Audio(soundPath);
  audio.volume = 0.2;
  audio.play().catch(e => console.warn("Totem | Audio play error:", e));
  
  // Show 3D dice if Dice So Nice is available (without system sound, without waiting)
  if (game.dice3d) {
    game.dice3d.showForRoll(roll, game.user, true, null, false);
  }
  
  // Wait 5 seconds from audio start before showing the result in chat
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Build the chat message content
  const templateData = {
    isSuccess: isSuccess,
    resultText: isSuccess ? "Sì" : "No",
    resultImage: isSuccess ? "systems/totem/assets/yes.webp" : "systems/totem/assets/no.webp"
  };

  const templatePath = "systems/totem/templates/chat/coin-flip.hbs";
  const templateRenderer = foundry?.applications?.handlebars?.renderTemplate
    ?? globalThis.renderTemplate;

  if (typeof templateRenderer !== "function") {
    throw new Error("Totem | No template renderer available (renderTemplate)");
  }

  const html = await templateRenderer(templatePath, templateData);

  // In Foundry v14 roll-style chat messages are expected to carry actual rolls.
  // This system message is better represented as a generic chat card.
  const chatData = {
    user: game.user.id,
    speaker: speaker,
    content: html,
    sound: null
  };

  if (CONST?.CHAT_MESSAGE_STYLES?.OTHER !== undefined) chatData.style = CONST.CHAT_MESSAGE_STYLES.OTHER;
  else if (CONST?.CHAT_MESSAGE_TYPES?.OTHER !== undefined) chatData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;

  if (typeof ChatMessage.create === "function") return ChatMessage.create(chatData);
  const [message] = await ChatMessage.createDocuments([chatData]);
  return message;
}
