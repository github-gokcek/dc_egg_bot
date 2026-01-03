const { EmbedBuilder } = require('discord.js');
const { getTftLeagueData, getTftMatchesData, saveTftLeagueData, saveMatchesData } = require('../utils/dataManager');

// TFT Leaderboard
async function showTftLeaderboard(message) {
    const tftLeagueData = getTftLeagueData();
    const players = Object.values(tftLeagueData).filter(player => player.matches.length > 0);
    
    if (players.length === 0) {
        message.reply('💭 **Henüz TFT maçı oynayan oyuncu bulunamadı.**');
        return;
    }
    
    // Ortalama sıralama hesapla ve sırala
    players.forEach(player => {
        const placements = player.matches.map(m => m.placement);
        player.avgPlacement = placements.reduce((a, b) => a + b, 0) / placements.length;
        player.totalGames = placements.length;
        player.top4Rate = (placements.filter(p => p <= 4).length / placements.length * 100).toFixed(1);
        player.winRate = (placements.filter(p => p === 1).length / placements.length * 100).toFixed(1);
    });
    
    players.sort((a, b) => a.avgPlacement - b.avgPlacement);
    
    const embed = new EmbedBuilder()
        .setTitle('♟️ **TFT LİG LİDERLER TABLOSU** ♟️')
        .setDescription(`🔥 **Toplam ${players.length} aktif oyuncu**\n📊 **Toplam ${players.reduce((sum, p) => sum + p.totalGames, 0)} maç**\n\n╔══════════════════════════════════════════════════╗`)
        .setColor('#9B59B6');
    
    const topPlayers = players.slice(0, 15);
    
    topPlayers.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**${index + 1}.**`;
        const placementsText = player.matches.slice(-5).map(m => m.placement).join(' - ');
        
        embed.addFields({
            name: `${medal} **${player.username}**`,
            value: `║ 📊 Ort: ${player.avgPlacement.toFixed(2)} | 🏆 ${player.winRate}% Win | 🎯 ${player.top4Rate}% Top4 ║\n` +
                   `║ 📈 Son 5: ${placementsText} | 🎮 ${player.totalGames} Maç ║`,
            inline: false
        });
    });
    
    embed.addFields({ name: '\u200b', value: '╚══════════════════════════════════════════════════╝', inline: false });
    
    await message.reply({ embeds: [embed] });
}

// TFT Maç Sonucu Girme
async function handleTftMatchResult(message) {
    const content = message.content.trim();
    const parts = content.split('-');
    
    if (parts.length < 3) {
        message.reply('❌ Geçersiz format! Örnek: `tft-maç-MATCHID-@ali-@veli-@ayşe-@mehmet`');
        return;
    }
    
    if (parts[0] !== 'tft' || parts[1] !== 'maç') {
        message.reply('❌ Komut `tft-maç-` ile başlamalı!');
        return;
    }
    
    const matchId = parts[2];
    const playerMentions = parts.slice(3);
    
    if (playerMentions.length === 0) {
        message.reply('❌ En az bir oyuncu etiketlemelisiniz!');
        return;
    }
    
    const tftMatchesData = getTftMatchesData();
    const match = tftMatchesData[matchId];
    
    if (!match) {
        message.reply(`❌ **${matchId}** ID'li TFT maçı bulunamadı.`);
        return;
    }
    
    if (match.completed) {
        message.reply(`❌ **${matchId}** ID'li maç zaten tamamlanmış.`);
        return;
    }
    
    // Oyuncu etiketlerini parse et
    const players = [];
    for (const mention of playerMentions) {
        const userId = mention.replace('<@', '').replace('!', '').replace('>', '');
        try {
            const user = await message.client.users.fetch(userId);
            players.push({ id: user.id, username: user.username });
        } catch (error) {
            message.reply(`❌ Geçersiz kullanıcı etiketi: ${mention}`);
            return;
        }
    }
    
    // Maç sonuçlarını kaydet
    const tftLeagueData = getTftLeagueData();
    let updatedPlayers = 0;
    
    players.forEach((player, index) => {
        const placement = index + 1;
        
        // Oyuncu TFT lig'inde yoksa ekle
        if (!tftLeagueData[player.id]) {
            tftLeagueData[player.id] = {
                username: player.username,
                matches: []
            };
        }
        
        // Maç sonucunu ekle
        tftLeagueData[player.id].matches.push({
            matchId: matchId,
            placement: placement,
            timestamp: new Date().toISOString()
        });
        
        updatedPlayers++;
    });
    
    // Maçı tamamla
    match.completed = true;
    match.completedAt = new Date().toISOString();
    match.players = players.map(p => p.username);
    match.placements = players.map((p, i) => ({ username: p.username, placement: i + 1 }));
    
    // Verileri kaydet
    require('../utils/dataManager').setTftLeagueData(tftLeagueData);
    require('../utils/dataManager').setTftMatchesData(tftMatchesData);
    saveTftLeagueData();
    saveMatchesData();
    
    const embed = new EmbedBuilder()
        .setTitle('♟️ **TFT MAÇ SONUCU KAYDEDİLDİ** ♟️')
        .addFields(
            { name: '🆔 **Maç ID**', value: `**${matchId}**`, inline: true },
            { name: '🎮 **Oyuncu Sayısı**', value: `**${players.length}**`, inline: true },
            { name: '📊 **Güncellenen**', value: `**${updatedPlayers} oyuncu**`, inline: true },
            { name: '🏆 **Sıralama**', value: players.map((p, i) => `${i + 1}. ${p.username}`).join('\n'), inline: false }
        )
        .setColor('#9B59B6')
        .setFooter({ text: '♟️ TFT Lig Sistemi | Amazon Q Bot' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

module.exports = {
    showTftLeaderboard,
    handleTftMatchResult
};