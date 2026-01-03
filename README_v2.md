# 🎮 DC Egg Bot v2.0 - Dashboard-First Architecture

Discord sunucuları için geliştirilmiş **Dashboard odaklı** oyun yönetim sistemi.

## 🎯 Temel Prensipler

### ⚠️ ÖNEMLİ: Yeni Mimari
- ❌ **Discord bot komut almaz**
- ✅ **Tüm işlemler Dashboard'dan yapılır**
- 🤖 **Bot sadece pasif görevler yapar:**
  - Firebase'i dinler
  - Bildirimleri gönderir
  - Emoji reaction'ları yönetir
  - Otomatik rol atar
  - Lig kayıtları yapar

## 🏗️ Mimari

```
Dashboard (React + Firebase)
    ↓
Firebase Firestore
    ↓
Discord Bot (Listener)
    ↓
Discord Server
```

## 🚀 Özellikler

### 🎮 LoL Sistemi
- Dashboard'dan maç oluşturma
- ARAM / Sihirdar Vadisi modları
- Rastgele / Kaptanlı takım seçimi
- Şimdi / İleri tarih zamanlama
- Emoji ile katılım sistemi
- Otomatik rol ve lig kaydı
- Detaylı istatistik takibi

### ♟️ TFT Sistemi
- Dashboard'dan oyun organizasyonu
- Solo / Double oyun modları
- 8 kişilik ana liste + yedek sistemi
- Zamanlı oyun planlaması
- Sıralama bazlı istatistikler

### 🏆 Lig Sistemi
- Otomatik oyuncu kaydı
- LoL: Win rate, rol, şampiyon istatistikleri
- TFT: Ortalama sıralama, kompozisyon istatistikleri
- Leaderboard sistemi
- Maç geçmişi

### 📊 Dashboard Özellikleri
- Maç oluşturma arayüzü
- Maç sonucu girişi
- Leaderboard görüntüleme
- Log sistemi
- Boş maç temizleme
- Real-time güncellemeler

## 📋 Kurulum

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/github-gokcek/dc_egg_bot.git
cd dc_egg_bot/bot
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Firebase Kurulumu

#### a. Firebase Console'da Proje Oluşturun
1. [Firebase Console](https://console.firebase.google.com/) açın
2. Yeni proje oluşturun
3. Firestore Database'i etkinleştirin

#### b. Service Account Oluşturun
1. Project Settings → Service Accounts
2. "Generate new private key" tıklayın
3. JSON dosyasını indirin

#### c. .env Dosyası Oluşturun
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Discord Bot
APPLICATION_ID=your_application_id
PUBLIC_KEY=your_public_key
DISCORD_TOKEN=your_discord_token

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_cert_url
```

### 4. Discord Bot Kurulumu

#### a. Discord Developer Portal
1. [Discord Developer Portal](https://discord.com/developers/applications) açın
2. "New Application" tıklayın
3. Bot sekmesinden bot oluşturun
4. Token'ı kopyalayın

#### b. Bot İzinleri
Gerekli izinler:
- Send Messages
- Manage Messages
- Add Reactions
- Manage Roles
- Read Message History
- View Channels

#### c. Bot'u Sunucuya Ekleyin
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268445760&scope=bot
```

### 5. Discord Sunucu Ayarları

Gerekli kanallar:
- `#content-etkinlik-duyuru` - Maç duyuruları
- `#sohbet` - Anlık bildirimler

Gerekli roller:
- `LoL` - League of Legends oyuncuları
- `TFT` - Teamfight Tactics oyuncuları

### 6. Botu Başlatın
```bash
npm start
```

## 📁 Proje Yapısı

```
bot/
├── services/
│   ├── firebaseAdmin.js      # Firebase Admin SDK
│   └── firebaseListener.js   # Firebase dinleyici
├── commands/
│   └── roleCommands.js        # Rol sistemi
├── index-dashboard.js         # Ana bot dosyası (YENİ)
├── index.js                   # Eski bot (deprecated)
├── package.json
├── .env
└── .env.example

docs/
├── FIREBASE_DATA_MODEL.md     # Firebase veri yapısı
└── DASHBOARD_GUIDE.md         # Dashboard kullanım kılavuzu
```

## 🎯 Kullanım

### Dashboard'dan Maç Oluşturma

1. **Oyun Seçimi**: LoL veya TFT
2. **Mod Seçimi**: 
   - LoL: ARAM / Sihirdar Vadisi
   - TFT: Solo / Double
3. **Takım Tipi**: Rastgele / Kaptanlı
4. **Zamanlama**: Şimdi / İleri Tarih
5. **Oyuncu Durumu**: 
   - Hazır → İsimleri gir
   - Hazır Değil → Emoji sistemi aktif
6. **Kaptanlar** (gerekirse): Dashboard'dan seç

### Discord'da Katılım

1. `#content-etkinlik-duyuru` kanalında maç duyurusu görünür
2. 🎯 emojisine tıkla
3. Otomatik rol alınır
4. Otomatik lig kaydı yapılır
5. DM ile onay gelir

### Maç Sonucu Girme

1. Dashboard'da "Maç Sonuçları" sayfasına git
2. Maç ID'yi seç
3. Kazanan takımı/sıralamaları gir
4. Oyuncu istatistiklerini gir
5. Kaydet

## 📊 Firebase Collections

- `matches` - Tüm maçlar
- `lolLeague` - LoL oyuncu istatistikleri
- `tftLeague` - TFT oyuncu istatistikleri
- `matchResults` - Maç sonuçları
- `logs` - İşlem logları

Detaylı bilgi için: [FIREBASE_DATA_MODEL.md](FIREBASE_DATA_MODEL.md)

## 🔧 Geliştirme

### Development Mode
```bash
npm run dev
```

### Eski Bot'u Çalıştırma
```bash
npm run old
```

## 📝 Önemli Notlar

- ❌ Bot artık komut almaz (`!vs`, `!tft` vb. çalışmaz)
- ✅ Tüm işlemler Dashboard'dan yapılır
- 🔄 Firebase real-time dinleme ile otomatik senkronizasyon
- 📱 DM bildirimleri sadece emoji sistemi aktifse gönderilir
- 🎯 Emoji ile katılım otomatik rol ve lig kaydı yapar
- 🧹 Boş maçlar Dashboard'dan silinebilir

## 🐛 Sorun Giderme

### Bot çevrimiçi ama bildirim gelmiyor
- Firebase bağlantısını kontrol edin
- Console loglarını inceleyin
- Kanal isimlerini doğrulayın

### Emoji reaction çalışmıyor
- Bot izinlerini kontrol edin
- Partials ayarlarını kontrol edin

### Firebase hatası
- Service Account JSON'unu kontrol edin
- .env dosyasındaki private key formatını kontrol edin

## 📞 İletişim

Proje sahibi: [@github-gokcek](https://github.com/github-gokcek)

## 📝 Lisans

MIT License

---

**v2.0 - Dashboard-First Architecture**
