# 🎯 DC Egg Bot v2.0 - Master Dokümantasyon

## 📋 İçindekiler
1. [Mimari Özet](#mimari-özet)
2. [Temel Prensipler](#temel-prensipler)
3. [Kurulum](#kurulum)
4. [Kullanım Akışları](#kullanım-akışları)
5. [Dosya Yapısı](#dosya-yapısı)
6. [Önemli Notlar](#önemli-notlar)

---

## 🏗️ Mimari Özet

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD (React)                     │
│  - Maç Oluşturma                                        │
│  - Sonuç Girişi                                         │
│  - Leaderboard                                          │
│  - Yönetim                                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE FIRESTORE                          │
│  Collections:                                           │
│  - matches (maçlar)                                     │
│  - lolLeague (LoL istatistikleri)                      │
│  - tftLeague (TFT istatistikleri)                      │
│  - matchResults (sonuçlar)                             │
│  - logs (işlem logları)                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DISCORD BOT (Listener)                      │
│  - Firebase dinleme                                     │
│  - Bildirim gönderme                                    │
│  - Emoji reaction yönetimi                             │
│  - Otomatik rol atama                                   │
│  - Lig kaydı yapma                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 DISCORD SERVER                           │
│  Kanallar:                                              │
│  - #content-etkinlik-duyuru (maç duyuruları)           │
│  - #sohbet (anlık bildirimler)                         │
│                                                         │
│  Roller:                                                │
│  - LoL (League of Legends)                             │
│  - TFT (Teamfight Tactics)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Temel Prensipler

### ❌ YAPILMAYACAKLAR
- Discord bot komut almaz
- Discord'dan maç oluşturulamaz
- Discord'dan sonuç girilemez
- Eski komutlar (`!vs`, `!tft`, vb.) çalışmaz

### ✅ YAPILACAKLAR
- Tüm işlemler Dashboard'dan yapılır
- Bot sadece Firebase'i dinler
- Bot sadece bildirim gönderir
- Bot sadece emoji reaction'ları yönetir
- Otomatik rol ve lig kaydı yapar

---

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js 16+
- Firebase projesi
- Discord bot token
- Discord sunucusu

### 2. Hızlı Kurulum
```bash
cd bot
SETUP.bat
```

### 3. Manuel Kurulum
```bash
# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle
# Discord ve Firebase bilgilerini gir

# Botu başlat
npm start
```

### 4. Firebase Kurulumu
1. Firebase Console'da proje oluştur
2. Firestore Database'i etkinleştir
3. Service Account oluştur
4. JSON bilgilerini .env'ye ekle

### 5. Discord Kurulumu
1. Developer Portal'da bot oluştur
2. Token'ı kopyala
3. Bot'u sunucuya ekle
4. Gerekli kanalları ve rolleri oluştur

---

## 📊 Kullanım Akışları

### Maç Oluşturma Akışı

```
Dashboard
  ↓
1. Oyun Seç (LoL/TFT)
  ↓
2. Mod Seç (LoL: ARAM/Sihirdar, TFT: Solo/Double)
  ↓
3. Takım Tipi (Rastgele/Kaptanlı)
  ↓
4. Zamanlama (Şimdi/İleri Tarih)
  ↓
5. Oyuncular Hazır mı? (Evet/Hayır)
  ↓
  ├─ Evet → İsimleri Gir
  │   ↓
  │   └─ Şimdi + Kaptanlı → Kaptanları Seç
  │
  └─ Hayır → Emoji Sistemi Aktif
  ↓
Firebase'e Kaydet
  ↓
Bot Bildirimi Gönderir
  ↓
Discord'da Duyuru
```

### Katılım Akışı (Emoji Sistemi)

```
Oyuncu
  ↓
🎯 Emojisine Tıklar
  ↓
Bot Algılar
  ↓
├─ Rol Yoksa → Rol Ver
├─ Lig Kaydı Yoksa → Kayıt Yap
└─ Maça Ekle
  ↓
Firebase Güncelle
  ↓
Embed Güncelle
  ↓
Sohbet Kanalına Bildir
  ↓
Oyuncuya DM Gönder
```

### Sonuç Girme Akışı

```
Dashboard
  ↓
1. Maç ID Seç
  ↓
2. Kazanan/Sıralama Gir
  ↓
3. Oyuncu İstatistikleri Gir
  ↓
Firebase'e Kaydet
  ↓
├─ matchResults collection'a ekle
├─ matches collection'da completed: true
└─ lolLeague/tftLeague güncelle
  ↓
Leaderboard Otomatik Güncellenir
```

---

## 📁 Dosya Yapısı

```
Dc_egg_bot/
├── bot/
│   ├── services/
│   │   ├── firebaseAdmin.js       # Firebase Admin SDK
│   │   └── firebaseListener.js    # Firebase dinleyici + reaction handler
│   │
│   ├── commands/
│   │   └── roleCommands.js        # Rol sistemi (emoji ile)
│   │
│   ├── index-dashboard.js         # ✅ YENİ - Ana bot dosyası
│   ├── index.js                   # ❌ ESKİ - Deprecated
│   │
│   ├── package.json               # Bağımlılıklar
│   ├── .env                       # Yapılandırma
│   ├── .env.example               # Örnek yapılandırma
│   │
│   └── SETUP.bat                  # Hızlı kurulum scripti
│
├── docs/
│   ├── README_v2.md               # Ana README
│   ├── FIREBASE_DATA_MODEL.md     # Firebase veri yapısı
│   ├── DASHBOARD_GUIDE.md         # Dashboard API kılavuzu
│   ├── DASHBOARD_COMPONENTS.md    # React component örnekleri
│   └── MASTER_DOCUMENTATION.md    # Bu dosya
│
└── README.md                      # Eski README (referans)
```

---

## 🔑 Önemli Notlar

### Firebase Collections

#### matches
```javascript
{
  game: "lol" | "tft",
  gameMode: "aram" | "sihirdar" | null,
  teamMode: "random" | "captain",
  timing: "now" | "scheduled",
  playersReady: boolean,
  maxPlayers: 10 | 8,
  participants: [],
  blueCaptain: string | null,
  redCaptain: string | null,
  status: "scheduled" | "completed",
  completed: boolean
}
```

#### lolLeague
```javascript
{
  userId: string,
  username: string,
  wins: number,
  losses: number,
  gamesPlayed: number,
  roles: { top, jungle, mid, adc, support },
  champions: { championName: { games, wins } }
}
```

#### tftLeague
```javascript
{
  userId: string,
  username: string,
  gamesPlayed: number,
  averagePlacement: number,
  placements: { first, second, ..., eighth },
  compositions: { compName: { games, avgPlacement } }
}
```

### Discord Kanalları
- `#content-etkinlik-duyuru` - Maç duyuruları (embed + emoji)
- `#sohbet` - Anlık bildirimler (metin)

### Discord Rolleri
- `LoL` - League of Legends oyuncuları
- `TFT` - Teamfight Tactics oyuncuları

### Emoji Sistemi
- 🎯 - Maça katıl/ayrıl
- Otomatik rol verme
- Otomatik lig kaydı
- Real-time güncelleme

### Bildirim Sistemi
1. **Maç Oluşturulduğunda:**
   - Etkinlik kanalına embed
   - İlgili rol sahiplerine DM (sadece emoji sistemi aktifse)
   - Sohbet kanalına bildirim

2. **Oyuncu Katıldığında:**
   - Embed güncellenir
   - Sohbet kanalına bildirim (X/10 kişi)
   - Oyuncuya DM onayı

3. **Lobi Dolduğunda:**
   - Sohbet kanalına özel bildirim
   - "Oyun başlayabilir!" mesajı

### Zamanlama Mantığı

| Zaman | Takım | Kaptanlar |
|-------|-------|-----------|
| Şimdi | Kaptanlı | Dashboard'dan seçilir |
| Şimdi | Rastgele | Otomatik |
| İleri | Kaptanlı | Discord'da sonra seçilir |
| İleri | Rastgele | Otomatik |

### Oyuncu Hazır Mantığı

| Hazır | Sonuç |
|-------|-------|
| Evet | İsimler dashboard'dan girilir, emoji kapalı |
| Hayır | Emoji sistemi aktif, DM gönderilir |

---

## 🐛 Sorun Giderme

### Bot çevrimiçi ama bildirim gelmiyor
```bash
# Console'u kontrol et
npm start

# Şunları kontrol et:
# - Firebase bağlantısı
# - Kanal isimleri (#content-etkinlik-duyuru, #sohbet)
# - Bot izinleri
```

### Emoji reaction çalışmıyor
```bash
# Bot izinlerini kontrol et:
# - Add Reactions
# - Manage Roles
# - Read Message History

# Partials ayarlarını kontrol et (index-dashboard.js)
```

### Firebase hatası
```bash
# .env dosyasını kontrol et
# - FIREBASE_PRIVATE_KEY formatı
# - Tüm bilgiler doğru mu?

# Service Account JSON'unu yeniden indir
```

### Dashboard bağlanamıyor
```bash
# Firebase config'i kontrol et
# - API Key
# - Project ID
# - Auth Domain

# Firestore Rules'u kontrol et
```

---

## 📚 Ek Kaynaklar

- [Firebase Dokümantasyonu](https://firebase.google.com/docs)
- [Discord.js Kılavuzu](https://discordjs.guide/)
- [React Dokümantasyonu](https://react.dev/)

---

## 🎯 Hızlı Başlangıç Checklist

- [ ] Node.js yüklü
- [ ] Firebase projesi oluşturuldu
- [ ] Discord bot oluşturuldu
- [ ] .env dosyası yapılandırıldı
- [ ] Discord kanalları oluşturuldu (#content-etkinlik-duyuru, #sohbet)
- [ ] Discord rolleri oluşturuldu (LoL, TFT)
- [ ] Bot sunucuya eklendi
- [ ] Bot başlatıldı (`npm start`)
- [ ] Dashboard kuruldu
- [ ] Test maçı oluşturuldu

---

**v2.0 - Dashboard-First Architecture**
*Tüm işlemler Dashboard'dan, Bot sadece dinler ve bildirir.*
