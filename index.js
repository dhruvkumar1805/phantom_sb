const { Client } = require("discord.js-selfbot-v13");
const fs = require("fs");
const path = require("path");

const config = require("./config.json");
const settings = require("./settings.json");
const prefix = settings.prefix || ".";

// Create selfbot client
const client = new Client();

// Event: ready
client.on("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Load "cogs" (commands)
const initialExtensions = [
  'help',
  'utility',
  'autoresponder',
  'crypto',
  'vouch',
  'fun',
  'nsfw',
  'goldmm',
  'transcripts',
  'settings'
];

for (const ext of initialExtensions) {
  try {
    const cog = require(`./cogs/${ext}.js`);
    if (typeof cog === "function") cog(client, prefix);
    console.log(`📦 Loaded cog: ${ext}`);
  } catch (err) {
    console.error(`❌ Failed to load ${ext}:`, err);
  }
}

// Login
client.login(config.TOKEN);
