const axios = require('axios');
const { Client } = require('discord.js-selfbot-v13');

module.exports = async function nsfwModule(client) {
    const PREFIX = require('../settings.json').prefix;

    const fetchImage = async (type) => {
        try {
            const res = await axios.get(`https://nekobot.xyz/api/image?type=${type}`);
            return res.data.message;
        } catch (err) {
            console.error(`❌ Error fetching ${type}:`, err.message);
            return null;
        }
    };

    const commands = {
        hentai: 'Hentai',
        thigh: 'Thigh',
        pussy: 'Pussy',
        anal: 'Anal',
        paizuri: 'Paizuri',
        boobs: 'Boobs',
        ass: 'Ass',
        tentacle: 'Tentacle',
        yaoi: 'Yaoi',
        hanal: 'Hanal',
        hboobs: 'Hentai Boobs',
        hthigh: 'Hentai Thigh',
        gah: 'Gah',
        pgif: 'Porn GIF',
    };

    client.on('messageCreate', async (message) => {
        if (message.author.id !== client.user.id || !message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (commands[cmd]) {
            const imageUrl = await fetchImage(cmd);
            if (imageUrl) {
                await message.reply(imageUrl);
            } else {
                await message.reply(`❌ Failed to fetch ${commands[cmd]} image.`);
            }
        }
    });
};

module.exports.commands = [
    { name: "hentai", description: "Send a hentai image." },
    { name: "thigh", description: "Send a thigh image." },
    { name: "pussy", description: "Send a pussy image." },
    { name: "anal", description: "Send an anal image." },
    { name: "paizuri", description: "Send a paizuri image." },
    { name: "boobs", description: "Send a boobs image." },
    { name: "ass", description: "Send an ass image." },
    { name: "tentacle", description: "Send a tentacle image." },
    { name: "yaoi", description: "Send a yaoi image." },
    { name: "hanal", description: "Send a hanal image." },
    { name: "hboobs", description: "Send a hentai boobs image." },
    { name: "hthigh", description: "Send a hentai thigh image." },
    { name: "gah", description: "Send a gah image." },
    { name: "pgif", description: "Send a porn gif." }
];