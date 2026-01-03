const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const { initializeListener, handleMatchReaction } = require('./services/firebaseListener');
const { handleRoleReaction, GAME_ROLES } = require('./commands/roleCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
  console.log('🎯 Dashboard-First Mimari Aktif');
  console.log('📡 Firebase listener başlatılıyor...');
  
  initializeListener(client);
  
  console.log('🚀 Bot hazır ve Firebase dinleniyor!');
});

// Sadece emoji reaction'ları dinle
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('❌ Reaction fetch hatası:', error);
      return;
    }
  }
  
  // Rol sistemi
  if (GAME_ROLES[reaction.emoji.name]) {
    await handleRoleReaction(reaction, user, true);
    return;
  }
  
  // Maç katılım sistemi
  if (reaction.emoji.name === '🎯') {
    await handleMatchReaction(reaction, user, true);
    return;
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('❌ Reaction fetch hatası:', error);
      return;
    }
  }
  
  // Rol sistemi
  if (GAME_ROLES[reaction.emoji.name]) {
    await handleRoleReaction(reaction, user, false);
    return;
  }
  
  // Maç katılım sistemi
  if (reaction.emoji.name === '🎯') {
    await handleMatchReaction(reaction, user, false);
    return;
  }
});

// Hata yakalama
client.on('error', error => {
  console.error('❌ Discord client hatası:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);
