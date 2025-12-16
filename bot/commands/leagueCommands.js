const { EmbedBuilder } = require('discord.js');
const { getLeagueData, getMatchesData, saveLeagueData, saveMatchesData } = require('../utils/dataManager');

// Lig kayıt fonksiyonu - lig-kayıt-[id/etiket] formatında
async function handleLeagueRegistration(message) {
    const content = message.content;
    const leagueData = getLeagueData();
    
    let targetUserId, targetUsername;
    
    if (content === 'lig-kayıt') {
        // Kendi kendine kayıt
        targetUserId = message.author.id;
        targetUsername = message.author.username;
    } else if (content.startsWith('lig-kayıt-')) {
        // Başka birini kayıt etme
        const query = content.substring(10); // 'lig-kayıt-' kısmını çıkar
        
        if (query.startsWith('<@') && query.endsWith('>')) {
            // Mention formatı
            targetUserId = query.slice(2, -1).replace('!', '');
            try {
                const user = await message.client.users.fetch(targetUserId);
                targetUsername = user.username;
            } catch (error) {
                message.reply('❌ Geçersiz kullanıcı etiketlemesi.');
                return;
            }
        } else {
            // ID formatı
            targetUserId = query;
            try {
                const user = await message.client.users.fetch(targetUserId);
                targetUsername = user.username;
            } catch (error) {
                message.reply('❌ Geçersiz kullanıcı ID\'si.');
                return;
            }
        }
    } else {
        return; // Geçersiz format
    }
    
    if (leagueData[targetUserId]) {
        message.reply(`✅ **${targetUsername}**, zaten lig'e kayıtlı!\n🏆 Galibiyet: **${leagueData[targetUserId].wins}**\n🔴 Mağlubiyet: **${leagueData[targetUserId].losses}**`);
        return;
    }
    
    leagueData[targetUserId] = {
        username: targetUsername,
        wins: 0,
        losses: 0,
        totalMatches: 0
    };
    
    saveLeagueData();
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 **LİG KAYDI TAMAMLANDI** 🏆')
        .setDescription(`🔥 **${targetUsername}** lig'e başarıyla kaydedildi!`)
        .addFields(
            { name: '🏆 **Galibiyet**', value: '**0**', inline: true },
            { name: '🔴 **Mağlubiyet**', value: '**0**', inline: true },
            { name: '📊 **Toplam Maç**', value: '**0**', inline: true }
        )
        .setColor('#00ff00')
        .setFooter({ text: '🎮 İyi şanslar! | Amazon Q Bot' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// Maç kayıtlarını göster
async function showMatchRecords(message) {
    const matchesData = getMatchesData();
    const matches = Object.values(matchesData).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (matches.length === 0) {
        message.reply('💭 **Hiç maç kaydı bulunamadı.**');
        return;
    }
    
    const embed = new EmbedBuilder()
        .setTitle('📊 **MAÇ KAYITLARI** 📊')
        .setDescription(`📝 **Toplam ${matches.length} maç kaydı**\n\n╔══════════════════════════════╗`)
        .setColor('#0099ff');
    
    const recentMatches = matches.slice(0, 10);
    
    for (const match of recentMatches) {
        const status = match.completed ? '✅ Tamamlandı' : '⏳ Bekliyor';
        const winner = match.winner ? (match.winner === 'blue' ? '🔵 Mavi' : '🔴 Kırmızı') : '❓ Belirsiz';
        const date = new Date(match.timestamp).toLocaleDateString('tr-TR');
        
        embed.addFields({
            name: `🆔 **${match.id}** - ${match.gameMode.toUpperCase()}`,
            value: `║ ${status} | ${winner} | ${date} ║`,
            inline: false
        });
    }
    
    embed.addFields({ name: '\u200b', value: '╚══════════════════════════════╝', inline: false });
    
    await message.reply({ embeds: [embed] });
}

// Boş kayıtları sil
async function deleteEmptyMatches(message) {
    const matchesData = getMatchesData();
    const emptyMatches = Object.values(matchesData).filter(match => !match.completed);
    
    if (emptyMatches.length === 0) {
        message.reply('💭 **Silinecek boş maç kaydı bulunamadı.**');
        return;
    }
    
    emptyMatches.forEach(match => {
        delete matchesData[match.id];
    });
    
    saveMatchesData();
    
    const embed = new EmbedBuilder()
        .setTitle('🗑️ **BOŞ KAYITLAR SİLİNDİ** 🗑️')
        .setDescription(`🔥 **${emptyMatches.length} adet** tamamlanmamış maç kaydı silindi!`)
        .setColor('#ff6600')
        .setFooter({ text: '🎮 Temizlik tamamlandı | Amazon Q Bot' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// Liderlik tablosu
async function showLeaderboard(message) {
    const leagueData = getLeagueData();
    const players = Object.values(leagueData);
    
    if (players.length === 0) {
        message.reply('💭 **Henüz kayıtlı oyuncu bulunamadı.**');
        return;
    }
    
    // Win rate'e göre sırala
    players.sort((a, b) => {
        const aWinRate = a.totalMatches > 0 ? (a.wins / a.totalMatches) : 0;
        const bWinRate = b.totalMatches > 0 ? (b.wins / b.totalMatches) : 0;
        if (bWinRate !== aWinRate) return bWinRate - aWinRate;
        return b.wins - a.wins; // Eşitlik durumunda galibiyet sayısına göre
    });
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 **LİG LİDERLER TABLOSU** 🏆')
        .setDescription(`🔥 **Toplam ${players.length} aktif oyuncu**\n\n╔══════════════════════════════════════════════════╗`)
        .setColor('#ffd700');
    
    const topPlayers = players.slice(0, 15);
    
    topPlayers.forEach((player, index) => {
        const winRate = player.totalMatches > 0 ? ((player.wins / player.totalMatches) * 100).toFixed(1) : '0.0';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**${index + 1}.**`;
        
        embed.addFields({
            name: `${medal} **${player.username}**`,
            value: `║ 🏆 ${player.wins}G 🔴 ${player.losses}M | 📊 ${winRate}% WR ║`,
            inline: false
        });
    });
    
    embed.addFields({ name: '\u200b', value: '╚══════════════════════════════════════════════════╝', inline: false });
    
    await message.reply({ embeds: [embed] });
}

// Win rate göster
async function showWinRate(message) {
    const leagueData = getLeagueData();
    const query = message.content.substring(4); // !wr- kısmını çıkar
    let targetUser = null;
    
    // ID veya mention kontrolü
    if (query.startsWith('<@') && query.endsWith('>')) {
        const userId = query.slice(2, -1).replace('!', '');
        targetUser = leagueData[userId];
    } else {
        // İsim ile arama
        targetUser = Object.values(leagueData).find(player => 
            player.username.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    if (!targetUser) {
        message.reply(`❌ **${query}** adlı oyuncu lig'de bulunamadı.`);
        return;
    }
    
    const winRate = targetUser.totalMatches > 0 ? ((targetUser.wins / targetUser.totalMatches) * 100).toFixed(1) : '0.0';
    
    const embed = new EmbedBuilder()
        .setTitle(`📊 **${targetUser.username} - İSTATİSTİKLER** 📊`)
        .addFields(
            { name: '🏆 **Galibiyet**', value: `**${targetUser.wins}**`, inline: true },
            { name: '🔴 **Mağlubiyet**', value: `**${targetUser.losses}**`, inline: true },
            { name: '📊 **Win Rate**', value: `**${winRate}%**`, inline: true },
            { name: '🎮 **Toplam Maç**', value: `**${targetUser.totalMatches}**`, inline: true }
        )
        .setColor(parseFloat(winRate) >= 50 ? '#00ff00' : '#ff6600')
        .setFooter({ text: '🎮 Lig İstatistikleri | Amazon Q Bot' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// Maç sonucu kaydet - !maç-sonuç-[id]-[takım rengi] formatı
async function handleMatchResult(message) {
    console.log('🔍 Maç sonuç fonksiyonu çalıştı:', message.content);
    
    const leagueData = getLeagueData();
    const matchesData = getMatchesData();
    
    // Daha esnek parsing - tire ve boşluk toleransı
    const content = message.content.trim().replace(/\s+/g, ' ');
    const parts = content.split('-');
    
    console.log('📝 Orijinal mesaj:', message.content);
    console.log('📝 Temizlenmiş mesaj:', content);
    console.log('📝 Parçalar:', parts);
    console.log('📊 Mevcut maçlar:', Object.keys(matchesData));
    console.log('📊 Toplam maç sayısı:', Object.keys(matchesData).length);
    
    // Format kontrolü - daha esnek
    if (parts.length < 4) {
        message.reply('❌ Geçersiz format! Örnek: `!maç-sonuç-MMJ7HQV3Y6DN-mavi` veya `!maç-sonuç-MMJ7HQV3Y6DN-kırmızı`');
        return;
    }
    
    // İlk iki parça kontrolü
    if (parts[0].trim() !== '!maç' || parts[1].trim() !== 'sonuç') {
        message.reply('❌ Komut başlangıcı hatalı! `!maç-sonuç-` ile başlamalı.');
        return;
    }
    
    const matchId = parts[2].trim();
    const winnerColor = parts[3].trim().toLowerCase();
    
    console.log('🆔 Aranan maç ID:', matchId);
    console.log('🎨 Kazanan renk:', winnerColor);
    
    if (!['mavi', 'kırmızı', 'blue', 'red'].includes(winnerColor)) {
        message.reply('❌ Geçersiz takım rengi! Kullanın: `mavi`, `kırmızı`, `blue` veya `red`');
        return;
    }
    
    // Maç ID kontrolü - case insensitive
    let match = null;
    let actualMatchId = null;
    
    // Önce tam eşleşme ara
    if (matchesData[matchId]) {
        match = matchesData[matchId];
        actualMatchId = matchId;
    } else {
        // Case insensitive arama
        const matchIds = Object.keys(matchesData);
        const foundId = matchIds.find(id => id.toLowerCase() === matchId.toLowerCase());
        if (foundId) {
            match = matchesData[foundId];
            actualMatchId = foundId;
        }
    }
    
    if (!match) {
        const availableMatches = Object.keys(matchesData).filter(id => !matchesData[id].completed);
        message.reply(`❌ **${matchId}** ID'li maç bulunamadı.\n📊 Aktif maçlar: ${availableMatches.join(', ') || 'Yok'}\n📋 Tüm maçlar: ${Object.keys(matchesData).join(', ') || 'Yok'}`);
        return;
    }
    
    if (match.completed) {
        message.reply(`❌ **${actualMatchId}** ID'li maç zaten tamamlanmış.\n🏆 Kazanan: ${match.winner === 'blue' ? 'Mavi' : 'Kırmızı'} takım`);
        return;
    }
    
    console.log('✅ Maç bulundu:', actualMatchId);
    console.log('👥 Mavi takım:', match.blueTeam);
    console.log('👥 Kırmızı takım:', match.redTeam);
    
    // Kazanan takımı belirle
    const isBlueWinner = ['mavi', 'blue'].includes(winnerColor);
    const winnerTeam = isBlueWinner ? match.blueTeam : match.redTeam;
    const loserTeam = isBlueWinner ? match.redTeam : match.blueTeam;
    
    // Maç sonuçlarını güncelle
    match.winner = isBlueWinner ? 'blue' : 'red';
    match.completed = true;
    match.completedAt = new Date().toISOString();
    
    console.log('🏆 Kazanan takım:', winnerTeam);
    console.log('🔴 Kaybeden takım:', loserTeam);
    
    // Oyuncu istatistiklerini güncelle - daha güvenilir eşleştirme
    let updatedWinners = 0;
    let notFoundWinners = [];
    
    winnerTeam.forEach(playerName => {
        // Önce tam eşleşme ara
        let playerData = Object.values(leagueData).find(p => p.username === playerName);
        
        // Bulunamazsa case insensitive ara
        if (!playerData) {
            playerData = Object.values(leagueData).find(p => 
                p.username.toLowerCase() === playerName.toLowerCase()
            );
        }
        
        if (playerData) {
            playerData.wins++;
            playerData.totalMatches++;
            updatedWinners++;
            console.log(`✅ ${playerName} kazandı - W:${playerData.wins} L:${playerData.losses}`);
        } else {
            notFoundWinners.push(playerName);
            console.log(`❌ ${playerName} lig'de bulunamadı`);
        }
    });
    
    let updatedLosers = 0;
    let notFoundLosers = [];
    
    loserTeam.forEach(playerName => {
        // Önce tam eşleşme ara
        let playerData = Object.values(leagueData).find(p => p.username === playerName);
        
        // Bulunamazsa case insensitive ara
        if (!playerData) {
            playerData = Object.values(leagueData).find(p => 
                p.username.toLowerCase() === playerName.toLowerCase()
            );
        }
        
        if (playerData) {
            playerData.losses++;
            playerData.totalMatches++;
            updatedLosers++;
            console.log(`✅ ${playerName} kaybetti - W:${playerData.wins} L:${playerData.losses}`);
        } else {
            notFoundLosers.push(playerName);
            console.log(`❌ ${playerName} lig'de bulunamadı`);
        }
    });
    
    console.log(`📊 Güncellenen oyuncular: ${updatedWinners} kazanan, ${updatedLosers} kaybeden`);
    console.log(`❌ Bulunamayan oyuncular: ${[...notFoundWinners, ...notFoundLosers].join(', ')}`);
    
    saveMatchesData();
    saveLeagueData();
    
    const winnerTeamName = isBlueWinner ? 'Mavi' : 'Kırmızı';
    const winnerColorHex = isBlueWinner ? '#0099ff' : '#ff0000';
    const totalPlayers = winnerTeam.length + loserTeam.length;
    const totalUpdated = updatedWinners + updatedLosers;
    const notFoundPlayers = [...notFoundWinners, ...notFoundLosers];
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 **MAÇ SONUCU KAYDEDİLDİ** 🏆')
        .addFields(
            { name: `🆔 **Maç ID**`, value: `**${actualMatchId}**`, inline: true },
            { name: `🏆 **Kazanan**`, value: `**${winnerTeamName} Takım**`, inline: true },
            { name: `🎮 **Mod**`, value: `**${match.gameMode.toUpperCase()}**`, inline: true },
            { name: `👑 **Kazananlar**`, value: winnerTeam.join(', '), inline: false },
            { name: `🔴 **Kaybedenler**`, value: loserTeam.join(', '), inline: false },
            { name: `📊 **İstatistik Güncelleme**`, value: `${totalUpdated}/${totalPlayers} oyuncu güncellendi`, inline: false }
        )
        .setColor(winnerColorHex)
        .setTimestamp();
    
    // Footer mesajını duruma göre ayarla
    if (notFoundPlayers.length > 0) {
        embed.setFooter({ text: `⚠️ Lig'de kayıtlı olmayan oyuncular: ${notFoundPlayers.join(', ')} | Amazon Q Bot` });
    } else {
        embed.setFooter({ text: '🎮 Tüm istatistikler başarıyla güncellendi | Amazon Q Bot' });
    }
    
    await message.reply({ embeds: [embed] });
}

module.exports = {
    handleLeagueRegistration,
    showMatchRecords,
    deleteEmptyMatches,
    showLeaderboard,
    showWinRate,
    handleMatchResult
};