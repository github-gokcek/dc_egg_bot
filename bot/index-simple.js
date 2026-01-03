const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('clientReady', () => {
  console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
  console.log('🎮 Dashboard: http://localhost:5173');
  console.log('📊 Tüm işlemler dashboard üzerinden yapılıyor!');
  
  // Firebase listener başlat
  try {
    const { initializeListener } = require('./services/firebaseListener');
    initializeListener(client);
    console.log('🔥 Firebase bağlantısı kuruldu!');
  } catch (error) {
    console.error('❌ Firebase bağlantı hatası:', error.message);
  }
});

// Emoji ile katılım sistemi
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      return;
    }
  }
  
  if (reaction.emoji.name === '🎯') {
    const { handleMatchReaction } = require('./services/firebaseListener');
    await handleMatchReaction(reaction, user, true);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      return;
    }
  }
  
  if (reaction.emoji.name === '🎯') {
    const { handleMatchReaction } = require('./services/firebaseListener');
    await handleMatchReaction(reaction, user, false);
  }
});

// Minimal komutlar
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('🏓 Pong! Bot aktif.');
    return;
  }

  if (message.content === '!yardım' || message.content === '!help') {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Bot Komutları')
      .setDescription('Tüm işlemler artık **Admin Dashboard** üzerinden yapılıyor!')
      .addFields(
        { name: '!ping', value: 'Bot durumunu kontrol et', inline: false },
        { name: '!yardım', value: 'Bu yardım mesajını göster', inline: false },
        { name: '📊 Dashboard', value: 'http://localhost:5173\nMaç oluşturma, lig yönetimi ve daha fazlası için admin panelini kullanın.', inline: false }
      )
      .setColor('#667eea')
      .setFooter({ text: 'Admin Dashboard ile yönetilen bot' });
    
    message.reply({ embeds: [embed] });
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
