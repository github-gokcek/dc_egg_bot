const { EmbedBuilder } = require('discord.js');

// VS adım adım handler fonksiyonları
async function handleVsGameMode(message, session, content) {
    if (!['1', '2'].includes(content)) {
        const msg = await message.reply('❌ Lütfen 1 veya 2 yazın.');
        session.messageIds.push(msg.id);
        return;
    }
    
    session.gameMode = content === '1' ? 'sihirdar' : 'aram';
    
    // Önceki mesajları sil
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // Takım modu sorusu
    const embed = new EmbedBuilder()
        .setTitle('👥 **TAKIM MODU SEÇİMİ** 👥')
        .setDescription('🔥 **Takımlar nasıl oluşturulsun?** 🔥')
        .addFields(
            { name: '👑 **1 - KAPTANLI**', value: 'Kaptanlar seçer', inline: true },
            { name: '🎲 **2 - RASTGELE**', value: 'Otomatik karıştır', inline: true }
        )
        .setColor('#00ff00');
    
    const msg = await message.channel.send({ embeds: [embed] });
    session.messageIds.push(msg.id);
    session.step = 'teamMode';
}

async function handleVsTeamMode(message, session, content) {
    if (!['1', '2'].includes(content)) {
        const msg = await message.reply('❌ Lütfen 1 veya 2 yazın.');
        session.messageIds.push(msg.id);
        return;
    }
    
    session.teamMode = content === '1' ? 'captain' : 'random';
    
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // Oyuncu sayısı sorusu
    const embed = new EmbedBuilder()
        .setTitle('🔢 **OYUNCU SAYISI** 🔢')
        .setDescription('🔥 **Kaç kişi oynayacak?** 🔥')
        .addFields(
            { name: '⚡ **1 - 10 KİŞİ**', value: '5v5 tam takım', inline: true },
            { name: '🎯 **2 - 6 KİŞİ**', value: '3v3 küçük takım', inline: true }
        )
        .setColor('#ffff00');
    
    const msg = await message.channel.send({ embeds: [embed] });
    session.messageIds.push(msg.id);
    session.step = 'playerCount';
}

async function handleVsPlayerCount(message, session, content) {
    if (!['1', '2'].includes(content)) {
        const msg = await message.reply('❌ Lütfen 1 veya 2 yazın.');
        session.messageIds.push(msg.id);
        return;
    }
    
    session.playerCount = content === '1' ? 10 : 6;
    
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // Zaman sorusu
    const embed = new EmbedBuilder()
        .setTitle('⏰ **OYUN ZAMANI** ⏰')
        .setDescription('🔥 **Ne zaman oynayacaksınız?** 🔥')
        .addFields(
            { name: '🚀 **1 - ŞİMDİ**', value: 'Hemen başla', inline: true },
            { name: '🕐 **2 - BELİRLİ SAAT**', value: 'Saat belirle', inline: true }
        )
        .setColor('#ff6600');
    
    const msg = await message.channel.send({ embeds: [embed] });
    session.messageIds.push(msg.id);
    session.step = 'gameTime';
}

async function handleVsGameTime(message, session, content) {
    if (content === '1') {
        session.gameTime = 'now';
        await deleteMessages(message.channel, session.messageIds);
        session.messageIds = [];
        await askPlayerNames(message, session);
    } else if (content === '2') {
        session.gameTime = 'later';
        await deleteMessages(message.channel, session.messageIds);
        session.messageIds = [];
        
        const embed = new EmbedBuilder()
            .setTitle('🕐 **SAAT GİRİŞİ** 🕐')
            .setDescription('🔥 **Saat kaçta oynayacaksınız?** 🔥')
            .addFields({ name: '📝 **Örnekler:**', value: '21 (saat 21:00)\n21.30 (saat 21:30)', inline: false })
            .setColor('#ff6600');
        
        const msg = await message.channel.send({ embeds: [embed] });
        session.messageIds.push(msg.id);
        session.step = 'timeInput';
    } else {
        const msg = await message.reply('❌ Lütfen 1 veya 2 yazın.');
        session.messageIds.push(msg.id);
    }
}

async function handleVsTimeInput(message, session, content) {
    const timeInput = content.trim();
    
    // Saat formatını kontrol et
    let hour, minute = 0;
    if (timeInput.includes('.')) {
        const parts = timeInput.split('.');
        hour = parseInt(parts[0]);
        minute = parseInt(parts[1]);
    } else {
        hour = parseInt(timeInput);
    }
    
    if (isNaN(hour) || hour < 0 || hour > 23 || (minute && (isNaN(minute) || minute < 0 || minute > 59))) {
        const msg = await message.reply('❌ Geçersiz saat formatı! Örnek: 21 veya 21.30');
        session.messageIds.push(msg.id);
        return;
    }
    
    session.gameTime = `${hour}:${minute.toString().padStart(2, '0')}`;
    
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    await askPlayerNames(message, session);
}

async function askPlayerNames(message, session) {
    if (session.gameTime === 'now') {
        // Şimdi oynayacaksa oyuncu isimlerini sor
        const embed = new EmbedBuilder()
            .setTitle('👥 **OYUNCU İSİMLERİ** 👥')
            .setDescription(`🔥 **${session.playerCount} oyuncunun ismini boşlukla ayırarak yazın** 🔥`)
            .addFields({ 
                name: '📝 **Örnek:**', 
                value: session.playerCount === 10 ? 
                    'ali veli ahmet ayşe fatma nurgül su gizem akın adem' :
                    'ali veli ahmet ayşe fatma nurgül',
                inline: false 
            })
            .setColor('#9b59b6');
        
        const msg = await message.channel.send({ embeds: [embed] });
        session.messageIds.push(msg.id);
        session.step = 'playerNames';
    } else {
        // İleri tarihte oynayacaksa direkt lobi oluştur
        session.players = [];
        await createFinalVsPanel(message, session);
    }
}

async function handleVsPlayerNames(message, session, content) {
    const inputParts = content.split(' ').filter(name => name.trim() !== '');
    
    if (inputParts.length !== session.playerCount) {
        const msg = await message.reply(`❌ ${session.playerCount} oyuncu gerekli, ${inputParts.length} oyuncu girdiniz.`);
        session.messageIds.push(msg.id);
        return;
    }
    
    // Etiket ve isim karışımını işle
    const players = [];
    const playerMap = new Map(); // userId -> username mapping
    
    for (const part of inputParts) {
        if (part.startsWith('<@') && part.endsWith('>')) {
            // Etiket formatı
            const userId = part.slice(2, -1).replace('!', '');
            try {
                const user = await message.client.users.fetch(userId);
                players.push(user.username);
                playerMap.set(userId, user.username);
            } catch (error) {
                const msg = await message.reply(`❌ Geçersiz kullanıcı etiketi: ${part}`);
                session.messageIds.push(msg.id);
                return;
            }
        } else {
            // Normal isim
            players.push(part);
        }
    }
    
    session.players = players;
    session.playerMap = playerMap; // Etiket-isim eşleştirmesi için
    
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // Final panel oluştur
    await createFinalVsPanel(message, session);
}

async function createFinalVsPanel(message, session) {
    // LoL rolünü etiketle
    const guild = message.guild;
    const lolRole = guild.roles.cache.find(r => r.name === 'LoL');
    let roleText = '';
    if (lolRole) {
        roleText = `${lolRole} `;
    }
    
    if (session.gameTime === 'now') {
        // Şimdi oynayacaksa takımları oluştur
        if (session.teamMode === 'random') {
            const shuffled = [...session.players].sort(() => Math.random() - 0.5);
            const teamSize = session.playerCount / 2;
            session.blueTeam = shuffled.slice(0, teamSize);
            session.redTeam = shuffled.slice(teamSize);
            
            const embed = createVsFinalEmbed(session);
            const etkinlikChannel = guild.channels.cache.find(ch => ch.name === 'content-etkinlik-duyuru');
            
            let msg;
            if (etkinlikChannel) {
                msg = await etkinlikChannel.send({ content: roleText, embeds: [embed] });
            } else {
                msg = await message.channel.send({ content: roleText, embeds: [embed] });
            }
            
            await msg.react('🔄'); // Karıştır
            await msg.react('✅'); // Onayla
            
        } else {
            // Kaptanlı mod - önce kaptan seçimi
            session.blueTeam = [];
            session.redTeam = [];
            session.remainingPlayers = [...session.players];
            
            const embed = new EmbedBuilder()
                .setTitle('👑 **KAPTAN SEÇİMİ** 👑')
                .setDescription('🔥 **Takım kaptanları lütfen emojiye tıklayın!** 🔥\n\n🔵 **Mavi takım kaptanı** mavi emojiye\n🔴 **Kırmızı takım kaptanı** kırmızı emojiye')
                .addFields({ name: '👥 **Oyuncular**', value: session.players.join(', '), inline: false })
                .setColor('#FFD700');
            
            const etkinlikChannel = guild.channels.cache.find(ch => ch.name === 'content-etkinlik-duyuru');
            
            let msg;
            if (etkinlikChannel) {
                msg = await etkinlikChannel.send({ content: roleText, embeds: [embed] });
            } else {
                msg = await message.channel.send({ content: roleText, embeds: [embed] });
            }
            
            await msg.react('🔵'); // Mavi kaptan
            await msg.react('🔴'); // Kırmızı kaptan
            
            // Session'ı aktif tut
            session.step = 'captainSelection';
            session.messageId = msg.id;
            const { sessions } = require('../index');
            sessions.set(session.userId, session);
            return;
        }
    } else {
        // İleri tarihte oynayacaksa katılım sistemi
        session.players = [];
        session.blueTeam = [];
        session.redTeam = [];
        
        // LoL rolüne sahip kullanıcılara DM gönder
        const lolRole = guild.roles.cache.find(r => r.name === 'LoL');
        if (lolRole) {
            const lolMembers = lolRole.members;
            console.log(`📬 ${lolMembers.size} LoL üyesine DM gönderiliyor...`);
            
            const modeText = session.gameMode === 'sihirdar' ? 'Sihirdar Vadisi' : 'ARAM';
            const teamModeText = session.teamMode === 'captain' ? 'Kaptanlı' : 'Rastgele';
            
            const dmEmbed = new EmbedBuilder()
                .setTitle('🏆 **YENİ VS OYUNU** 🏆')
                .setDescription(`🎮 **${message.author.username}** yeni bir VS oyunu oluşturdu!\n\n` +
                               `🎮 **Mod:** ${modeText}\n` +
                               `👥 **Takım:** ${teamModeText}\n` +
                               `🕐 **Zaman:** Saat ${session.gameTime}\n\n` +
                               `⚡ Katılmak için sunucudaki mesaja git!`)
                .setColor('#00ff00')
                .setTimestamp();
            
            for (const [userId, member] of lolMembers) {
                try {
                    await member.send({ embeds: [dmEmbed] });
                    console.log(`✅ DM gönderildi: ${member.user.username}`);
                } catch (error) {
                    console.log(`❌ DM gönderilemedi: ${member.user.username} (DM kapalı)`);
                }
            }
        }
        
        const embed = createVsFinalEmbed(session);
        const etkinlikChannel = guild.channels.cache.find(ch => ch.name === 'content-etkinlik-duyuru');
        
        let msg;
        if (etkinlikChannel) {
            msg = await etkinlikChannel.send({ content: roleText, embeds: [embed] });
        } else {
            msg = await message.channel.send({ content: roleText, embeds: [embed] });
        }
        
        await msg.react('🎯'); // Katılım için (VS emoji)
        
        // Aktif VS oyunu olarak kaydet
        const { activeTftGames } = require('./tftCommands');
        const gameId = Date.now().toString();
        activeTftGames.set(gameId, {
            id: gameId,
            type: 'vs',
            messageId: msg.id,
            session: session
        });
        
        return;
    }
    
    const { sessions } = require('../index');
    sessions.delete(session.userId);
}

function createVsFinalEmbed(session) {
    const timeText = session.gameTime === 'now' ? 'Şimdi' : `Saat ${session.gameTime}`;
    const modeText = session.gameMode === 'sihirdar' ? 'Sihirdar Vadisi' : 'ARAM';
    const teamModeText = session.teamMode === 'captain' ? 'Kaptanlı' : 'Rastgele';
    
    if (session.gameTime === 'now') {
        // Şimdi oynayacaksa takımları göster
        const embed = new EmbedBuilder()
            .setTitle('🏆 **VS OYUNU HAZIR** 🏆')
            .setDescription(`🎮 **${modeText}** | 👥 **${teamModeText}** | ⏰ **${timeText}**\n\n✅ **Takımlar hazır!**`)
            .addFields(
                { name: '🔵 **Mavi Takım**', value: session.blueTeam.join('\n') || 'Boş', inline: true },
                { name: '🔴 **Kırmızı Takım**', value: session.redTeam.join('\n') || 'Boş', inline: true },
                { name: '👥 **Toplam**', value: `${session.players.length}/${session.playerCount}`, inline: true }
            )
            .setColor('#00ff00')
            .setFooter({ text: '🎮 VS Sistemi | Amazon Q Bot' })
            .setTimestamp();
        return embed;
    } else {
        // İleri tarihte oynayacaksa katılım sistemi
        let playersText = session.players.length > 0 ? session.players.join('\n') : 'Henüz kimse katılmadı';
        
        const embed = new EmbedBuilder()
            .setTitle('🏆 **VS LOBISI** 🏆')
            .setDescription(`🎮 **${modeText}** | 👥 **${teamModeText}** | ⏰ **${timeText}**\n\n🎯 **Katılmak için emoji'ye tıklayın!**`)
            .addFields(
                { name: `👥 **Katılanlar (${session.players.length}/${session.playerCount})**`, value: playersText, inline: false }
            )
            .setColor('#FFD700')
            .setFooter({ text: '🎮 VS Sistemi | Amazon Q Bot' })
            .setTimestamp();
        return embed;
    }
}

async function deleteMessages(channel, messageIds) {
    for (const id of messageIds) {
        try {
            const msg = await channel.messages.fetch(id);
            await msg.delete();
        } catch (error) {
            console.log(`Mesaj silinemedi: ${id}`);
        }
    }
}

module.exports = {
    handleVsGameMode,
    handleVsTeamMode,
    handleVsPlayerCount,
    handleVsGameTime,
    handleVsTimeInput,
    handleVsPlayerNames,
    askPlayerNames,
    createFinalVsPanel,
    deleteMessages,
    createVsFinalEmbed
};