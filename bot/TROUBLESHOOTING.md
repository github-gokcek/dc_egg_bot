# 🔧 Sorun Giderme - Bot Bildirim Göndermiyor

## 🎯 Sorun
Dashboard'dan maç oluşturulduğunda Discord'da bildirim gelmiyor.

## ✅ Adım Adım Test

### 1. Firebase Bağlantısını Test Et

```bash
node test-firebase.js
```

**Beklenen:** ✅ Firebase bağlantısı çalışıyor!

**Hata alırsanız:**
- `.env` dosyasını kontrol edin
- Service Account bilgileri doğru mu?
- `FIREBASE_PRIVATE_KEY` formatı doğru mu? (tırnak içinde, \n korunmuş)

---

### 2. Firebase Listener'ı Test Et

**Terminal 1:**
```bash
node test-listener.js
```

**Terminal 2:**
```bash
node create-test-match.js
```

**Beklenen:** Terminal 1'de "YENİ MAÇ ALGILANDI!" mesajı

**Görmüyorsanız:**
- Firebase Rules kontrol edin (read/write izni var mı?)
- Internet bağlantısı var mı?
- Firestore Database oluşturuldu mu?

---

### 3. Bot'u Başlat ve Logları İzle

```bash
npm start
```

**Beklenen Console Çıktısı:**
```
✅ Bot BotName#1234 olarak giriş yaptı!
🎯 Dashboard-First Mimari Aktif
📡 Firebase listener başlatılıyor...
🔥 Firebase listener başlatılıyor...
📊 Collection: matches
🔍 Filter: status == "scheduled"

✅ Firebase listener aktif!
👂 Yeni maçlar bekleniyor...

🚀 Bot hazır ve Firebase dinleniyor!
```

**Görmüyorsanız:**
- Bot token doğru mu?
- Internet bağlantısı var mı?
- Discord API'ye erişim var mı?

---

### 4. Dashboard'dan Test Maçı Oluştur

Dashboard'da:
1. Yeni Maç
2. Oyun: TFT
3. Mod: Solo
4. Zamanlama: Şimdi
5. Oyuncular Hazır: Hayır
6. Oluştur

**Bot Console'da Beklenen:**
```
📡 Snapshot alındı! (14:30:45)
📊 Toplam döküman: 1
🔔 Değişiklik: added - Doc ID: abc12345...
✅ YENİ MAÇ ALGILANDI: TFT
✅ Maç bildirimi gönderildi: abc12345...
```

**Discord'da Beklenen:**
- `#content-etkinlik-duyuru` kanalında embed
- `#sohbet` kanalında "@TFT 🎮 Yeni TFT maçı..." mesajı
- TFT rolüne sahip kullanıcılara DM

---

## 🔍 Yaygın Sorunlar

### Sorun 1: "Firebase listener başladı" ama değişiklik algılanmıyor

**Çözüm:**
```bash
# Firestore Rules kontrol et
# Firebase Console > Firestore Database > Rules
```

Rules şöyle olmalı:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

### Sorun 2: "Kanal bulunamadı" hatası

**Çözüm:**
Discord sunucusunda şu kanalları oluşturun:
- `#content-etkinlik-duyuru` (tam olarak bu isimde)
- `#sohbet` (tam olarak bu isimde)

---

### Sorun 3: "Rol bulunamadı" hatası

**Çözüm:**
Discord sunucusunda şu rolleri oluşturun:
- `TFT` (tam olarak bu isimde)
- `LoL` (tam olarak bu isimde)

---

### Sorun 4: Bot çevrimiçi ama hiçbir şey olmuyor

**Kontrol Listesi:**
- [ ] `.env` dosyasında Firebase bilgileri var mı?
- [ ] `npm install` çalıştırıldı mı?
- [ ] Bot `index-dashboard.js` ile mi başlatıldı? (`npm start`)
- [ ] Firebase Console'da Firestore Database oluşturuldu mu?
- [ ] Firestore Rules publish edildi mi?
- [ ] Discord kanalları doğru isimde mi?
- [ ] Discord rolleri var mı?

---

### Sorun 5: DM gelmiyor

**Normal!** Kullanıcıların DM ayarları kapalı olabilir.

Console'da şunu göreceksiniz:
```
❌ DM gönderilemedi: username
```

Bu bir hata değil, kullanıcı ayarlarından kaynaklanıyor.

---

## 🧪 Manuel Test

### Test 1: Firebase'e Manuel Veri Ekle

```bash
node create-test-match.js
```

5 saniye sonra:
- ✅ Bot maçı algıladı → Discord'a gönderildi
- ❌ Bot maçı algılamadı → Listener çalışmıyor

### Test 2: Listener'ı İzole Test Et

```bash
node test-listener.js
```

Başka terminalde:
```bash
node create-test-match.js
```

İlk terminalde "YENİ MAÇ ALGILANDI" görmelisiniz.

---

## 📞 Hala Çalışmıyor mu?

### Debug Modu

Bot'u şu şekilde başlatın:
```bash
npm start
```

Console'da şunları arayın:
- ❌ Kırmızı hata mesajları
- ⚠️ Sarı uyarı mesajları
- "Firebase listener aktif!" mesajı var mı?
- "Snapshot alındı!" mesajı geliyor mu?

### Logları Paylaş

Console çıktısını kopyalayın ve kontrol edin:
1. Bot giriş yaptı mı?
2. Firebase listener başladı mı?
3. Snapshot alınıyor mu?
4. Değişiklik algılanıyor mu?
5. Bildirim gönderiliyor mu?

---

## ✅ Başarılı Kurulum Kontrolü

Tüm bunlar çalışıyorsa kurulum başarılı:

1. ✅ `node test-firebase.js` → Başarılı
2. ✅ `node test-listener.js` → Değişiklikleri algılıyor
3. ✅ `npm start` → Bot başlıyor, listener aktif
4. ✅ Dashboard'dan maç oluştur → Console'da "YENİ MAÇ ALGILANDI"
5. ✅ Discord'da bildirim geliyor
6. ✅ Emoji'ye tıklayınca katılım çalışıyor
7. ✅ "lobi X/8 oldu" mesajı geliyor
