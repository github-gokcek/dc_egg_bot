const { EmbedBuilder } = require('discord.js');
const { createTftGame } = require('./tftCommands');

// TFT handler fonksiyonları
async function handleTftGameType(message, session, content) {
    if (!['1', '2', '3'].includes(content)) {
        const msg = await message.reply('❌ Lütfen 1, 2 veya 3 yazın.');
        session.messageIds.push(msg.id);
        return;
    }
    
    if (content === '1') {
        session.gameType = 'solo';
    } else if (content === '2') {
        session.gameType = 'double';
    } else {
        session.gameType = null; // Belirsiz
    }
    
    // Önceki mesajları sil
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // Zaman türü sorusu
    const embed = new EmbedBuilder()
        .setTitle('⏰ **ZAMAN TÜRÜ** ⏰')
        .setDescription('🔥 **Ne zaman oynayacaksınız?** 🔥')
        .addFields(
            { name: '🚀 **1 - DAKİKA SONRA**', value: 'X dakika sonra başla', inline: true },
            { name: '🕐 **2 - BELİRLİ SAAT**', value: 'Saat belirle', inline: true }
        )
        .setColor('#ff6600');
    
    const msg = await message.channel.send({ embeds: [embed] });
    session.messageIds.push(msg.id);
    session.step = 'tftTimeType';
}

async function handleTftTimeType(message, session, content) {
    if (!['1', '2'].includes(content)) {
        const msg = await message.reply('❌ Lütfen 1 veya 2 yazın.');
        session.messageIds.push(msg.id);
        return;
    }
    
    session.timeType = content === '1' ? 'minutes' : 'fixed';
    
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // Zaman değeri sorusu
    let embed;
    if (session.timeType === 'minutes') {
        embed = new EmbedBuilder()
            .setTitle('⏱️ **DAKİKA GİRİŞİ** ⏱️')
            .setDescription('🔥 **Kaç dakika sonra başlayacak?** 🔥')
            .addFields({ name: '📝 **Örnekler:**', value: '60 (1 saat sonra)\n120 (2 saat sonra)', inline: false })
            .setColor('#ffff00');
    } else {
        embed = new EmbedBuilder()
            .setTitle('🕐 **SAAT GİRİŞİ** 🕐')
            .setDescription('🔥 **Saat kaçta başlayacak?** 🔥')
            .addFields({ name: '📝 **Örnekler:**', value: '21 (saat 21:00)\n21.30 (saat 21:30)', inline: false })
            .setColor('#ffff00');
    }
    
    const msg = await message.channel.send({ embeds: [embed] });
    session.messageIds.push(msg.id);
    session.step = 'tftTimeValue';
}

async function handleTftTimeValue(message, session, content) {
    const input = content.trim();
    
    if (session.timeType === 'minutes') {
        const minutes = parseInt(input);
        if (isNaN(minutes) || minutes <= 0) {
            const msg = await message.reply('❌ Geçersiz dakika! Pozitif sayı yazın.');
            session.messageIds.push(msg.id);
            return;
        }
        session.timeValue = minutes;
    } else {
        // Saat formatı
        let hour, minute = 0;
        if (input.includes('.')) {
            const parts = input.split('.');
            hour = parseInt(parts[0]);
            minute = parseInt(parts[1]);
        } else {
            hour = parseInt(input);
        }
        
        if (isNaN(hour) || hour < 0 || hour > 23 || (minute && (isNaN(minute) || minute < 0 || minute > 59))) {
            const msg = await message.reply('❌ Geçersiz saat formatı! Örnek: 21 veya 21.30');
            session.messageIds.push(msg.id);
            return;
        }
        
        session.timeValue = { hour, minute };
    }
    
    await deleteMessages(message.channel, session.messageIds);
    session.messageIds = [];
    
    // TFT oyunu oluştur
    await createFinalTftGame(message, session);
}

async function createFinalTftGame(message, session) {
    // Eski TFT komut formatına çevir
    let commandParts = ['!tft'];
    
    if (session.timeType === 'minutes') {
        commandParts.push(session.timeValue.toString());
    } else {
        const { hour, minute } = session.timeValue;
        commandParts.push(`${hour}${minute ? '.' + minute : ''}s`);
    }
    
    if (session.gameType) {
        commandParts.push(session.gameType);
    }
    
    // Fake message objesi oluştur - tüm gerekli özellikleri kopyala
    const fakeMessage = {
        author: message.author,
        guild: message.guild,
        channel: message.channel,
        client: message.client,
        reply: message.reply.bind(message),
        content: commandParts.join('-')
    };
    
    // Mevcut TFT sistemi ile oyun oluştur
    try {
        await createTftGame(fakeMessage);
    } catch (error) {
        console.error('TFT oyun oluşturma hatası:', error);
        await message.channel.send('❌ TFT oyunu oluşturulurken hata oluştu.');
    }
    
    // Session'ı temizle
    const indexModule = require('../index');
    if (indexModule.sessions) {
        indexModule.sessions.delete(session.userId);
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
    handleTftGameType,
    handleTftTimeType,
    handleTftTimeValue,
    createFinalTftGame,
    deleteMessages
};