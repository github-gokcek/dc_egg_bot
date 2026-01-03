# 🔑 Firebase Service Account - Hızlı Kılavuz

## 1. Firebase Console'a Git
https://console.firebase.google.com/project/egg-bot-dashboard/settings/serviceaccounts/adminsdk

## 2. "Generate new private key" Butonuna Tıkla

## 3. JSON Dosyasını İndir

## 4. .env Dosyasını Aç
```bash
notepad .env
```

## 5. JSON'dan Bilgileri Kopyala

JSON dosyası:
```json
{
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@egg-bot-dashboard.iam.gserviceaccount.com",
  "client_id": "123456...",
  "client_x509_cert_url": "https://..."
}
```

.env dosyasına ekle:
```env
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@egg-bot-dashboard.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456...
FIREBASE_CLIENT_CERT_URL=https://...
```

## 6. Kurulumu Tamamla
```bash
npm install
npm start
```

✅ Hazır!
