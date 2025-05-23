module.exports = (client, prefix) => {
  client.on("messageCreate", async (message) => {
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();

    // .i2c <amount> <crypto>
    if (command === "i2c") {
      const amount = parseFloat(args[0]);
      const crypto = args[1]?.toUpperCase();

      if (isNaN(amount) || !crypto) {
        return message.channel.send("🚫 Usage: `.i2c <amount> <crypto>`");
      }

      const vouchMsg = `+rep ${message.author.id} LEGIT EXCHANGE • [${amount}₹] UPI TO ${crypto}`;
      await message.channel.send(vouchMsg);
    }

    // .c2i <amount> <crypto>
    if (command === "c2i") {
      const amount = parseFloat(args[0]);
      const crypto = args[1]?.toUpperCase();

      if (isNaN(amount) || !crypto) {
        return message.channel.send("🚫 Usage: `.c2i <amount> <crypto>`");
      }

      const vouchMsg = `+rep ${message.author.id} LEGIT EXCHANGE • [${amount}$] ${crypto} TO UPI`;
      await message.channel.send(vouchMsg);
    }
  });
};

module.exports.commands = [
  {
    name: "i2c",
    description: "Format vouch for INR to Crypto. Usage: `.i2c <amount> <crypto>`"
  },
  {
    name: "c2i",
    description: "Format vouch for Crypto to INR. Usage: `.c2i <amount> <crypto>`"
  }
];