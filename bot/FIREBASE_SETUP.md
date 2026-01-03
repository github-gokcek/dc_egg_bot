# Firebase Admin SDK Kurulum Talimatları

## 1. Firebase Console'a Git
https://console.firebase.google.com/

## 2. Projeyi Seç
- egg-bot-dashboard projesini seç

## 3. Service Account Key Oluştur
1. Sol menüden "Project Settings" (⚙️) tıkla
2. "Service Accounts" sekmesine git
3. "Generate New Private Key" butonuna tıkla
4. İndirilen JSON dosyasını kaydet

## 4. JSON Dosyasını Kopyala
İndirilen JSON dosyasının içeriğini:
`C:\Dc_egg_bot\bot\services\firebaseAdmin.js`

dosyasındaki `serviceAccount` objesine yapıştır.

## 5. Bot'u Başlat
```bash
cd C:\Dc_egg_bot\bot
node index-new.js
```

## 6. Test Et
Dashboard'dan bir maç oluştur, Discord'da bildirim gelecek!

---

## Alternatif: JSON Dosyasını Direkt Kullan

Eğer JSON dosyasını kopyalamak istemezsen:

1. İndirilen dosyayı `serviceAccountKey.json` olarak kaydet
2. `C:\Dc_egg_bot\bot\services\` klasörüne kopyala
3. `firebaseAdmin.js` dosyasını şu şekilde güncelle:

```javascript
const serviceAccount = require('./serviceAccountKey.json');
```

## Güvenlik Notu
⚠️ Service account key dosyasını asla GitHub'a push etme!
`.gitignore` dosyasına ekle:
```
serviceAccountKey.json
services/firebaseAdmin.js
```
