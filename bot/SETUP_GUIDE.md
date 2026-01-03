# 🚀 Hızlı Kurulum ve Test

## 1. Firebase Kurulumu

### Firebase Console'da:
1. https://console.firebase.google.com/ adresine git
2. Yeni proje oluştur
3. Firestore Database'i etkinleştir (Test mode)
4. Project Settings → Service Accounts
5. "Generate new private key" butonuna tıkla
6. JSON dosyasını indir

### .env Dosyasını Düzenle:
JSON dosyasından bilgileri kopyala:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

## 2. Bağımlılıkları Yükle

```bash
npm install
```

## 3. Firebase Bağlantısını Test Et

```bash
node test-firebase.js
```

Başarılı ise: ✅ Firebase bağlantısı çalışıyor!

## 4. Botu Başlat

```bash
npm start
```

## 5. Dashboard'dan Test Maçı Oluştur

Dashboard'da yeni bir TFT maçı oluştur:
- Oyun: TFT
- Mod: Solo
- Zamanlama: Şimdi
- Oyuncular Hazır: Hayır

## 6. Discord'da Kontrol Et

Bot şunları yapmalı:
- ✅ #content-etkinlik-duyuru kanalına embed gönder
- ✅ @TFT rolünü etiketle
- ✅ #sohbet kanalına "@TFT 🎮 Yeni TFT maçı..." mesajı
- ✅ TFT rolüne sahip herkese DM gönder
- ✅ 🎯 emojisi ekle

## 7. Emoji ile Katılım Testi

Bir kullanıcı 🎯 emojisine tıkladığında:
- ✅ TFT rolü verilir
- ✅ tftLeague collection'a kaydedilir
- ✅ Embed güncellenir (1/8 kişi)
- ✅ #sohbet kanalına "🎮 TFT lobisi 1/8 oldu" mesajı
- ✅ Kullanıcıya DM: "✅ TFT maçına katıldınız! (1/8)"

## Sorun Giderme

### Firebase bağlanamıyor
```bash
# .env dosyasını kontrol et
# FIREBASE_PRIVATE_KEY'in formatı önemli!
# Tırnak içinde olmalı ve \n karakterleri korunmalı
```

### Bot bildirim göndermiyor
```bash
# Console loglarını kontrol et
npm start

# Şunları kontrol et:
# 1. Firebase listener başladı mı?
# 2. Kanal isimleri doğru mu? (content-etkinlik-duyuru, sohbet)
# 3. Roller var mı? (TFT, LoL)
```

### DM gönderilmiyor
```bash
# Kullanıcıların DM ayarları kapalı olabilir
# Bu normal, hata değil
# Console'da "❌ DM gönderilemedi: username" görünür
```

## Önemli Notlar

- Bot komut almaz, sadece Firebase'i dinler
- Tüm işlemler Dashboard'dan yapılır
- Emoji reaction otomatik rol verir
- Her işlem loglanır (logs collection)
