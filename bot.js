// ================================
// Load config FIRST
// ================================
const config = require("./settings.json");
const mineflayer = require("mineflayer");

let bot;
let reconnectTimeout = null;

// ================================
// Create Bot Function
// ================================
function createBot() {
  console.log("Starting bot...");

  bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version || false,
    keepAlive: true
  });

  // ================================
  // Bot Events
  // ================================
  bot.once("spawn", () => {
    console.log("✅ Bot spawned successfully");

    const chatCfg = config.utils["chat-messages"];
    if (chatCfg?.enabled && chatCfg.repeat) {
      setInterval(() => {
        const msg =
          chatCfg.messages[
            Math.floor(Math.random() * chatCfg.messages.length)
          ];
        bot.chat(msg);
      }, chatCfg["repeat-delay"] * 1000);
    }
  });

  bot.on("end", (reason) => {
    console.log("❌ Bot disconnected:", reason);
    scheduleReconnect();
  });

  bot.on("error", (err) => {
    console.log("⚠️ Bot error:", err.message);
  });

  bot.on("kicked", (reason) => {
    console.log("🚫 Bot kicked:", reason);
  });
}

// ================================
// Auto Reconnect Logic
// ================================
function scheduleReconnect() {
  if (reconnectTimeout) return;

  console.log("🔄 Reconnecting in 15 seconds...");
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    createBot();
  }, 15000);
}

// ================================
// Start Bot
// ================================
createBot();

// ================================
// Crash Protection
// ================================
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  scheduleReconnect();
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
  scheduleReconnect();
});
