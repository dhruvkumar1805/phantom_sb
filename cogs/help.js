const fs = require("fs");
const path = require("path");

const moduleDescriptions = {
  crypto: "🪙 **Crypto** — View crypto-related commands",
  fun: "🎉 **Fun** — Enjoy fun & games",
  autoresponder: "📟 **Autoresponder** — Set up auto-replies",
  utility: "🛠️ **Utility** — Handy tools & features",
  transcripts: "📝 **Transcripts** — Save and view chat logs",
  goldmm: "🌟 **Gold MM** — GoldMM server commands ",
  settings: "⚙️ **Settings** — Bot configuration options",
  nsfw: "🔞 **NSFW** — Adult-only commands"
};

module.exports = (client, prefix) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || message.author.id !== client.user.id) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command !== "help") return;

    const moduleName = args[0]?.toLowerCase();

    if (!moduleName) {
      let msg = `👀 **PHANTOM SB**\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `\nUse \`${prefix}help <module>\` to view commands in a category.\n`;
      msg += `\n📚 **Available Modules:**\n\n`;

      for (const desc of Object.values(moduleDescriptions)) {
        msg += `${desc}\n`;
      }

      msg += `\n💡 *Try:* \`${prefix}help fun\``;
      return message.channel.send(msg);
    }

    const modulePath = path.join(__dirname, `${moduleName}.js`);
    if (!fs.existsSync(modulePath)) {
      return message.channel.send(`❌ Module \`${moduleName}\` not found. Check your spelling and try again.`);
    }

    try {
      delete require.cache[require.resolve(modulePath)];
      const mod = require(modulePath);
      const commands = mod.commands;

      if (!commands || !Array.isArray(commands) || commands.length === 0) {
        throw new Error("No commands found in this module.");
      }

      let msg = `📦 **${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Commands**\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;

      for (const cmd of commands) {
        msg += `• \`${prefix}${cmd.name}\` — ${cmd.description}\n`;
      }

      msg += `\n🧠 *Use these with the \`${prefix}\` prefix*`;
      return message.channel.send(msg);
    } catch (e) {
      console.error(`Error loading help for module '${moduleName}':`, e);
      return message.channel.send(`❌ Something went wrong loading the \`${moduleName}\` module.`);
    }
  });
};
