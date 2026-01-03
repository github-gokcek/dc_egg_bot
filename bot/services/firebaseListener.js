const admin = require('firebase-admin');
const { EmbedBuilder } = require('discord.js');
const { db } = require('./firebaseAdmin');

let client = null;
const activeMatches = new Map();
let isInitialLoad = true;

function initializeListener(discordClient) {
  client = discordClient;
  console.log('🔥 Firebase listener başlatılıyor...');
  console.log('📊 Collection: matches');
  console.log('🔍 Filter: status == "scheduled"');
  console.log('');

  db.collection('matches')
    .where('status', '==', 'scheduled')
    .onSnapshot((snapshot) => {
      console.log(`📡 Snapshot alındı! (${new Date().toLocaleTimeString()})`);
      console.log(`📊 Toplam döküman: ${snapshot.size}`);
      
      snapshot.docChanges().forEach(async change => {
        console.log(`🔔 Değişiklik: ${change.type} - Doc ID: ${change.doc.id.slice(0, 8)}...`);
        
        if (change.type === 'added') {
          const match = { id: change.doc.id, ...change.doc.data() };
          console.log(`✅ YENİ MAÇ ALGILANDI: ${match.game.toUpperCase()}`);
          
          // İlk yüklemede DM gönderme
          if (isInitialLoad) {
            console.log('⚠️ İlk yükleme - DM gönderilmeyecek');
            await notifyMatch(match, true); // skipDM = true
          } else {
            await notifyMatch(match, false); // skipDM = false
          }
          
          await logAction('match_created', null, null, match.id, { game: match.game, mode: match.gameMode });
        }
        if (change.type === 'modified') {
          const match = { id: change.doc.id, ...change.doc.data() };
          console.log(`🔄 MAÇ GÜNCELLENDI: ${match.id.slice(0, 8)}...`);
          await updateMatchMessage(match);
        }
      });
      
      // İlk yükleme tamamlandı
      if (isInitialLoad) {
        isInitialLoad = false;
        console.log('✅ İlk yükleme tamamlandı. Yeni maçlar için DM gönderimi aktif.');
      }
    }, error => {
      console.error('❌ Firebase listener hatası:', error);
    });
  
  console.log('✅ Firebase listener aktif!');
  console.log('👂 Yeni maçlar bekleniyor...\n');
}

async function notifyMatch(match, skipDM = false) {
  try {
    // LeagueId yoksa ekle
    if (!match.leagueId) {
      const leagueId = match.game === 'lol' ? 'Egg_Bot_LoL' : 'Egg_Bot_TFT';
      await db.collection('matches').doc(match.id).update({
        leagueId: leagueId
      });
      match.leagueId = leagueId;
    }
    const guild = client.guilds.cache.first();
    const etkinlikChannel = guild.channels.cache.find(ch => ch.name === 'content-etkinlik-duyuru');
    const sohbetChannel = guild.channels.cache.find(ch => ch.name === 'sohbet');

    if (!etkinlikChannel) {
      console.error('❌ Etkinlik kanalı bulunamadı');
      return;
    }

    // Embed oluştur
    const embed = createMatchEmbed(match);
    const msg = await etkinlikChannel.send({ embeds: [embed] });

    // Emoji ekle (sadece oyuncular hazır değilse)
    if (!match.playersReady) {
      await msg.react('🎯');
    }

    // Match'i kaydet
    activeMatches.set(match.id, {
      messageId: msg.id,
      channelId: etkinlikChannel.id,
      match: match,
      participants: match.participants || []
    });

    // Firebase'e messageId kaydet
    const matchRef = db.collection('matches').doc(match.id);
    await matchRef.update({
      discordMessageId: msg.id,
      discordChannelId: etkinlikChannel.id
    });

    // DM gönder (sadece oyuncular hazır değilse ve skipDM false ise)
    if (!match.playersReady && !skipDM) {
      const roleName = match.game === 'lol' ? 'LoL' : 'TFT';
      const role = guild.roles.cache.find(r => r.name === roleName);
      
      if (role) {
        console.log(`📧 ${role.members.size} kişiye DM gönderiliyor...`);
        const dmEmbed = createDMEmbed(match);
        let sentCount = 0;
        
        for (const [userId, member] of role.members) {
          try {
            await member.send({ embeds: [dmEmbed] });
            sentCount++;
          } catch (error) {
            console.log(`❌ DM gönderilemedi: ${member.user.username}`);
          }
        }
        
        console.log(`✅ ${sentCount}/${role.members.size} kişiye DM gönderildi`);
        
        // Discord log ekle
        await db.collection('logs').add({
          action: 'Discord Bildirimi',
          details: `${sentCount} kişiye ${roleName} maç bildirimi gönderildi`,
          source: 'discord',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } else if (skipDM) {
      console.log('ℹ️ Bot başlangıcı - DM gönderilmedi');
    } else {
      console.log('ℹ️ Oyuncular hazır, DM gönderilmedi');
    }

    // Sohbet kanalına bildir ve rol etiketle
    if (sohbetChannel) {
      const maxPlayers = match.maxPlayers || (match.game === 'lol' ? 10 : 8);
      const currentCount = match.participants?.length || 0;
      const gameText = match.game === 'lol' ? 'LoL' : 'TFT';
      const modeText = match.gameMode ? ` (${match.gameMode.toUpperCase()})` : '';
      const roleName = match.game === 'lol' ? 'LoL' : 'TFT';
      const role = guild.roles.cache.find(r => r.name === roleName);
      const roleMention = role ? `<@&${role.id}>` : `@${roleName}`;
      
      if (match.playersReady) {
        await sohbetChannel.send(`${roleMention} 🎮 **Yeni ${gameText}${modeText} maçı oluşturuldu!** Oyuncular hazır, oyun başlayabilir! (${currentCount}/${maxPlayers})`);
      } else {
        await sohbetChannel.send(`${roleMention} 🎮 **Yeni ${gameText}${modeText} maçı oluşturuldu!** Katılmak için 🎯 emojisine tıklayın. (${currentCount}/${maxPlayers})`);
      }
    }

    console.log(`✅ Maç bildirimi gönderildi: ${match.id}`);
  } catch (error) {
    console.error('❌ Maç bildirimi hatası:', error);
  }
}

async function updateMatchMessage(match) {
  const matchData = activeMatches.get(match.id);
  if (!matchData) return;

  try {
    const guild = client.guilds.cache.first();
    const channel = guild.channels.cache.get(matchData.channelId);
    const message = await channel.messages.fetch(matchData.messageId);

    const embed = createMatchEmbed(match);
    await message.edit({ embeds: [embed] });

    console.log(`✅ Maç mesajı güncellendi: ${match.id}`);
  } catch (error) {
    console.error('❌ Maç güncelleme hatası:', error);
  }
}

function createMatchEmbed(match) {
  const gameEmoji = match.game === 'lol' ? '🎮' : '♟️';
  const gameText = match.game === 'lol' ? 'League of Legends' : 'Teamfight Tactics';
  const maxPlayers = match.maxPlayers || (match.game === 'lol' ? 10 : 8);
  
  const participantsList = match.participants?.length > 0 
    ? match.participants.join('\n') 
    : (match.playersReady ? 'Oyuncular dashboard\'dan belirlendi' : 'Henüz kimse katılmadı');

  const fields = [
    { name: '🎯 Mod', value: match.gameMode || (match.game === 'tft' ? 'TFT' : 'Belirtilmemiş'), inline: true },
    { name: '👥 Takım', value: match.teamMode === 'random' ? 'Rastgele' : 'Kaptanlı', inline: true },
    { name: '⏰ Zaman', value: match.timing === 'now' ? 'Şimdi' : formatScheduledTime(match.scheduledTime), inline: true }
  ];

  // Kaptanlar varsa göster
  if (match.blueCaptain && match.redCaptain) {
    fields.push({ name: '👑 Kaptanlar', value: `🔵 ${match.blueCaptain}\n🔴 ${match.redCaptain}`, inline: false });
  }

  // Katılımcılar
  fields.push({ name: `👥 Katılımcılar (${match.participants?.length || 0}/${maxPlayers})`, value: participantsList, inline: false });

  const embed = new EmbedBuilder()
    .setTitle(`${gameEmoji} **YENİ MAÇ** ${gameEmoji}`)
    .setDescription(`**${gameText}** maçı başlıyor!`)
    .addFields(fields)
    .setColor(match.game === 'lol' ? '#C89B3C' : '#463714')
    .setFooter({ text: `Match ID: ${match.id.slice(0, 8)}${!match.playersReady ? ' | 🎯 Katılmak için tıkla' : ''}` })
    .setTimestamp();

  return embed;
}

function formatScheduledTime(timestamp) {
  if (!timestamp) return 'İleri Tarih';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function createDMEmbed(match) {
  const gameText = match.game === 'lol' ? 'League of Legends' : 'Teamfight Tactics';
  const modeText = match.gameMode ? ` (${match.gameMode.toUpperCase()})` : '';
  
  return new EmbedBuilder()
    .setTitle('🎮 **YENİ MAÇ OLUŞTURULDU** 🎮')
    .setDescription(`**${gameText}${modeText}** maçı başlıyor!\n\n✅ Katılmak için sunucudaki **#content-etkinlik-duyuru** kanalına git\n🎯 Mesajdaki emoji'ye tıkla!`)
    .addFields(
      { name: '🎯 Mod', value: match.gameMode || 'Belirtilmemiş', inline: true },
      { name: '👥 Takım', value: match.teamMode === 'random' ? 'Rastgele' : 'Kaptanlı', inline: true },
      { name: '⏰ Zaman', value: match.timing === 'now' ? 'Şimdi' : 'İleri Tarih', inline: true }
    )
    .setColor('#00ff00')
    .setFooter({ text: 'Hızlıca katıl ve oyunu kaçırma!' })
    .setTimestamp();
}

// Emoji reaction handler
async function handleMatchReaction(reaction, user, isAdd) {
  if (user.bot) return;
  if (reaction.emoji.name !== '🎯') return;

  const matchData = Array.from(activeMatches.values()).find(m => m.messageId === reaction.message.id);
  if (!matchData) return;

  const match = matchData.match;
  
  // Oyuncular hazırsa emoji ile katılım kapalı
  if (match.playersReady) {
    return;
  }

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);
  const maxPlayers = match.maxPlayers || (match.game === 'lol' ? 10 : 8);
  const roleName = match.game === 'lol' ? 'LoL' : 'TFT';
  const role = guild.roles.cache.find(r => r.name === roleName);

  try {
    if (isAdd) {
      // Rol yoksa ver
      if (role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role);
        await logAction('role_assigned', user.id, user.username, null, { role: roleName });
        console.log(`✅ ${user.username} kullanıcısına ${roleName} rolü verildi`);
      }

      // Lig kaydı yap - Güncellenmiş sistem
      console.log(`🔍 ${user.username} için oyuncu kaydı kontrol ediliyor...`);
      const playerRef = db.collection('players').doc(user.id);
      const playerDoc = await playerRef.get();
      const leagueId = match.game === 'lol' ? 'Egg_Bot_LoL' : 'Egg_Bot_TFT';
      
      if (!playerDoc.exists) {
        console.log(`➕ Yeni oyuncu oluşturuluyor: ${user.username}`);
        // Yeni oyuncu oluştur
        await playerRef.set({
          id: user.id,
          username: user.username,
          discordTag: `@${user.username}`,
          leagues: [leagueId],
          lolStats: {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            roles: {
              top: { games: 0, wins: 0 },
              jungle: { games: 0, wins: 0 },
              mid: { games: 0, wins: 0 },
              adc: { games: 0, wins: 0 },
              support: { games: 0, wins: 0 }
            },
            champions: {}
          },
          tftStats: {
            gamesPlayed: 0,
            placements: {
              first: 0, second: 0, third: 0, fourth: 0,
              fifth: 0, sixth: 0, seventh: 0, eighth: 0
            },
            averagePlacement: 0,
            compositions: {}
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ ${user.username} players collection'a kaydedildi (ID: ${user.id})`);
        
        // Log kaydet
        await logAction('player_registered', user.id, user.username, null, { leagueId });
      } else {
        console.log(`👤 Oyuncu mevcut: ${user.username}`);
        // Lige ekle (yoksa)
        const leagues = playerDoc.data().leagues || [];
        if (!leagues.includes(leagueId)) {
          console.log(`➕ ${leagueId} ligine ekleniyor...`);
          await playerRef.update({
            leagues: admin.firestore.FieldValue.arrayUnion(leagueId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`✅ ${user.username} ${leagueId} ligine eklendi`);
        } else {
          console.log(`ℹ️ ${user.username} zaten ${leagueId} liginde`);
        }
      }

      // Oyuncuyu ekle
      if (!matchData.participants.includes(user.username) && matchData.participants.length < maxPlayers) {
        matchData.participants.push(user.username);
        
        // Firebase güncelle
        const matchRef = db.collection('matches').doc(match.id);
        await matchRef.update({
          participants: admin.firestore.FieldValue.arrayUnion(user.username),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await logAction('player_joined', user.id, user.username, match.id, { game: match.game });

        // Embed güncelle
        const embed = createMatchEmbed({ ...match, participants: matchData.participants });
        await reaction.message.edit({ embeds: [embed] });

        // Sohbet kanalına bildir
        const sohbetChannel = guild.channels.cache.find(ch => ch.name === 'sohbet');
        if (sohbetChannel) {
          const gameText = match.game === 'lol' ? 'LoL' : 'TFT';
          const count = matchData.participants.length;
          
          if (count === maxPlayers) {
            await sohbetChannel.send(`🎉 **${gameText} lobisi doldu!** (${count}/${maxPlayers}) ✅ Oyun başlayabilir!`);
          } else {
            await sohbetChannel.send(`🎮 **${gameText} lobisi ${count}/${maxPlayers} oldu**`);
          }
        }

        // DM gönder
        try {
          await member.send(`✅ **${match.game.toUpperCase()} maçına katıldınız!** (${matchData.participants.length}/${maxPlayers})`);
        } catch (error) {
          console.log(`❌ DM gönderilemedi: ${user.username}`);
        }
      }
    } else {
      // Oyuncuyu çıkar
      const index = matchData.participants.indexOf(user.username);
      if (index > -1) {
        matchData.participants.splice(index, 1);
        
        // Firebase güncelle
        const matchRef = db.collection('matches').doc(match.id);
        await matchRef.update({
          participants: admin.firestore.FieldValue.arrayRemove(user.username),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await logAction('player_left', user.id, user.username, match.id, { game: match.game });

        // Embed güncelle
        const embed = createMatchEmbed({ ...match, participants: matchData.participants });
        await reaction.message.edit({ embeds: [embed] });

        // Sohbet kanalına bildir
        const sohbetChannel = guild.channels.cache.find(ch => ch.name === 'sohbet');
        if (sohbetChannel) {
          const gameText = match.game === 'lol' ? 'LoL' : 'TFT';
          await sohbetChannel.send(`⚠️ **${user.username}** ${gameText} lobisinden ayrıldı (${matchData.participants.length}/${maxPlayers})`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Reaction handler hatası:', error);
    console.error('Hata detayı:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Log fonksiyonu
async function logAction(action, userId, username, matchId, details) {
  try {
    await db.collection('logs').add({
      action,
      userId,
      username,
      matchId,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('❌ Log kaydetme hatası:', error);
  }
}

module.exports = { initializeListener, activeMatches, handleMatchReaction };
