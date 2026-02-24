// ================================
// Load config FIRST
// ================================
const config = require("./settings.json");
const mineflayer = require("mineflayer");

// ================================
// REQUIRED FOR FREE RENDER WEB SERVICE
// ================================
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("AFK Bot is alive");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web service running");
});

// ================================
// Bot Logic
// ================================
let bot;
let reconnectTimeout = null;

function createBot() {
  console.log("Starting bot...");

  bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version || false,
    keepAlive: true
  });

  bot.once("spawn", () => {
    console.log("✅ Bot spawned");

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
    console.log("❌ Disconnected:", reason);
    scheduleReconnect();
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });

  bot.on("kicked", (reason) => {
    console.log("🚫 Kicked:", reason);
  });
}

function scheduleReconnect() {
  if (reconnectTimeout) return;

  console.log("🔄 Reconnecting in 15 seconds...");
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    createBot();
  }, 15000);
}

createBot();

process.on("uncaughtException", (err) => {
  console.error("🔥 Crash:", err);
  scheduleReconnect();
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 Promise error:", reason);
  scheduleReconnect();
});
