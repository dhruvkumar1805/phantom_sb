const fs = require('fs');
const path = require('path');

module.exports = async function settingsModule(client) {
    const settingsPath = path.join(__dirname, '../settings.json');
    let settings = { prefix: '.' };

    if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    const saveSettings = () => {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
    };

    client.on('messageCreate', async (message) => {
        if (message.author.id !== client.user.id) return;
        if (!message.content.startsWith(settings.prefix)) return;

        const args = message.content.slice(settings.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'prefix') {
            await message.reply(`🔧 Current prefix: \`${settings.prefix}\``);
        }

        if (command === 'setprefix') {
            const newPrefix = args[0];
            if (!newPrefix) return message.reply('🚫 Usage: `setprefix <new_prefix>`');
            settings.prefix = newPrefix;
            saveSettings();
            await message.reply(`✅ Prefix updated to \`${newPrefix}\`\nℹ️ Please restart the bot manually for changes to apply.`);
        }

    });
};

module.exports.commands = [
    { name: "prefix", description: "Show the current command prefix." },
    { name: "setprefix", description: "Change the command prefix. Usage: `setprefix <new_prefix>`" }
];