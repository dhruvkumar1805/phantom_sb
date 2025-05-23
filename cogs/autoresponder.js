const fs = require("fs");
const path = require("path");

module.exports = (client, prefix) => {
  const responsesFile = path.join(__dirname, "../autoresponses.json");

  let responses = {};
  if (fs.existsSync(responsesFile)) {
    responses = JSON.parse(fs.readFileSync(responsesFile));
  }

  const saveResponses = () => {
    fs.writeFileSync(responsesFile, JSON.stringify(responses, null, 4));
  };

  client.on("messageCreate", async (message) => {
    if (message.author.id !== client.user.id) return;

    for (const [trigger, response] of Object.entries(responses)) {
      if (message.content.includes(trigger)) {
        await message.channel.send(response);
        break;
      }
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();

    // .ar <trigger> <response>
    if (command === "ar") {
      const trigger = args.shift();
      const response = args.join(" ");
      if (!trigger || !response) {
        return message.channel.send("🚫 Usage: `.ar <trigger> <response>`");
      }
      responses[trigger] = response;
      saveResponses();
      return message.channel.send(`✅ Auto-response set for \`${trigger}\`.`);
    }

    // .listar
    if (command === "listar") {
      const entries = Object.entries(responses);
      if (!entries.length) {
        return message.channel.send("❌ No auto responses set.");
      }
      const lines = entries.map(([k, v]) => `• \`${k}\` → \`${v}\``).join("\n");
      return message.channel.send(`📄 **Auto Responses:**\n${lines}`);
    }

    // .removear <trigger>
    if (command === "removear") {
      const trigger = args[0];
      if (!trigger) {
        return message.channel.send("🚫 Usage: `.removear <trigger>`");
      }
      if (responses[trigger]) {
        delete responses[trigger];
        saveResponses();
        return message.channel.send(`✅ Removed auto-response for \`${trigger}\`.`);
      } else {
        return message.channel.send("❌ No such trigger found.");
      }
    }

    // .deleteallar
    if (command === "deleteallar") {
      responses = {};
      saveResponses();
      return message.channel.send("🗑️ All auto responses have been cleared.");
    }
  });
};

module.exports.commands = [
  { name: "ar", description: "Add an auto-response. Usage: `.ar <trigger> <response>`" },
  { name: "listar", description: "List all auto-responses." },
  { name: "removear", description: "Remove an auto-response. Usage: `.removear <trigger>`" },
  { name: "deleteallar", description: "Delete all auto-responses." }
];