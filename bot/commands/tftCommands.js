const { EmbedBuilder } = require('discord.js');

// Aktif TFT oyunları
const activeTftGames = new Map();

// Kullanıcı cooldown sistemi (spam önleme)
const userCooldowns = new Map();

// TFT oyunu oluştur
async function createTftGame(message) {
    console.log('🔍 TFT createTftGame fonksiyonu çalıştı');
    const parts = message.content.split('-');
    console.log('📝 TFT parçalar:', parts);
    
    if ((parts.length !== 2 && parts.length !== 3) || parts[0] !== '!tft') {
        console.log('❌ TFT format hatası:', parts.length, parts[0]);
        message.reply('❌ Geçersiz format! Örnek: `!tft-120-solo`, `!tft-9s-double` veya `!tft-9.22s`');
        return;
    }
    
    const timeParam = parts[1].trim();
    let gameType = null;
    
    if (parts.length === 3) {
        gameType = parts[2].trim().toLowerCase();
        if (!['solo', 'double'].includes(gameType)) {
            message.reply('❌ Geçersiz oyun türü! Kullanın: `solo` veya `double`');
            return;
        }
    }
    
    console.log('✅ TFT parametreler:', { timeParam, gameType });
    
    // Zaman parse et
    let timeInfo;
    if (timeParam.endsWith('s')) {
        // Saat formatı (9s = akşam 9:00, 9.22s = akşam 9:22)
        const timeStr = timeParam.slice(0, -1);
        
        let hour, minute;
        if (timeStr.includes('.')) {
            const parts = timeStr.split('.');
            hour = parseInt(parts[0]);
            minute = parseInt(parts[1]);
            
            if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                message.reply('❌ Geçersiz saat! Format: 9s veya 9.22s (saat.dakika)');
                return;
            }
        } else {
            hour = parseInt(timeStr);
            minute = 0;
            
            if (isNaN(hour) || hour < 0 || hour > 23) {
                message.reply('❌ Geçersiz saat! 0-23 arası yazın (örn: 9s)');
                return;
            }
        }
        
        timeInfo = { type: 'fixed', hour: hour, minute: minute };
    } else {
        // Dakika formatı (120 = 120 dakika sonra)
        const minutes = parseInt(timeParam);
        if (isNaN(minutes) || minutes <= 0) {
            message.reply('❌ Geçersiz dakika! Pozitif sayı yazın (örn: 120)');
            return;
        }
        timeInfo = { type: 'countdown', minutes: minutes };
    }
    
    const gameId = Date.now().toString();
    const game = {
        id: gameId,
        creator: message.author.id,
        gameType: gameType,
        timeInfo: timeInfo,
        players: [],
        reserves: [],
        createdAt: new Date(),
        messageId: null
    };
    
    activeTftGames.set(gameId, game);
    
    // TFT maç kaydı oluştur
    const { getTftMatchesData, saveTftLeagueData } = require('../utils/dataManager');
    const tftMatchesData = getTftMatchesData();
    tftMatchesData[gameId] = {
        id: gameId,
        players: [],
        placements: [],
        timestamp: new Date().toISOString(),
        completed: false,
        gameType: gameType || 'unknown',
        timeInfo: timeInfo
    };
    require('../utils/dataManager').setTftMatchesData(tftMatchesData);
    require('../utils/dataManager').saveMatchesData();
    
    // TFT rolüne sahip kullanıcılara DM gönder
    const guild = message.guild;
    const tftRole = guild.roles.cache.find(r => r.name === 'TFT');
    
    if (tftRole) {
        const tftMembers = tftRole.members;
        console.log(`📬 ${tftMembers.size} TFT üyesine DM gönderiliyor...`);
        
        const dmEmbed = new EmbedBuilder()
            .setTitle('♟️ **YENİ TFT OYUNU** ♟️')
            .setDescription(`🎮 **${message.author.username}** yeni bir TFT oyunu oluşturdu!\n\n` +
                           `🕐 **Zaman:** ${timeInfo.type === 'fixed' ? 
                               `Saat ${timeInfo.hour}:${(timeInfo.minute || 0).toString().padStart(2, '0')}'da` : 
                               `${timeInfo.minutes} dakika sonra`}\n` +
                           `🎮 **Mod:** ${gameType || 'Belirsiz (emoji ile seçilecek)'}\n\n` +
                           `⚡ Katılmak için sunucudaki mesaja git!`)
            .setColor('#9B59B6')
            .setTimestamp();
        
        // Her TFT üyesine DM gönder
        for (const [userId, member] of tftMembers) {
            try {
                await member.send({ embeds: [dmEmbed] });
                console.log(`✅ DM gönderildi: ${member.user.username}`);
            } catch (error) {
                console.log(`❌ DM gönderilemedi: ${member.user.username} (DM kapalı)`);
            }
        }
    }
    
    // Ana mesajı #content-etkinlik-duyuru kanalına at
    const etkinlikChannel = guild.channels.cache.find(ch => ch.name === 'content-etkinlik-duyuru');
    const embed = createTftEmbed(game);
    
    let msg;
    if (etkinlikChannel) {
        msg = await etkinlikChannel.send({ embeds: [embed] });
        console.log('✅ TFT oyunu #content-etkinlik-duyuru kanalına atıldı');
    } else {
        msg = await message.reply({ embeds: [embed] });
        console.log('⚠️ #content-etkinlik-duyuru kanalı bulunamadı, reply olarak atıldı');
    }
    
    game.messageId = msg.id;
    
    if (gameType) {
        // Oyun modu belirli ise tek emoji
        await msg.react('⚡');
    } else {
        // Oyun modu belirsiz ise iki emoji
        await msg.react('👤'); // Solo için
        await msg.react('👥'); // Double için
    }
    
    // Geri sayım başlat
    if (timeInfo.type === 'countdown') {
        startCountdown(game, msg);
    } else if (timeInfo.type === 'fixed') {
        // Sabit saat için hatırlatma sistemi
        startFixedTimeReminder(game, guild);
    }
}

// TFT embed oluştur
function createTftEmbed(game) {
    const { gameType, timeInfo, players, reserves } = game;
    
    let timeText;
    if (timeInfo.type === 'fixed') {
        const minute = timeInfo.minute || 0;
        const timeStr = `${timeInfo.hour}:${minute.toString().padStart(2, '0')}`;
        timeText = `🕐 **Saat ${timeStr}'da başlıyor**`;
    } else {
        const endTime = new Date(game.createdAt.getTime() + timeInfo.minutes * 60000);
        timeText = `⏰ **${timeInfo.minutes} dakika sonra** (${endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`;
    }
    
    const playersText = players.length > 0 ? players.join('\n') : 'Henüz kimse katılmadı';
    const reservesText = reserves.length > 0 ? reserves.join('\n') : 'Yedek yok';
    
    let title, description, color;
    
    if (gameType) {
        title = `♟️ **TFT ${gameType.toUpperCase()} OYUNU** ♟️`;
        description = `${timeText}\n\n⚡ **Katılmak için emoji'ye tıklayın!**`;
        color = gameType === 'solo' ? '#FFD700' : '#FF6B6B';
    } else {
        title = `♟️ **TFT OYUNU** ♟️`;
        description = `${timeText}\n\n👤 **Solo** | 👥 **Double**\nOyun modunu seçmek için emoji'ye tıklayın!`;
        color = '#9B59B6';
    }
    
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .addFields(
            { name: `👥 **Oyuncular (${players.length}/8)**`, value: playersText, inline: true },
            { name: `🔄 **Yedekler (${reserves.length})**`, value: reservesText, inline: true }
        )
        .setColor(color)
        .setFooter({ text: `🎮 TFT Sistemi | ID: ${game.id}` })
        .setTimestamp();
    
    return embed;
}

// Geri sayım başlat
function startCountdown(game, message) {
    const interval = setInterval(async () => {
        const now = new Date();
        const endTime = new Date(game.createdAt.getTime() + game.timeInfo.minutes * 60000);
        const remaining = endTime - now;
        
        if (remaining <= 0) {
            clearInterval(interval);
            await message.channel.send(`🎮 **TFT ${game.gameType.toUpperCase()} oyunu başlıyor!**\n👥 Katılanlar: ${game.players.join(', ') || 'Kimse yok'}`);
            activeTftGames.delete(game.id);
            return;
        }
        
        // Her 30 saniyede embed güncelle
        if (remaining % 30000 < 1000) {
            const embed = createTftEmbed(game);
            await message.edit({ embeds: [embed] });
        }
    }, 1000);
}

// TFT reaction handler
async function handleTftReaction(reaction, user, isAdd) {
    if (user.bot) return;
    
    // Spam önleme - 3 saniye cooldown
    const now = Date.now();
    const cooldownKey = `${user.id}-${reaction.message.id}`;
    const lastAction = userCooldowns.get(cooldownKey);
    
    if (lastAction && now - lastAction < 3000) {
        console.log(`⏱️ ${user.username} cooldown'da, spam engellendi`);
        return;
    }
    
    userCooldowns.set(cooldownKey, now);
    
    console.log('🎮 TFT reaction handler çalıştı:', user.username, isAdd ? 'ekleme' : 'çıkarma');
    
    const game = Array.from(activeTftGames.values()).find(g => g.messageId === reaction.message.id);
    if (!game) {
        console.log('❌ Oyun bulunamadı');
        return;
    }
    
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const tftRole = guild.roles.cache.find(r => r.name === 'TFT');
    
    const oldPlayerCount = game.players.length;
    
    if (isAdd) {
        // TFT rolü yoksa ver ve lig'e kaydet
        if (tftRole && !member.roles.cache.has(tftRole.id)) {
            try {
                await member.roles.add(tftRole);
                console.log(`✅ ${user.username} kullanıcısına TFT rolü verildi`);
                
                // TFT lig'ine otomatik kaydet
                const { getTftLeagueData, saveTftLeagueData } = require('../utils/dataManager');
                const tftLeagueData = getTftLeagueData();
                
                if (!tftLeagueData[user.id]) {
                    tftLeagueData[user.id] = {
                        username: user.username,
                        matches: []
                    };
                    saveTftLeagueData();
                    console.log(`✅ ${user.username} TFT lig'ine kaydedildi`);
                }
            } catch (error) {
                console.error('TFT rol verme hatası:', error);
            }
        }
        
        // Oyuna ekle
        const username = user.username;
        if (!game.players.includes(username) && !game.reserves.includes(username)) {
            if (game.players.length < 8) {
                game.players.push(username);
            } else {
                game.reserves.push(username);
            }
        }
    } else {
        // Oyuncu çıkar
        const username = user.username;
        game.players = game.players.filter(p => p !== username);
        game.reserves = game.reserves.filter(p => p !== username);
        
        // Yedekten ana listeye taşı
        if (game.players.length < 8 && game.reserves.length > 0) {
            game.players.push(game.reserves.shift());
        }
    }
    
    // Embed güncelle
    const embed = createTftEmbed(game);
    await reaction.message.edit({ embeds: [embed] });
    
    // Sadece oyuncu sayısı değiştiyse bildirim gönder
    const newPlayerCount = game.players.length;
    if (newPlayerCount !== oldPlayerCount) {
        const sohbetChannel = guild.channels.cache.find(ch => ch.name === 'sohbet');
        if (sohbetChannel) {
            if (newPlayerCount === 8) {
                await sohbetChannel.send(`🎉 **TFT lobisi doldu!** (8/8)\n✅ Oyun hazır, başlayabilirsiniz!`);
            } else if (newPlayerCount >= 6) {
                await sohbetChannel.send(`🔥 **TFT lobisi ${newPlayerCount}/8 oldu!** Neredeyse dolu!`);
            } else if (newPlayerCount > oldPlayerCount) {
                await sohbetChannel.send(`🎮 **TFT lobisi ${newPlayerCount}/8 oldu**`);
            }
        }
    }
}

// Sabit saat için hatırlatma sistemi
function startFixedTimeReminder(game, guild) {
    const { hour, minute } = game.timeInfo;
    const now = new Date();
    const gameTime = new Date();
    gameTime.setHours(hour, minute || 0, 0, 0);
    
    // Eğer oyun zamanı geçmişse yarına ayarla
    if (gameTime <= now) {
        gameTime.setDate(gameTime.getDate() + 1);
    }
    
    const reminderTime = new Date(gameTime.getTime() - 15 * 60 * 1000); // 15 dakika önce
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    if (timeUntilReminder > 0) {
        setTimeout(async () => {
            const sohbetChannel = guild.channels.cache.find(ch => ch.name === 'sohbet');
            if (sohbetChannel && activeTftGames.has(game.id)) {
                const currentGame = activeTftGames.get(game.id);
                await sohbetChannel.send(`⏰ **TFT lobisine son 15 dakika!**\n🎮 Oyuncu sayısı: ${currentGame.players.length}/8`);
            }
        }, timeUntilReminder);
    }
}

module.exports = {
    createTftGame,
    handleTftReaction,
    activeTftGames
};