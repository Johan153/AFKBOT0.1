// ---------- Player Join/Leave + Smart Chat ----------
const chatCfg = config.utils["chat-messages"];
let lastPlayers = new Set();

function getRealPlayers() {
	return Object.keys(bot.players).filter(
		name => name !== bot.username && bot.players[name].entity
	);
}

bot.on("playerJoined", (player) => {
	if (!player || player.username === bot.username) return;
	bot.chat(`Hi ${player.username}, welcome!`);
});

bot.on("playerLeft", (player) => {
	if (!player || player.username === bot.username) return;
	bot.chat(`Bye ${player.username}, goodbye!`);
});

// repeating messages ONLY when server is empty
if (chatCfg.enabled && chatCfg.repeat) {
	const msgs = chatCfg.messages;
	const delay = chatCfg["repeat-delay"] * 1000;

	setInterval(() => {
		if (!bot.entity) return;

		const players = getRealPlayers();

		// send messages only if no players online
		if (players.length === 0) {
			const msg = msgs[Math.floor(Math.random() * msgs.length)];
			bot.chat(msg);
		}
	}, delay);
}

// one-time messages only if no players online
if (chatCfg.enabled && !chatCfg.repeat) {
	setTimeout(() => {
		const players = getRealPlayers();
		if (players.length === 0) {
			chatCfg.messages.forEach(m => bot.chat(m));
		}
	}, 2000);
}
