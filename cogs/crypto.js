const fs = require('fs');
const axios = require('axios');
const config = require('../config.json');
const settings = require('../settings.json');
const PREFIX = settings.prefix;

let ltcAddresses = [];
const ltcFile = 'ltc_addresses.json';

function loadLtcAddresses() {
    if (fs.existsSync(ltcFile)) {
        ltcAddresses = JSON.parse(fs.readFileSync(ltcFile));
    }
}

function saveLtcAddresses() {
    fs.writeFileSync(ltcFile, JSON.stringify(ltcAddresses, null, 4));
}

let cachedPrice = null;
let lastPriceFetch = 0;
async function getLtcPrice() {
    const now = Date.now();
    if (cachedPrice && now - lastPriceFetch < 30000) return cachedPrice;

    const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd');
    cachedPrice = priceRes.data.litecoin.usd;
    lastPriceFetch = now;
    return cachedPrice;
}

module.exports = async function cryptoModule(client) {
    loadLtcAddresses();

    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'addltc') {
            const address = args[0];
            if (!address) return message.reply('📌 **Missing argument:** LTC address\n📥 **Usage:** `!addltc <ltc_address>`');
            if (ltcAddresses.includes(address)) return message.reply(`⚠️ **Address already exists:** \`${address}\``);
            ltcAddresses.push(address);
            saveLtcAddresses();
            return message.reply(`✅ **Added LTC address:** \`${address}\``);
        }

        if (command === 'removeltc') {
            const index = parseInt(args[0], 10);
            if (!index || index < 1 || index > ltcAddresses.length) return message.reply('❌ **Invalid index.**');
            const removed = ltcAddresses.splice(index - 1, 1);
            saveLtcAddresses();
            return message.reply(`🗑️ **Removed LTC address:** \`${removed[0]}\``);
        }

        if (command === 'listltc') {
            if (!ltcAddresses.length) return message.reply('🚫 **No LTC addresses saved.**');
            return message.reply('📂 **Saved LTC Addresses:**\n' + ltcAddresses.map((a, i) => `\`${i + 1}.\` \`${a}\``).join('\n'));
        }

        if (command === 'addy') {
            if (!ltcAddresses.length) return message.reply('🚫 **No LTC addresses saved.**');
            message.reply('📋 **Select an address to copy:**\n\n' + ltcAddresses.map((a, i) => `${i + 1}.\ \`${a}\``).join('\n'));

            const filter = m => m.author.id === message.author.id && !isNaN(m.content);
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            if (!collected.size) return message.reply('⏱️ **Timeout. Please try again.**');
            const index = parseInt(collected.first().content) - 1;
            if (index >= 0 && index < ltcAddresses.length) {
                message.reply(`📋 **Click to copy the address:**\n\n\`${ltcAddresses[index]}\``);
            } else {
                message.reply('❌ **Invalid index selected.**');
            }
        }

        if (command === 'bal') {
            const addr = args[0];

            const getBalance = async (address) => {
                try {
                    const [addrRes, price] = await Promise.all([
                        axios.get(`https://api.blockcypher.com/v1/ltc/main/addrs/${address}`),
                        getLtcPrice()
                    ]);

                    const data = addrRes.data;
                    const confirmed = data.balance / 1e8;
                    const unconfirmed = data.unconfirmed_balance / 1e8;
                    const received = data.total_received / 1e8;

                    return `📍 **Balance Details**\n\`\`\`\n${address}\n\`\`\`\n` +
                        `🟡 Confirmed: \`${confirmed} LTC\` — \`$${(confirmed * price).toFixed(2)} USD\`\n` +
                        `🔵 Unconfirmed: \`${unconfirmed} LTC\` — \`$${(unconfirmed * price).toFixed(2)} USD\`\n` +
                        `🟣 Total Received: \`${received} LTC\` — \`$${(received * price).toFixed(2)} USD\``;
                } catch (err) {
                    return `❌ **Error fetching balance for \`${address}\`:** ${err.message}`;
                }
            };

            if (addr) {
                const loading = await message.reply('⏳ **Fetching LTC balance...**');
                return loading.edit(await getBalance(addr));
            }

            if (!ltcAddresses.length) return message.reply('🚫 **No LTC addresses saved and none provided.**');

            message.reply('📂 **Saved LTC Addresses:**\n' + ltcAddresses.map((a, i) => `\`${i + 1}.\` \`${a}\``).join('\n') + '\n\n💬 **Type the number to check its balance.**');
            const filter = m => m.author.id === message.author.id && !isNaN(m.content);
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });
            if (!collected.size) return message.reply('⏰ **Timed out.**');

            const index = parseInt(collected.first().content) - 1;
            if (index >= 0 && index < ltcAddresses.length) {
                const loading = await message.reply('🔄 **Fetching balance...**');
                return loading.edit(await getBalance(ltcAddresses[index]));
            } else {
                return message.reply('❌ **Invalid selection.**');
            }
        }

        if (command === 'send') {
            const amountUsd = parseFloat(args[0]);
            let toAddress = args[1];

            if (!amountUsd) return message.reply('📌 **Missing amount.**\n📥 **Usage:** `!send <amount_usd> <ltc_address>`');

            if (!toAddress && message.reference) {
                try {
                    const refMsg = await message.channel.messages.fetch(message.reference.messageId);
                    const match = refMsg.content.match(/\b((ltc1|L|M)[a-zA-Z0-9]{25,})\b/);
                    if (match) toAddress = match[1];
                } catch {}
            }

            if (!toAddress) return message.reply('⚠️ **Could not determine a valid LTC address.**');

            const loading = await message.reply('📤 **Sending LTC transaction...**');
            try {
                const ltcPrice = await getLtcPrice();
                const amountLtc = +(amountUsd / ltcPrice).toFixed(8);

                const payload = {
                    fromAddress: [
                        {
                            address: config.LTC_FROM_ADDRESS,
                            privateKey: config.LTC_PRIVATE_KEY
                        }
                    ],
                    to: [
                        {
                            address: toAddress,
                            value: amountLtc
                        }
                    ],
                    fee: '0.00005',
                    changeAddress: config.LTC_FROM_ADDRESS
                };

                const res = await axios.post('https://api.tatum.io/v3/litecoin/transaction', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': config.TATUM_API_KEY
                    }
                });

                if (res.status === 200) {
                    const txId = res.data.txId || 'N/A';
                    loading.edit(
                        `✅ **Transaction Sent!**\n\n` +
                        `💰 **Amount:** $${amountUsd.toFixed(2)}  |  \`${amountLtc} LTC\`\n` +
                        `🔗 **TX Hash:** [View](https://live.blockcypher.com/ltc/tx/${txId})\n\n` +
                        `📤 **From:** \`${config.LTC_FROM_ADDRESS}\`\n` +
                        `📥 **To:** \`${toAddress}\`\n\n` +
                        `🕒 *Sent by* \`${message.author.username}\` *at* \`${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST\``
                    );

                } else {
                    loading.edit(`⚠️ **Transaction failed.**\n\`\`\`${res.data}\`\`\``);
                }

            } catch (e) {
                loading.edit(`❌ **Error:** \`${e.message}\``);
            }
        }
    });
};

module.exports.commands = [
  { name: "addltc", description: "Add an LTC address to your list." },
  { name: "removeltc", description: "Remove an LTC address from your list." },
  { name: "listltc", description: "List your saved LTC addresses." },
  { name: "addy", description: "Generate a random Litecoin address (for mock/demo)." },
  { name: "bal", description: "Check balance of an LTC address. Usage: `.bal <address>`" },
  { name: "send", description: "Send LTC. Usage: `.send <amount> <to-address>`" }
];