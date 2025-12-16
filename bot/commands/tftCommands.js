const { EmbedBuilder } = require('discord.js');

// Aktif TFT oyunları
const activeTftGames = new Map();

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
    
    // TFT rolünü etiketle
    const guild = message.guild;
    const tftRole = guild.roles.cache.find(r => r.name === 'TFT');
    let roleText = '';
    if (tftRole) {
        roleText = `${tftRole} `;
    }
    
    const embed = createTftEmbed(game);
    const msg = await message.reply({ content: roleText, embeds: [embed] });
    
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
    
    console.log('🎮 TFT reaction handler çalıştı:', user.username, isAdd ? 'ekleme' : 'çıkarma');
    console.log('📊 Aktif oyunlar:', activeTftGames.size);
    
    const game = Array.from(activeTftGames.values()).find(g => g.messageId === reaction.message.id);
    if (!game) {
        console.log('❌ Oyun bulunamadı, mesaj ID:', reaction.message.id);
        return;
    }
    
    console.log('✅ Oyun bulundu:', game.id);
    const username = user.username;
    
    if (isAdd) {
        // Oyuncu ekle
        if (!game.players.includes(username) && !game.reserves.includes(username)) {
            if (game.players.length < 8) {
                game.players.push(username);
            } else {
                game.reserves.push(username);
            }
        }
    } else {
        // Oyuncu çıkar
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
}

module.exports = {
    createTftGame,
    handleTftReaction,
    activeTftGames
};