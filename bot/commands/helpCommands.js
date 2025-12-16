const { EmbedBuilder } = require('discord.js');

// Yardım komutu
async function showHelp(message) {
    const embed = new EmbedBuilder()
        .setTitle('📚 **BOT KOMUTLARI REHBERİ** 📚')
        .setDescription('🎮 **Tüm komutlar ve kullanım örnekleri** 🎮')
        .addFields(
            {
                name: '🎯 **TAKIM OLUŞTURMA (LoL)**',
                value: '`!vs` - Takım seçim menüsü\n' +
                       '`!vs-aram-rastgele-@oyuncu1 @oyuncu2...` - Hızlı rastgele\n' +
                       '`!vs-sihirdar-kaptanli-@oyuncu1 @oyuncu2...` - Kaptanlı seçim\n' +
                       '`!iptal` - Aktif işlemi iptal et',
                inline: false
            },
            {
                name: '♟️ **TFT SİSTEMİ**',
                value: '`!tft-120-solo` - 120 dakika sonra solo oyun\n' +
                       '`!tft-60-double` - 60 dakika sonra çift oyun\n' +
                       '`!tft-21s-solo` - Saat 21:00\'da solo oyun\n' +
                       '⚡ Emojiye tıklayarak katıl/ayrıl',
                inline: false
            },
            {
                name: '🏆 **LİG SİSTEMİ**',
                value: '`lig-kayıt` - Lig\'e kayıt ol\n' +
                       '`!leaderboard` - Liderlik tablosu\n' +
                       '`!wr-oyuncuadı` - Oyuncu istatistikleri\n' +
                       '`!maç-kayıt` - Maç geçmişi\n' +
                       '`!maç-sonuç-ID-mavi` - Maç sonucu kaydet',
                inline: false
            },
            {
                name: '🎮 **ROL SİSTEMİ**',
                value: '`!rol` - Oyun rolleri menüsü\n' +
                       '🎮 LoL | ♟️ TFT | 🎲 Risk | ⚔️ Northgard\n' +
                       'Emojilere tıklayarak rol al/bırak',
                inline: false
            },
            {
                name: '🔧 **DİĞER KOMUTLAR**',
                value: '`!ping` - Bot durumu\n' +
                       '`boş-kayıt-sil` - Tamamlanmamış maçları sil\n' +
                       '`!yardım` - Bu yardım menüsü',
                inline: false
            }
        )
        .setColor('#00ff00')
        .setFooter({ text: '🎮 Amazon Q Bot | Tüm komutlar' })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

module.exports = {
    showHelp
};