const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Modül importları
const { loadLeagueData, loadMatchesData } = require('./utils/dataManager');
const { 
    handleLeagueRegistration, 
    showMatchRecords, 
    deleteEmptyMatches, 
    showLeaderboard, 
    showWinRate, 
    handleMatchResult 
} = require('./commands/leagueCommands');
const { startTeamSelection, showFinalTeams, createRandomTeams } = require('./commands/teamCommands');
const { createRoleMessage, handleRoleReaction, GAME_ROLES } = require('./commands/roleCommands');
const { createTftGame, handleTftReaction } = require('./commands/tftCommands');
const { showHelp } = require('./commands/helpCommands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const sessions = new Map();

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    loadLeagueData();
    loadMatchesData();
    console.log('🎮 Lig sistemi yüklendi!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    // Debug: Tüm komutları logla
    if (message.content.startsWith('!')) {
        console.log('📝 Komut alındı:', message.content, 'Kullanıcı:', message.author.username);
    }
    
    if (message.content === '!ping') {
        message.reply('Pong!');
        return;
    }
    
    if (message.content === '!vs') {
        // LoL rolünü etiketle
        const guild = message.guild;
        const lolRole = guild.roles.cache.find(r => r.name === 'LoL');
        let roleText = '';
        if (lolRole) {
            roleText = `${lolRole} `;
        }
        
        const { embed, session } = await startTeamSelection(message);
        sessions.set(message.author.id, session);
        const msg = await message.reply({ content: roleText, embeds: [embed] });
        session.reactionMessageId = msg.id;
        
        await msg.react('1️⃣');
        await msg.react('2️⃣');
        await msg.react('3️⃣');
        return;
    }
    
    // Hızlı komut kontrolü
    if (message.content.startsWith('!vs-')) {
        await handleQuickCommand(message);
        return;
    }
    
    // İptal komutu
    if (message.content === '!iptal') {
        const session = sessions.get(message.author.id);
        if (session) {
            sessions.delete(message.author.id);
            const embed = new EmbedBuilder()
                .setTitle('❌ **İŞLEM İPTAL EDİLDİ** ❌')
                .setDescription('🔥 **Aktif takım seçim işlemi iptal edildi!**')
                .setColor('#ff0000')
                .setFooter({ text: '🎮 Yeni bir işlem başlatabilirsiniz ' })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ **İptal edilecek aktif işlem bulunamadı.**');
        }
        return;
    }
    
    // Lig komutları
    if (message.content === 'lig-kayıt' || message.content.startsWith('lig-kayıt-')) {
        await handleLeagueRegistration(message);
        return;
    }
    
    if (message.content === '!maç-kayıt') {
        await showMatchRecords(message);
        return;
    }
    
    if (message.content === 'boş-kayıt-sil') {
        await deleteEmptyMatches(message);
        return;
    }
    
    if (message.content === '!leaderboard') {
        await showLeaderboard(message);
        return;
    }
    
    if (message.content.startsWith('!wr-')) {
        await showWinRate(message);
        return;
    }
    
    // Maç sonuç girme: !maç-sonuç-[id]-[renk]
    if (message.content.startsWith('!maç-sonuç-')) {
        console.log('🎯 Maç sonuç komutu algılandı:', message.content);
        await handleMatchResult(message);
        return;
    }
    
    // Rol sistemi
    if (message.content === '!rol') {
        await createRoleMessage(message);
        return;
    }
    
    // TFT sistemi
    if (message.content.startsWith('!tft-')) {
        console.log('🎯 TFT komutu algılandı:', message.content);
        try {
            await createTftGame(message);
        } catch (error) {
            console.error('❌ TFT komutu hatası:', error);
            message.reply('❌ TFT komutu çalıştırılırken hata oluştu.');
        }
        return;
    }
    
    // Yardım sistemi
    if (message.content === '!yardım' || message.content === '!help') {
        await showHelp(message);
        return;
    }
    
    // Aktif session kontrolü
    const session = sessions.get(message.author.id);
    if (session) {
        await handleSessionResponse(message, session);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    
    // Rol sistemi kontrolü
    if (GAME_ROLES[reaction.emoji.name]) {
        await handleRoleReaction(reaction, user, true);
        return;
    }
    
    // TFT sistemi kontrolü
    if (reaction.emoji.name === '⚡' || reaction.emoji.name === '👤' || reaction.emoji.name === '👥') {
        await handleTftReaction(reaction, user, true);
        return;
    }
    
    const session = sessions.get(user.id);
    if (!session) return;
    
    if (session.waitingForPoll && reaction.message.id === session.pollMessageId) {
        await handlePollVote(reaction, user, session);
    } else if (session.waitingForReaction && reaction.message.id === session.reactionMessageId) {
        await handleReactionResponse(reaction, user, session);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    
    // Rol sistemi kontrolü
    if (GAME_ROLES[reaction.emoji.name]) {
        await handleRoleReaction(reaction, user, false);
    }
    
    // TFT sistemi kontrolü
    if (reaction.emoji.name === '⚡' || reaction.emoji.name === '👤' || reaction.emoji.name === '👥') {
        await handleTftReaction(reaction, user, false);
    }
});

// Session yönetimi ve diğer fonksiyonlar (kısaltılmış)
async function handleSessionResponse(message, session) {
    const content = message.content.trim();
    
    switch (session.step) {
        case 'gameMode':
            await handleGameModeSelection(message, session, content);
            break;
        case 'teamMode':
            await handleTeamModeSelection(message, session, content);
            break;
        case 'playerNames':
            await handlePlayerNames(message, session, content);
            break;
        case 'captainSelection':
            await handleCaptainSelection(message, session, content);
            break;
        case 'captainAssignment':
            await handleCaptainAssignment(message, session, content);
            break;
        case 'playerPicking':
            await handlePlayerPicking(message, session, content);
            break;
        case 'reshuffleConfirm':
            await handleReshuffleConfirm(message, session, content);
            break;
    }
}

async function handleReactionResponse(reaction, user, session) {
    const emoji = reaction.emoji.name;
    session.waitingForReaction = false;
    
    if (session.step === 'gameMode') {
        if (emoji === '1️⃣') {
            session.gameMode = 'sihirdar';
            await askTeamMode({ channel: reaction.message.channel }, session);
        } else if (emoji === '2️⃣') {
            session.gameMode = 'aram';
            await askAramMode({ channel: reaction.message.channel }, session);
        } else if (emoji === '3️⃣') {
            await createPoll({ channel: reaction.message.channel, reply: (msg) => reaction.message.channel.send(msg) }, session);
        }
    } else if (session.step === 'teamMode') {
        if (emoji === '1️⃣') {
            session.teamMode = session.gameMode === 'aram' ? 'sequential' : 'captain';
        } else if (emoji === '2️⃣') {
            session.teamMode = 'random';
        }
        await askPlayerNames({ channel: reaction.message.channel }, session);
    } else if (session.step === 'reshuffleConfirm') {
        if (emoji === '🔄') {
            if (session.teamMode === 'random') {
                const embed = await createRandomTeams({ channel: reaction.message.channel }, session);
                const msg = await reaction.message.channel.send({ embeds: [embed] });
                session.reactionMessageId = msg.id;
                session.waitingForReaction = true;
                await msg.react('🔄');
                await msg.react('✅');
            } else {
                session.blueTeam = [];
                session.redTeam = [];
                session.remainingPlayers = [...session.players];
                session.currentTurn = 'blue';
                session.currentPick = 0;
                await askCaptains({ channel: reaction.message.channel }, session);
            }
        } else if (emoji === '✅') {
            await reaction.message.channel.send('✅ Takımlar kesinleşti! İyi oyunlar!');
            sessions.delete(session.userId);
        }
    }
}

// Hızlı komut işleme
async function handleQuickCommand(message) {
    const parts = message.content.split('-');
    
    if (parts.length < 4) {
        message.reply('❌ Geçersiz format!\n📝 **Örnekler:**\n`!vs-aram-rastgele-@ali @veli @ahmet @ayşe @fatma @nurgül @su @gizem @akın @adem`\n`!vs-sihirdar-takımlı-@ali @veli @ahmet @ayşe @fatma-@nurgül @su @gizem @akın @adem`');
        return;
    }
    
    const gameMode = parts[1].toLowerCase();
    const teamMode = parts[2].toLowerCase();
    const playersText = parts.slice(3).join('-');
    
    if (!['aram', 'sihirdar'].includes(gameMode)) {
        message.reply('❌ Geçersiz oyun modu! Kullanın: `aram` veya `sihirdar`');
        return;
    }
    
    if (!['rastgele', 'kaptanli', 'takımlı'].includes(teamMode)) {
        message.reply('❌ Geçersiz takım modu! Kullanın: `rastgele`, `kaptanli` veya `takımlı`');
        return;
    }
    
    if (teamMode === 'takımlı') {
        await handleTeamAssignmentCommand(message, gameMode, playersText);
        return;
    }
    
    // Etiket formatını kontrol et
    const mentions = playersText.match(/<@!?\d+>/g);
    
    if (!mentions || mentions.length !== 10) {
        message.reply(`❌ 10 oyuncu etiketi gerekli, ${mentions ? mentions.length : 0} etiket girdiniz.\n📝 **Format:** \`!vs-aram-rastgele-@ali @veli @ahmet...\``);
        return;
    }
    
    // Etiketlerden kullanıcı bilgilerini al
    const players = [];
    for (const mention of mentions) {
        const userId = mention.slice(2, -1).replace('!', '');
        try {
            const user = await message.client.users.fetch(userId);
            players.push(user.username);
        } catch (error) {
            message.reply(`❌ Geçersiz kullanıcı etiketi: ${mention}`);
            return;
        }
    }
    
    const session = {
        step: 'reshuffleConfirm',
        userId: message.author.id,
        channelId: message.channel.id,
        gameMode: gameMode,
        teamMode: teamMode === 'rastgele' ? 'random' : 'captain',
        players: players,
        captains: [],
        blueTeam: [],
        redTeam: [],
        remainingPlayers: [],
        currentTurn: 'blue',
        pickOrder: [1, 2, 2, 1, 1, 1],
        currentPick: 0
    };
    
    sessions.set(message.author.id, session);
    
    await message.reply(`✅ **Hızlı Komut Algılandı!**\n🎮 Mod: **${gameMode.toUpperCase()}**\n👥 Takım: **${teamMode.toUpperCase()}**\n📝 Oyuncular: ${players.length} kişi`);
    
    if (session.teamMode === 'random') {
        const embed = await createRandomTeams(message, session);
        const msg = await message.channel.send({ embeds: [embed] });
        session.reactionMessageId = msg.id;
        session.waitingForReaction = true;
        await msg.react('🔄');
        await msg.react('✅');
    } else {
        session.captains = [players[0], players[1]];
        session.blueTeam = [players[0]];
        session.redTeam = [players[1]];
        session.remainingPlayers = players.slice(2);
        session.currentTurnPicks = 0;
        
        await message.channel.send(`👑 **Otomatik Kaptanlar:** ${players[0]} (Mavi) ve ${players[1]} (Kırmızı)`);
        await startPlayerPicking(message, session);
    }
}

async function handleTeamAssignmentCommand(message, gameMode, playersText) {
    // Etiket formatını kontrol et
    const mentions = playersText.match(/<@!?\d+>/g);
    
    if (!mentions || mentions.length !== 10) {
        message.reply(`❌ 10 oyuncu etiketi gerekli, ${mentions ? mentions.length : 0} etiket girdiniz.\n📝 **Doğru format:** \`@ali @veli @ahmet @ayşe @fatma-@nurgül @su @gizem @akın @adem\``);
        return;
    }
    
    // Etiketlerden kullanıcı bilgilerini al
    const allPlayers = [];
    for (const mention of mentions) {
        const userId = mention.slice(2, -1).replace('!', '');
        try {
            const user = await message.client.users.fetch(userId);
            allPlayers.push(user.username);
        } catch (error) {
            message.reply(`❌ Geçersiz kullanıcı etiketi: ${mention}`);
            return;
        }
    }
    
    const bluePlayers = allPlayers.slice(0, 5);
    const redPlayers = allPlayers.slice(5, 10);
    
    const session = {
        step: 'reshuffleConfirm',
        userId: message.author.id,
        channelId: message.channel.id,
        gameMode: gameMode,
        teamMode: 'assigned',
        players: [...bluePlayers, ...redPlayers],
        captains: [],
        blueTeam: bluePlayers,
        redTeam: redPlayers,
        remainingPlayers: [],
        currentTurn: 'blue',
        pickOrder: [1, 2, 2, 1, 1, 1],
        currentPick: 0
    };
    
    sessions.set(message.author.id, session);
    
    await message.reply(`✅ **Takımlı Komut Algılandı!**\n🎮 Mod: **${gameMode.toUpperCase()}**\n👥 Takımlar: **ÖNCEDEN ATANMIŞ**`);
    
    const embed = await showFinalTeams(message, session);
    const msg = await message.channel.send({ embeds: [embed] });
    session.reactionMessageId = msg.id;
    session.waitingForReaction = true;
    session.step = 'reshuffleConfirm';
    await msg.react('🔄');
    await msg.react('✅');
}

// Diğer yardımcı fonksiyonlar (kısaltılmış hali)
async function askTeamMode(message, session) {
    const embed = new EmbedBuilder()
        .setTitle('👥 **TAKIM MODU SEÇİMİ** 👥')
        .setDescription('🔥 **TAKIM SEÇİMİ NASIL OLSUN?** 🔥')
        .addFields(
            { name: '👑 **SEÇENEK 1 - TAKIM KAPTANLI**', value: '║ 🎯 Kaptanlar seçilir ║', inline: true },
            { name: '🎲 **SEÇENEK 2 - HERKES RASTGELE**', value: '║ ⚡ Otomatik karıştırma ║', inline: true }
        )
        .setColor('#00ff00');
    
    session.step = 'teamMode';
    session.waitingForReaction = true;
    const msg = await message.channel.send({ embeds: [embed] });
    session.reactionMessageId = msg.id;
    
    await msg.react('1️⃣');
    await msg.react('2️⃣');
}

async function askPlayerNames(message, session) {
    const embed = new EmbedBuilder()
        .setTitle('👥 **OYUNCU İSİMLERİ GİRİŞİ** 👥')
        .setDescription('🔥 **10 OYUNCUNUN İSMİNİ BOŞLUKLA AYIRARAK YAZIN** 🔥')
        .addFields({ name: '📝 **ÖRNEK GİRİŞ:**', value: '**ali veli ahmet ayşe fatma nurgül su gizem akın adem**', inline: false })
        .setColor('#ffff00');
    
    session.step = 'playerNames';
    if (message.reply) {
        await message.reply({ embeds: [embed] });
    } else {
        await message.channel.send({ embeds: [embed] });
    }
}

// Basit fonksiyonlar
async function handlePlayerNames(message, session, content) {
    const players = content.split(' ').filter(name => name.trim() !== '');
    
    if (players.length !== 10) {
        message.reply(`❌ 10 oyuncu gerekli, ${players.length} oyuncu girdiniz.`);
        return;
    }
    
    session.players = players;
    session.remainingPlayers = [...players];
    
    if (session.teamMode === 'random') {
        const embed = await createRandomTeams(message, session);
        const msg = await message.channel.send({ embeds: [embed] });
        session.reactionMessageId = msg.id;
        session.waitingForReaction = true;
        session.step = 'reshuffleConfirm';
        await msg.react('🔄');
        await msg.react('✅');
    } else {
        await askCaptains(message, session);
    }
}

async function askCaptains(message, session) {
    message.reply('👑 **2 takım kaptanının ismini boşlukla ayırarak yazın:**\n📝 Oyuncular: ' + session.players.join(', '));
    session.step = 'captainSelection';
}

async function handleCaptainSelection(message, session, content) {
    const captains = content.split(' ').filter(name => name.trim() !== '');
    
    if (captains.length !== 2 || !captains.every(cap => session.players.includes(cap))) {
        message.reply('❌ 2 geçerli kaptan gerekli.');
        return;
    }
    
    session.captains = captains;
    session.remainingPlayers = session.players.filter(p => !captains.includes(p));
    
    message.reply(`👑 **Kaptanlar belirlendi!** ${captains[0]} (Mavi) ve ${captains[1]} (Kırmızı)\n📝 **Format:** mavi_kaptan kırmızı_kaptan`);
    session.step = 'captainAssignment';
}

async function handleCaptainAssignment(message, session, content) {
    const assignment = content.split(' ').filter(name => name.trim() !== '');
    
    if (assignment.length !== 2 || !assignment.every(cap => session.captains.includes(cap))) {
        message.reply('❌ Geçersiz kaptan ataması.');
        return;
    }
    
    session.blueTeam = [assignment[0]];
    session.redTeam = [assignment[1]];
    session.currentTurn = 'blue';
    session.currentPick = 0;
    session.currentTurnPicks = 0;
    
    await startPlayerPicking(message, session);
}

async function startPlayerPicking(message, session) {
    session.step = 'playerPicking';
    await showTeamsAndAskPick(message, session);
}

async function showTeamsAndAskPick(message, session) {
    const pickCount = session.pickOrder[session.currentPick];
    const teamName = session.currentTurn === 'blue' ? 'Mavi' : 'Kırmızı';
    
    if (!session.currentTurnPicks) {
        session.currentTurnPicks = 0;
    }
    
    const remaining = pickCount - session.currentTurnPicks;
    
    const embed = new EmbedBuilder()
        .setTitle('🎯 Oyuncu Seçimi')
        .addFields(
            { name: '🔵 Mavi Takım', value: session.blueTeam.join('\n') || 'Boş', inline: true },
            { name: '🔴 Kırmızı Takım', value: session.redTeam.join('\n') || 'Boş', inline: true },
            { name: '⚪ Seçilmemiş', value: session.remainingPlayers.join(', ') || 'Yok', inline: false }
        )
        .setDescription(`🔥 **${teamName} takım sırası!** ${remaining} oyuncu seçin.`)
        .setColor(session.currentTurn === 'blue' ? '#0099ff' : '#ff0000');
    
    await message.channel.send({ embeds: [embed] });
}

async function handlePlayerPicking(message, session, content) {
    const inputPlayers = content.trim().split(' ').filter(name => name.trim() !== '');
    const currentPickCount = session.pickOrder[session.currentPick];
    
    if (!session.currentTurnPicks) {
        session.currentTurnPicks = 0;
    }
    
    const remaining = currentPickCount - session.currentTurnPicks;
    
    if (inputPlayers.length > remaining) {
        message.reply(`❌ Sadece ${remaining} oyuncu seçebilirsiniz!`);
        return;
    }
    
    const foundPlayers = [];
    for (const playerName of inputPlayers) {
        const foundPlayer = session.remainingPlayers.find(p => 
            p.toLowerCase() === playerName.toLowerCase()
        );
        if (foundPlayer) {
            foundPlayers.push(foundPlayer);
        } else {
            message.reply(`❌ ${playerName} bulunamadı.`);
            return;
        }
    }
    
    foundPlayers.forEach(player => {
        if (session.currentTurn === 'blue') {
            session.blueTeam.push(player);
        } else {
            session.redTeam.push(player);
        }
        session.remainingPlayers = session.remainingPlayers.filter(p => p !== player);
    });
    
    await message.reply(`✅ ${foundPlayers.join(', ')} eklendi!`);
    
    session.currentTurnPicks += foundPlayers.length;
    
    if (session.currentTurnPicks >= currentPickCount) {
        session.currentTurn = session.currentTurn === 'blue' ? 'red' : 'blue';
        session.currentPick++;
        session.currentTurnPicks = 0;
    }
    
    if (session.remainingPlayers.length === 0) {
        const embed = await showFinalTeams(message, session);
        const msg = await message.channel.send({ embeds: [embed] });
        session.reactionMessageId = msg.id;
        session.waitingForReaction = true;
        session.step = 'reshuffleConfirm';
        await msg.react('🔄');
        await msg.react('✅');
    } else {
        await showTeamsAndAskPick(message, session);
    }
}

async function handleReshuffleConfirm(message, session, content) {
    if (content.toLowerCase() === 'evet') {
        if (session.teamMode === 'random') {
            const embed = await createRandomTeams(message, session);
            const msg = await message.channel.send({ embeds: [embed] });
            session.reactionMessageId = msg.id;
            session.waitingForReaction = true;
            await msg.react('🔄');
            await msg.react('✅');
        } else {
            session.blueTeam = [];
            session.redTeam = [];
            session.remainingPlayers = [...session.players];
            session.currentTurn = 'blue';
            session.currentPick = 0;
            await askCaptains(message, session);
        }
    } else if (content.toLowerCase() === 'hayır') {
        await message.reply('✅ Takımlar kesinleşti! İyi oyunlar!');
        sessions.delete(session.userId);
    } else {
        message.reply('Lütfen "evet" veya "hayır" yazın.');
    }
}

// Basit yardımcı fonksiyonlar
async function handleGameModeSelection(message, session, content) {
    if (content === '1') {
        session.gameMode = 'sihirdar';
        await askTeamMode(message, session);
    } else if (content === '2') {
        session.gameMode = 'aram';
        await askAramMode(message, session);
    } else {
        message.reply('Lütfen 1 veya 2 yazın.');
    }
}

async function askAramMode(message, session) {
    const embed = new EmbedBuilder()
        .setTitle('⚔️ **ARAM MODU SEÇİMİ** ⚔️')
        .setDescription('🔥 **ARAM İÇİN TAKIM SEÇİMİ** 🔥')
        .addFields(
            { name: '🎯 **SEÇENEK 1 - SIRALI SEÇİM**', value: '║ 👑 Kaptanlar seçer ║', inline: true },
            { name: '🎲 **SEÇENEK 2 - HEPSİ RASTGELE**', value: '║ ⚡ Tam otomatik ║', inline: true }
        )
        .setColor('#ff0000');
    
    session.step = 'teamMode';
    session.waitingForReaction = true;
    const msg = await message.channel.send({ embeds: [embed] });
    session.reactionMessageId = msg.id;
    
    await msg.react('1️⃣');
    await msg.react('2️⃣');
}

async function handleTeamModeSelection(message, session, content) {
    if (content === '1') {
        session.teamMode = session.gameMode === 'aram' ? 'sequential' : 'captain';
    } else if (content === '2') {
        session.teamMode = 'random';
    } else {
        message.reply('Lütfen 1 veya 2 yazın.');
        return;
    }
    
    await askPlayerNames(message, session);
}

async function createPoll(message, session) {
    message.reply('📊 **Anket özelliği geliştiriliyor...**');
}

async function handlePollVote(reaction, user, session) {
    // Poll özelliği için placeholder
}

client.login(process.env.DISCORD_TOKEN);