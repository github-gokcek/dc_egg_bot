# ⚡ Basit Kurulum - Firebase Web SDK

## ✅ Artık Service Account Gerekmez!

Firebase Web SDK kullanıyoruz, Service Account bilgilerine gerek yok.

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükle
```bash
cd C:\Dc_egg_bot\bot
npm install
```

### 2. Firebase'i Test Et
```bash
node test-firebase.js
```

**Beklenen:** ✅ Firebase bağlantısı çalışıyor!

### 3. Bot'u Başlat
```bash
npm start
```

**Console'da göreceksiniz:**
```
✅ Bot BotName#1234 olarak giriş yaptı!
🔥 Firebase listener başlatılıyor...
✅ Firebase listener aktif!
👂 Yeni maçlar bekleniyor...
```

### 4. Dashboard'dan Maç Oluştur

TFT maçı oluşturduğunuzda:

**Bot Console:**
```
📡 Snapshot alındı!
🔔 Değişiklik: added
✅ YENİ MAÇ ALGILANDI: TFT
✅ Maç bildirimi gönderildi
```

**Discord:**
- ✅ `#content-etkinlik-duyuru` → Embed + 🎯 emoji
- ✅ `#sohbet` → "@TFT 🎮 Yeni TFT maçı..."
- ✅ TFT rolüne DM

### 5. Emoji ile Katılım

🎯 emojisine tıklayın:
- ✅ TFT rolü verilir
- ✅ Embed güncellenir (1/8)
- ✅ `#sohbet` → "🎮 TFT lobisi 1/8 oldu"
- ✅ DM → "✅ TFT maçına katıldınız!"

## 🔧 Sorun Giderme

### Firebase hatası alıyorsanız:
- Firestore Database oluşturuldu mu?
- Firestore Rules: `allow read, write: if true;`
- Internet bağlantısı var mı?

### Bot bildirim göndermiyor:
- Discord kanalları var mı? (`#content-etkinlik-duyuru`, `#sohbet`)
- Discord rolleri var mı? (`TFT`, `LoL`)
- Bot izinleri yeterli mi?

## 📝 Önemli

- ❌ Service Account gerekmez
- ✅ Firebase Web SDK kullanılıyor
- ✅ Dashboard ile aynı config
- ✅ Daha basit kurulum
