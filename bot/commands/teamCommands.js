const { EmbedBuilder } = require('discord.js');
const { generateMatchId, getMatchesData, saveMatchesData } = require('../utils/dataManager');

// Takım seçim fonksiyonları
async function startTeamSelection(message) {
    const embed = new EmbedBuilder()
        .setTitle('🎮 **TAKIM SEÇİM SİSTEMİ** 🎮')
        .setDescription('🔥 **OYUN MODUNU SEÇİN** 🔥\n\n┌──────────────────────────────┐')
        .addFields(
            { 
                name: '🏁 **SEÇENEK 1**', 
                value: '║ 🏰 **SİHİRDAR VADİSİ** ║\n║ Klasik 5v5 Oyun Modu ║', 
                inline: true 
            },
            { 
                name: '🏁 **SEÇENEK 2**', 
                value: '║ ⚔️ **ARAM MODU** ║\n║ Hızlı Savaş Modu ║', 
                inline: true 
            },
            { 
                name: '🏁 **SEÇENEK 3**', 
                value: '║ 📊 **ANKET OLUŞTUR** ║\n║ Topluluk Kararı ║', 
                inline: true 
            }
        )
        .setFooter({ text: '👆 Yukarıdaki emoji butonlara tıklayarak seçiminizi yapın!' })
        .setColor('#0099ff');
    
    const session = {
        step: 'gameMode',
        userId: message.author.id,
        channelId: message.channel.id,
        gameMode: null,
        teamMode: null,
        players: [],
        captains: [],
        blueTeam: [],
        redTeam: [],
        remainingPlayers: [],
        currentTurn: 'blue',
        pickOrder: [1, 2, 2, 1, 1, 1],
        currentPick: 0,
        waitingForReaction: true
    };
    
    return { embed, session };
}

async function showFinalTeams(message, session) {
    // Maç ID'si oluştur ve kaydet
    const matchId = generateMatchId();
    session.matchId = matchId;
    
    // Maç kaydını oluştur
    const matchesData = getMatchesData();
    matchesData[matchId] = {
        id: matchId,
        gameMode: session.gameMode,
        blueTeam: [...session.blueTeam],
        redTeam: [...session.redTeam],
        winner: null,
        timestamp: new Date().toISOString(),
        completed: false,
        createdBy: message.author.id
    };
    saveMatchesData();
    
    const blueTeamDisplay = session.blueTeam.map((p, i) => 
        i === 0 ? `👑 **${p}** (Kaptan)` : `⚔️ ${p}`
    ).join('\n');
    
    const redTeamDisplay = session.redTeam.map((p, i) => 
        i === 0 ? `👑 **${p}** (Kaptan)` : `⚔️ ${p}`
    ).join('\n');
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 FİNAL TAKIMLAR 🏆')
        .addFields(
            { 
                name: '🔵 **MAVİ TAKIM** (5/5)', 
                value: `╔══════════════════╗\n║ ${blueTeamDisplay.replace(/\n/g, ' ║\n║ ')} ║\n╚══════════════════╝`, 
                inline: true 
            },
            { 
                name: '🔴 **KIRMIZI TAKIM** (5/5)', 
                value: `╔══════════════════╗\n║ ${redTeamDisplay.replace(/\n/g, ' ║\n║ ')} ║\n╚══════════════════╝`, 
                inline: true 
            },
            { name: '\u200b', value: '\u200b', inline: false },
            { name: '🆔 **MAÇ ID**', value: `**${matchId}**`, inline: true },
            { name: '📝 **SONUÇ GİRME**', value: `\`!maç-sonuç-${matchId}-mavi\` veya \`!maç-sonuç-${matchId}-kırmızı\``, inline: true },
            { name: '\u200b', value: '\u200b', inline: false },
            { name: '🔄 **TEKRAR KARIŞTIR**', value: 'Takımları yeniden oluştur', inline: true },
            { name: '✅ **ONAYLA**', value: 'Takımları kesinleştir', inline: true }
        )
        .setDescription('🎉 **TAKIMLAR HAZIR!** 🎉\n\n👆 Aşağıdaki butonlara tıklayarak seçiminizi yapın:')
        .setColor('#00ff00')
        .setFooter({ text: `🎮 Maç ID: ${matchId} | Amazon Q Bot` })
        .setTimestamp();
    
    return embed;
}

async function createRandomTeams(message, session) {
    const shuffled = [...session.players].sort(() => Math.random() - 0.5);
    session.blueTeam = shuffled.slice(0, 5);
    session.redTeam = shuffled.slice(5, 10);
    session.remainingPlayers = [];
    
    return await showFinalTeams(message, session);
}

module.exports = {
    startTeamSelection,
    showFinalTeams,
    createRandomTeams
};