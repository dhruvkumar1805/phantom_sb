const { Client } = require('discord.js-selfbot-v13');

module.exports = async function goldMMModule(client) {
    const PREFIX = require('../settings.json').prefix;

    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const username = message.author.username;

        // ✅ Mark deal as done
        if (command === 'done') {
            await message.reply(`$rename done by ${username}`);
        }

        // ❌ Mark deal as cancelled
        if (command === 'cancel') {
            await message.reply(`$rename cancelled by ${username}`);
        }
    });
};

module.exports.commands = [
    { name: "done", description: "Mark a deal as done. Usage: `.done`" },
    { name: "cancel", description: "Mark a deal as cancelled. Usage: `.cancel`" }
];