const { db } = require('./firebaseAdmin');
const { EmbedBuilder } = require('discord.js');

let client = null;

function initializeListener(discordClient) {
  client = discordClient;
  console.log('🔥 Firebase listener başlatıldı...');

  // Yeni maç oluşturulduğunda dinle
  db.collection('matches')
    .where('status', '==', 'scheduled')
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const match = { id: change.doc.id, ...change.doc.data() };
          await notifyDiscord(match);
        }
      });
    });

  // Maç sonucu güncellendiğinde dinle
  db.collection('matches')
    .where('status', '==', 'completed')
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'modified') {
          const match = { id: change.doc.id, ...change.doc.data() };
          await notifyMatchResult(match);
        }
      });
    });
}

async function notifyDiscord(match) {
  try {
    const guild = client.guilds.cache.first();
    const channel = guild.channels.cache.find(ch => ch.name === 'content-etkinlik-duyuru') 
                    || guild.channels.cache.find(ch => ch.name === 'sohbet');

    if (!channel) {
      console.error('❌ Bildirim kanalı bulunamadı');
      return;
    }

    const embed = createMatchEmbed(match);
    const msg = await channel.send({ embeds: [embed] });

    // MessageId'yi Firebase'e kaydet
    await db.collection('matches').doc(match.id).update({
      discordMessageId: msg.id
    });

    console.log(`✅ Maç bildirimi gönderildi: ${match.id}`);
  } catch (error) {
    console.error('❌ Discord bildirimi hatası:', error);
  }
}

async function notifyMatchResult(match) {
  try {
    const guild = client.guilds.cache.first();
    const channel = guild.channels.cache.find(ch => ch.name === 'sohbet');

    if (!channel) return;

    const winnerText = match.winner === 'blue' ? '🔵 Mavi Takım' : '🔴 Kırmızı Takım';
    const gameText = match.game === 'lol' ? '🎮 LoL' : '♟️ TFT';

    await channel.send(`🎉 **Maç Sonucu** ${gameText}\n${winnerText} kazandı!`);

    console.log(`✅ Maç sonucu bildirildi: ${match.id}`);
  } catch (error) {
    console.error('❌ Maç sonucu bildirimi hatası:', error);
  }
}

function createMatchEmbed(match) {
  const gameEmoji = match.game === 'lol' ? '🎮' : '♟️';
  const gameText = match.game === 'lol' ? 'League of Legends' : 'Teamfight Tactics';
  
  const scheduledTime = match.scheduledTime?.toDate ? match.scheduledTime.toDate() : new Date(match.scheduledTime);
  const timeText = scheduledTime.toLocaleString('tr-TR');

  const embed = new EmbedBuilder()
    .setTitle(`${gameEmoji} **YENİ MAÇ OLUŞTURULDU** ${gameEmoji}`)
    .setDescription(`**${gameText}** maçı başlıyor!`)
    .addFields(
      { name: '🎯 Mod', value: match.gameMode || 'Belirtilmemiş', inline: true },
      { name: '👥 Takım', value: match.teamMode === 'random' ? 'Rastgele' : 'Kaptanlı', inline: true },
      { name: '⏰ Zaman', value: timeText, inline: true },
      { name: '👥 Oyuncular', value: match.players?.join(', ') || 'Henüz yok', inline: false }
    )
    .setColor(match.game === 'lol' ? '#C89B3C' : '#463714')
    .setFooter({ text: `Match ID: ${match.id}` })
    .setTimestamp();

  return embed;
}

module.exports = { initializeListener };
