const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const { MessageAttachment } = require('discord.js-selfbot-v13');

let upiList = [];

const loadUPIList = () => {
  if (fs.existsSync('upi_addresses.json')) {
    upiList = JSON.parse(fs.readFileSync('upi_addresses.json', 'utf-8'));
  }
};

const saveUPIList = () => {
  fs.writeFileSync('upi_addresses.json', JSON.stringify(upiList, null, 4));
};

module.exports = (client, prefix) => {
  loadUPIList();

  client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    switch (cmd) {
      case 'ping': {
        const msg = await message.channel.send('Pinging...');
        msg.edit(`🏓 Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms`);
        break;
      }

      case 'addupi': {
        const upi = args[0];
        if (!upi) return message.channel.send('🚫 Missing argument: upi\nUsage: `.addupi <upi_address>`');
        if (upiList.includes(upi)) return message.channel.send(`❌ The UPI address \`${upi}\` is already in the list.`);
        upiList.push(upi);
        saveUPIList();
        message.channel.send(`✅ UPI address \`${upi}\` added successfully.`);
        break;
      }

      case 'listupi': {
        if (upiList.length === 0) return message.channel.send('❌ No UPI addresses have been added yet.');
        const msg = upiList.map(u => `• \`${u}\``).join('\n');
        message.channel.send(`**💳 Stored UPI Addresses:**\n${msg}`);
        break;
      }

      case 'removeupi': {
        const index = parseInt(args[0], 10);
        if (isNaN(index) || index < 1 || index > upiList.length) {
          return message.channel.send(`❌ Invalid index. Choose between 1 and ${upiList.length}.`);
        }
        const removed = upiList.splice(index - 1, 1);
        saveUPIList();
        message.channel.send(`✅ Removed UPI address \`${removed}\`.`);
        break;
      }

      case 'qr': {
        if (upiList.length === 0) return message.channel.send('❌ No UPI addresses available. Add some using `.addupi`.');

        const upiText = upiList.map((u, i) => `${i + 1}. \`${u}\``).join('\n');
        await message.channel.send(`**💳 Select a UPI address to generate a QR code:**\n${upiText}`);

        const filter = m => m.author.id === message.author.id && /^\d+$/.test(m.content);
        try {
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
          const choice = parseInt(collected.first().content, 10) - 1;
          if (choice < 0 || choice >= upiList.length) return message.channel.send('❌ Invalid index selected.');

          const upi = upiList[choice];
          const upiUrl = `upi://pay?pa=${upi}&tn=I%20authorized%20this%20payment%20and%20received%20my%20products.&cu=INR`;
          const qrBuffer = await qrcode.toBuffer(upiUrl);
          const file = new MessageAttachment(qrBuffer, 'upi_qr.png');
          await message.channel.send({ files: [file] });
        } catch {
          message.channel.send('❌ Timeout or invalid input. Please try again.');
        }
        break;
      }

      case 'calc': {
        const expression = args.join(' ');
        if (!expression) return message.channel.send('🚫 Missing expression.\nUsage: `.calc <expression>`');
        try {
          const result = eval(expression);
          if (typeof result === 'number') {
            message.channel.send(`✅ Result of \`${expression}\` is \`${result}\``);
          } else {
            message.channel.send('❌ Result is not a number.');
          }
        } catch {
          message.channel.send('❌ Invalid expression.');
        }
        break;
      }

      case 'purge': {
        const amount = parseInt(args[0], 10);
        if (!amount || amount <= 0) return message.channel.send('❌ Usage: `.purge <positive_number>`');
        try {
          const messages = await message.channel.messages.fetch({ limit: amount });
          const deletions = messages.filter(m => m.author.id === client.user.id);
          await Promise.all(deletions.map(m => m.delete()));
          message.channel.send(`✅ Deleted ${deletions.size} messages.`).then(m => setTimeout(() => m.delete(), 5000));
        } catch (e) {
          message.channel.send(`❌ Error: ${e.message}`);
        }
        break;
      }

      case 'mathfact': {
        const num = parseInt(args[0], 10);
        if (!num || num < 1) return message.channel.send('❌ Provide a positive number. Usage: `.mathfact <number>`');
        try {
          let fact = 1n;
          for (let i = 2n; i <= BigInt(num); i++) fact *= i;
          message.channel.send(`🧠 Fun fact: ${num}! = ${fact.toString()}`);
        } catch (e) {
          message.channel.send(`❌ Error: ${e.message}`);
        }
        break;
      }

      case 'fact': {
        const facts = [
          "Honey never spoils.",
          "Bananas are berries, but strawberries aren't.",
          "Octopuses have three hearts.",
          "A group of flamingos is called a flamboyance.",
          "There are more stars in the universe than grains of sand on Earth."
        ];
        message.channel.send(`💡 ${facts[Math.floor(Math.random() * facts.length)]}`);
        break;
      }

    }
  });
};

module.exports.commands = [
  { name: "ping", description: "Check bot latency." },
  { name: "addupi", description: "Add a UPI address to the list." },
  { name: "listupi", description: "List all stored UPI addresses." },
  { name: "removeupi", description: "Remove a UPI address by index." },
  { name: "qr", description: "Generate a QR code for a UPI address." },
  { name: "calc", description: "Evaluate a math expression." },
  { name: "purge", description: "Delete a number of your own messages." },
  { name: "mathfact", description: "Calculate the factorial of a number." },
  { name: "fact", description: "Send a random fun fact." }
];