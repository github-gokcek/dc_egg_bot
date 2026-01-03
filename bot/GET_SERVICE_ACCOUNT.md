# 🔥 Firebase Service Account Alma Kılavuzu

## ⚠️ ÖNEMLİ
Verdiğiniz bilgiler **Web SDK** bilgileri. Bot için **Service Account** gerekli!

## 📝 Adım Adım

### 1. Firebase Console'a Git
https://console.firebase.google.com/project/egg-bot-dashboard

### 2. Project Settings'e Git
Sol üst köşede ⚙️ (ayarlar) ikonuna tıkla → **Project settings**

### 3. Service Accounts Sekmesine Git
Üstteki sekmelerden **Service accounts** sekmesine tıkla

### 4. Generate New Private Key
- **"Generate new private key"** butonuna tıkla
- Uyarıyı onayla
- JSON dosyası indirilecek

### 5. JSON Dosyasını Aç
İndirilen JSON dosyası şuna benzer:

```json
{
  "type": "service_account",
  "project_id": "egg-bot-dashboard",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@egg-bot-dashboard.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40egg-bot-dashboard.iam.gserviceaccount.com"
}
```

### 6. .env Dosyasını Güncelle

JSON'dan bilgileri kopyala ve .env dosyasına yapıştır:

```env
FIREBASE_PROJECT_ID=egg-bot-dashboard
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@egg-bot-dashboard.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40egg-bot-dashboard.iam.gserviceaccount.com
```

## ⚠️ DİKKAT

### FIREBASE_PRIVATE_KEY için:
- Tırnak içinde olmalı: `"-----BEGIN..."`
- `\n` karakterleri korunmalı
- Tek satırda olmalı

### Örnek:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## ✅ Test Et

```bash
node test-firebase.js
```

Başarılı ise: **✅ Firebase bağlantısı çalışıyor!**

## 🚀 Botu Başlat

```bash
npm start
```

## 📊 Firestore Rules

Firebase Console'da Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Test için herkese izin (production'da değiştir!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Publish** butonuna tıkla.

## 🎯 Sonraki Adımlar

1. ✅ Service Account bilgilerini .env'ye ekle
2. ✅ `npm install` çalıştır
3. ✅ `node test-firebase.js` ile test et
4. ✅ `npm start` ile botu başlat
5. ✅ Dashboard'dan test maçı oluştur
6. ✅ Discord'da bildirimi kontrol et
