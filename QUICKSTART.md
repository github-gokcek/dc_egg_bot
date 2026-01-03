# ⚡ Hızlı Başlangıç Kılavuzu

## 🎯 5 Dakikada Başla

### 1️⃣ Bot Kurulumu (2 dakika)

```bash
cd bot
SETUP.bat
```

Ardından `.env` dosyasını düzenle:
- Discord Token ekle
- Firebase bilgilerini ekle

### 2️⃣ Discord Ayarları (1 dakika)

Sunucunda oluştur:
- `#content-etkinlik-duyuru` kanalı
- `#sohbet` kanalı
- `LoL` rolü
- `TFT` rolü

### 3️⃣ Firebase Kurulumu (2 dakika)

1. [Firebase Console](https://console.firebase.google.com/) → Yeni proje
2. Firestore Database → Oluştur
3. Project Settings → Service Accounts → Generate Key
4. JSON bilgilerini `.env`'ye kopyala

### 4️⃣ Botu Başlat

```bash
npm start
```

✅ Bot hazır!

---

## 📱 Dashboard Kullanımı

### Maç Oluştur

```javascript
// Dashboard'da
1. "Yeni Maç" butonuna tıkla
2. Oyun seç (LoL/TFT)
3. Ayarları yap
4. Oluştur

// Discord'da
→ Otomatik duyuru gelir
→ Oyuncular 🎯 ile katılır
```

### Sonuç Gir

```javascript
// Dashboard'da
1. "Maç Sonuçları" sayfası
2. Maç ID seç
3. Sonuçları gir
4. Kaydet

// Otomatik
→ İstatistikler güncellenir
→ Leaderboard güncellenir
```

---

## 🎮 Oyuncu Kullanımı

### Maça Katılma

1. `#content-etkinlik-duyuru` kanalına git
2. Maç duyurusunu gör
3. 🎯 emojisine tıkla
4. ✅ DM ile onay gelir

### Otomatik İşlemler

- ✅ Rol otomatik verilir
- ✅ Lig kaydı otomatik yapılır
- ✅ İstatistikler otomatik güncellenir

---

## 📊 Önemli Bilgiler

### ❌ Artık Çalışmayan Komutlar
```
!vs
!tft
lig-kayıt
!leaderboard
!maç-sonuç
```

### ✅ Yeni Sistem
- Tüm işlemler Dashboard'dan
- Bot sadece dinler ve bildirir
- Emoji ile katılım

---

## 🔧 Sorun Giderme

### Bot çevrimiçi ama bildirim yok
```bash
# Kontrol et:
1. Firebase bağlantısı (.env)
2. Kanal isimleri doğru mu?
3. Bot izinleri yeterli mi?
```

### Emoji çalışmıyor
```bash
# Bot izinleri:
- Add Reactions ✅
- Manage Roles ✅
- Read Message History ✅
```

---

## 📚 Detaylı Dokümantasyon

- [MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md) - Tam kılavuz
- [FIREBASE_DATA_MODEL.md](FIREBASE_DATA_MODEL.md) - Veri yapısı
- [DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md) - API kılavuzu
- [DASHBOARD_COMPONENTS.md](DASHBOARD_COMPONENTS.md) - React örnekleri
- [CHANGELOG.md](CHANGELOG.md) - Değişiklikler

---

## 🎯 Checklist

Kurulum tamamlandı mı?

- [ ] Node.js yüklü
- [ ] Firebase projesi oluşturuldu
- [ ] Discord bot oluşturuldu
- [ ] .env yapılandırıldı
- [ ] Kanallar oluşturuldu
- [ ] Roller oluşturuldu
- [ ] Bot başlatıldı
- [ ] Test maçı oluşturuldu

Hepsi ✅ ise hazırsın! 🚀

---

## 💡 İpuçları

### Dashboard için
- Firebase Rules'u ayarla (güvenlik)
- Authentication ekle (admin girişi)
- Hosting kullan (deploy)

### Bot için
- PM2 kullan (production)
- Logları izle (hata ayıklama)
- Yedekleme yap (Firebase export)

### Discord için
- Bot izinlerini minimal tut
- Kanal izinlerini ayarla
- Rol hiyerarşisini düzenle

---

**v2.0 - Dashboard-First Architecture**

Başarılar! 🎮
