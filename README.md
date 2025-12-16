# 🎮 DC Egg Bot

Discord sunucuları için geliştirilmiş çok fonksiyonlu oyun botu.

## 🚀 Özellikler

### 🎯 Takım Oluşturma (LoL)
- Interaktif takım seçim sistemi
- Kaptanlı ve rastgele takım modları
- Hızlı komutlar ile takım oluşturma
- Maç ID sistemi ve sonuç takibi

### ♟️ TFT Sistemi
- Zamanlı oyun organizasyonu
- Solo ve double oyun modları
- Geri sayım ve sabit saat sistemi
- 8 kişilik ana liste + yedek sistemi

### 🏆 Lig Sistemi
- Oyuncu kayıt sistemi
- Win rate ve istatistik takibi
- Liderlik tablosu
- Maç geçmişi

### 🎮 Rol Sistemi
- Oyun rolleri (LoL, TFT, Risk, Northgard)
- Emoji ile rol alma/bırakma
- Otomatik etiketleme sistemi

## 📋 Komutlar

### Takım Komutları
- `!vs` - Takım seçim menüsü
- `!vs-aram-rastgele-@oyuncu1 @oyuncu2...` - Hızlı rastgele takım
- `!vs-sihirdar-kaptanli-@oyuncu1 @oyuncu2...` - Kaptanlı takım
- `!iptal` - Aktif işlemi iptal et

### TFT Komutları
- `!tft-120-solo` - 120 dakika sonra solo oyun
- `!tft-9.22s-double` - Saat 9:22'de double oyun
- `!tft-21s` - Saat 21:00'da oyun (mod seçimi)

### Lig Komutları
- `lig-kayıt` - Lig'e kayıt ol
- `!leaderboard` - Liderlik tablosu
- `!wr-oyuncuadı` - Oyuncu istatistikleri
- `!maç-sonuç-ID-mavi` - Maç sonucu kaydet

### Diğer Komutlar
- `!rol` - Oyun rolleri menüsü
- `!yardım` - Komut listesi
- `!ping` - Bot durumu

## 🛠️ Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/github-gokcek/dc_egg_bot.git
cd dc_egg_bot
```

2. Bağımlılıkları yükleyin:
```bash
cd bot
npm install
```

3. `.env` dosyası oluşturun:
```env
DISCORD_TOKEN=your_bot_token_here
```

4. Botu başlatın:
```bash
npm start
```

## 📁 Proje Yapısı

```
bot/
├── commands/           # Komut dosyaları
│   ├── leagueCommands.js
│   ├── teamCommands.js
│   ├── tftCommands.js
│   ├── roleCommands.js
│   └── helpCommands.js
├── utils/              # Yardımcı fonksiyonlar
│   └── dataManager.js
├── data/               # Veri dosyaları
│   ├── league_data.json
│   └── matches_data.json
├── index.js            # Ana bot dosyası
├── package.json
└── .env
```

## 🎯 Gereksinimler

- Node.js 16.0.0 veya üzeri
- Discord.js v14
- Geçerli Discord Bot Token

## 📝 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Proje sahibi: [@github-gokcek](https://github.com/github-gokcek)