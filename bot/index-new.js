const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', () => {
  console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
  
  // Firebase listener'ı başlat
  try {
    const { initializeListener } = require('./services/firebaseListener');
    initializeListener(client);
    console.log('🔥 Firebase bağlantısı kuruldu!');
  } catch (error) {
    console.error('❌ Firebase bağlantı hatası:', error.message);
    console.log('⚠️ Firebase olmadan devam ediliyor...');
  }
});

// Minimal komutlar
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Ping komutu
  if (message.content === '!ping') {
    message.reply('🏓 Pong! Bot aktif.');
    return;
  }

  // Yardım komutu
  if (message.content === '!yardım' || message.content === '!help') {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Bot Komutları')
      .setDescription('Tüm işlemler artık **Admin Dashboard** üzerinden yapılıyor!')
      .addFields(
        { name: '!ping', value: 'Bot durumunu kontrol et', inline: false },
        { name: '!yardım', value: 'Bu yardım mesajını göster', inline: false },
        { name: '📊 Dashboard', value: 'Maç oluşturma, lig yönetimi ve daha fazlası için admin panelini kullanın.', inline: false }
      )
      .setColor('#667eea')
      .setFooter({ text: 'Admin Dashboard ile yönetilen bot' });
    
    message.reply({ embeds: [embed] });
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
