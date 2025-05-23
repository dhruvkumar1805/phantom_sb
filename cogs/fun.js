const { Client } = require('discord.js-selfbot-v13');

module.exports = async function funModule(client) {
    const PREFIX = require('../settings.json').prefix;

    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // 🪙 Coin Flip
        if (command === 'coinflip') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            message.reply(`🪙 The coin landed on **${result}**!`);
        }

        // 🎲 Dice Roll
        if (command === 'roll') {
            const result = Math.floor(Math.random() * 6) + 1;
            message.reply(`🎲 You rolled a **${result}**!`);
        }

        // 🎱 Magic 8-Ball
        if (command === 'eightball') {
            const question = args.join(' ');
            if (!question) return message.reply('❓ Please ask a yes/no question.');
            const responses = [
                'Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not',
                'Ask again later', 'Sure', "I don't think so", 'It is certain'
            ];
            const answer = responses[Math.floor(Math.random() * responses.length)];
            message.reply(`🎱 **Q:** ${question}\n🎯 **A:** ${answer}`);
        }

        // 🗯️ Say
        if (command === 'say') {
            const text = args.join(' ');
            if (!text) return message.reply('❌ You need to provide text to say.');
            message.reply(text);
        }

        // 🔁 Reverse Text
        if (command === 'reverse') {
            const text = args.join(' ');
            if (!text) return message.reply('❌ You need to provide text to reverse.');
            const reversed = text.split('').reverse().join('');
            message.reply(`🔁 ${reversed}`);
        }
    });
};

module.exports.commands = [
    { name: "coinflip", description: "Flip a coin and get Heads or Tails." },
    { name: "roll", description: "Roll a six-sided dice." },
    { name: "eightball", description: "Ask the magic 8-ball a yes/no question." },
    { name: "say", description: "Make the bot say something." },
    { name: "reverse", description: "Reverse a piece of text." }
];