# ⚡ Hızlı Komutlar

## 📂 Önce bot klasörüne gidin:
```bash
cd C:\Dc_egg_bot\bot
```

## 🧪 Testler

### 1. Firebase Bağlantı Testi
```bash
node test-firebase.js
```

### 2. Firebase Listener Testi
**Terminal 1:**
```bash
node test-listener.js
```

**Terminal 2 (yeni terminal):**
```bash
cd C:\Dc_egg_bot\bot
node create-test-match.js
```

### 3. Bot'u Başlat
```bash
npm start
```

## 🔧 Sorun mu var?

### .env dosyasını kontrol et:
```bash
notepad .env
```

Şunlar dolu olmalı:
- FIREBASE_PROJECT_ID=egg-bot-dashboard
- FIREBASE_PRIVATE_KEY_ID=...
- FIREBASE_PRIVATE_KEY="-----BEGIN..."
- FIREBASE_CLIENT_EMAIL=...
- FIREBASE_CLIENT_ID=...
- FIREBASE_CLIENT_CERT_URL=...

### Service Account bilgilerini al:
1. https://console.firebase.google.com/project/egg-bot-dashboard/settings/serviceaccounts/adminsdk
2. "Generate new private key" tıkla
3. JSON dosyasını indir
4. JSON'daki bilgileri .env'ye kopyala

## ✅ Başarılı Kurulum

Şunları görmelisiniz:

**test-firebase.js:**
```
✅ Firebase bağlantısı çalışıyor!
```

**npm start:**
```
✅ Bot BotName#1234 olarak giriş yaptı!
✅ Firebase listener aktif!
👂 Yeni maçlar bekleniyor...
```

**Dashboard'dan maç oluştur:**
```
📡 Snapshot alındı!
✅ YENİ MAÇ ALGILANDI: TFT
✅ Maç bildirimi gönderildi
```

**Discord'da:**
- #content-etkinlik-duyuru → Embed mesajı
- #sohbet → @TFT etiketli mesaj
- TFT rolüne DM
