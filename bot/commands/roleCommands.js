const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Oyun rolleri ve emojileri
const GAME_ROLES = {
    '🏆': 'LoL',
    '♟️': 'TFT', 
    '🎲': 'Risk',
    '⚔️': 'Northgard'
};

// Rol mesajı oluştur
async function createRoleMessage(message) {
    const embed = new EmbedBuilder()
        .setTitle('🎮 **OYUN ROLLERİ** 🎮')
        .setDescription('🔥 **Oynadığınız oyunlar için emoji\'lere tıklayın!** 🔥\n\n' +
            '🏆 **League of Legends** - LoL rolleri için\n' +
            '♟️ **Teamfight Tactics** - TFT rolleri için\n' +
            '🎲 **Risk** - Risk rolleri için\n' +
            '⚔️ **Northgard** - Northgard rolleri için\n\n' +
            '✅ **Emoji\'ye tıklayarak rol alabilir/bırakabilirsiniz**')
        .setColor('#00ff00')
        .setFooter({ text: '🎮 Rol Sistemi | Amazon Q Bot' })
        .setTimestamp();

    const msg = await message.channel.send({ embeds: [embed] });
    
    // Emojileri ekle
    for (const emoji of Object.keys(GAME_ROLES)) {
        await msg.react(emoji);
    }
    
    return msg;
}

// Rol reaction handler
async function handleRoleReaction(reaction, user, isAdd) {
    if (user.bot) return;
    
    const emoji = reaction.emoji.name;
    const roleName = GAME_ROLES[emoji];
    
    if (!roleName) return;
    
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    
    // Mevcut rolü bul
    const role = guild.roles.cache.find(r => r.name === roleName);
    
    if (!role) {
        console.error(`❌ ${roleName} rolü bulunamadı`);
        return;
    }
    
    // Rol ekle/çıkar
    try {
        if (isAdd) {
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                console.log(`✅ ${user.username} kullanıcısına ${roleName} rolü verildi`);
            }
        } else {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                console.log(`❌ ${user.username} kullanıcısından ${roleName} rolü alındı`);
            }
        }
    } catch (error) {
        console.error(`❌ Rol işlemi başarısız:`, error);
    }
}

// Rol renkleri
function getColorForRole(roleName) {
    const colors = {
        'LoL': '#C89B3C',
        'TFT': '#463714', 
        'Risk': '#FF0000',
        'Northgard': '#4A90E2'
    };
    return colors[roleName] || '#99AAB5';
}

module.exports = {
    createRoleMessage,
    handleRoleReaction,
    GAME_ROLES
};