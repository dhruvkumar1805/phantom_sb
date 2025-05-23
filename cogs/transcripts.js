const { MessageAttachment } = require("discord.js-selfbot-v13");
const fs = require("fs");
const path = require("path");

module.exports = (client, prefix) => {
  client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix + "transcript")) return;
    if (message.author.id !== client.user.id) return;

    // Parse limit from args
    const args = message.content.split(" ").slice(1);
    const limit = parseInt(args[0]) || 50;

    const loadingMsg = await message.channel.send("⏳ Generating transcript, please wait...");

    try {
      const messages = [];
      const history = await message.channel.messages.fetch({ limit });

      const sorted = history.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      sorted.forEach((msg) => {
        const time = msg.createdAt.toISOString().replace("T", " ").split(".")[0];
        const content = msg.content.replace(/\n/g, " ");
        const attachments = msg.attachments.size > 0 ? " [Attachments]" : "";
        const embeds = msg.embeds.length > 0 ? " [Embeds]" : "";
        const line = `[${time}] ${msg.author.username}: ${content}${attachments}${embeds}`;
        messages.push(line);
      });

      const transcriptText = messages.join("\n");
      const filePath = path.join(__dirname, "transcript.txt");
      fs.writeFileSync(filePath, transcriptText);

      await message.channel.send({
        content: "📄 Here's the transcript:",
        files: [filePath],
      });

      fs.unlinkSync(filePath); // Clean up file
    } catch (err) {
      console.error("Transcript Error:", err);
      await message.channel.send("❌ Failed to generate transcript.");
    }

    await loadingMsg.delete().catch(() => {});
  });
};

module.exports.commands = [
  {
    name: "transcript",
    description: "Generate a text transcript of recent messages. Usage: `transcript [limit]` (default is 50)",
  }
];