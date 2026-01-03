# 🔧 Dashboard Sorun Giderme

## Sorun 1: Oyuncular Sekmesi Boş

### Neden?
Bot `players` collection'a yazıyor ama Dashboard okuyamıyor olabilir.

### Çözüm: Firestore Rules

1. Firebase Console'a git: https://console.firebase.google.com/project/egg-bot-dashboard/firestore/rules

2. Rules'u şu şekilde güncelle:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tüm collection'lara okuma/yazma izni (geliştirme için)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Publish** butonuna tıkla

### Test Et:

Dashboard'da Oyuncular sekmesine git. Şimdi görünmeli.

---

## Sorun 2: Loglar Sekmesi Siyah Ekran

### Neden?
1. `logs` collection'ı boş olabilir
2. Dashboard'da hata var olabilir
3. Firestore Rules izin vermiyor olabilir

### Çözüm 1: Test Log Ekle

Bot console'da şunu çalıştır:

```javascript
// Test log ekle
const { db, admin } = require('./services/firebaseAdmin');

async function addTestLog() {
  await db.collection('logs').add({
    action: 'test',
    userId: 'test_user',
    username: 'Test User',
    matchId: null,
    leagueId: null,
    details: { message: 'Test log' },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('Test log eklendi');
}

addTestLog();
```

### Çözüm 2: Dashboard Console Kontrol

1. Dashboard'da F12 bas (Developer Tools)
2. Console sekmesine git
3. Kırmızı hata var mı kontrol et
4. Hatayı paylaş

---

## Sorun 3: Bot Oyuncu Kaydetmiyor

### Kontrol:

1. Bot console'da şunu gör:
```
🔍 username için oyuncu kaydı kontrol ediliyor...
➕ Yeni oyuncu oluşturuluyor: username
✅ username players collection'a kaydedildi (ID: 123456)
```

2. Görmüyorsan:
   - Bot çalışıyor mu? (`npm start`)
   - Emoji'ye tıkladın mı? (🎯)
   - Console'da hata var mı?

### Manuel Test:

```bash
cd C:\Dc_egg_bot\bot
node
```

```javascript
const { db, admin } = require('./services/firebaseAdmin');

// Test oyuncu ekle
db.collection('players').doc('test123').set({
  id: 'test123',
  username: 'TestUser',
  discordTag: '@TestUser',
  leagues: ['Egg_Bot_TFT'],
  lolStats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    roles: {
      top: { games: 0, wins: 0 },
      jungle: { games: 0, wins: 0 },
      mid: { games: 0, wins: 0 },
      adc: { games: 0, wins: 0 },
      support: { games: 0, wins: 0 }
    },
    champions: {}
  },
  tftStats: {
    gamesPlayed: 0,
    placements: {
      first: 0, second: 0, third: 0, fourth: 0,
      fifth: 0, sixth: 0, seventh: 0, eighth: 0
    },
    averagePlacement: 0,
    compositions: {}
  },
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
}).then(() => {
  console.log('Test oyuncu eklendi!');
  process.exit(0);
});
```

Dashboard'da Oyuncular sekmesinde "TestUser" görünmeli.

---

## Hızlı Kontrol Listesi

### Bot Tarafı:
- [ ] Bot çalışıyor (`npm start`)
- [ ] Firebase bağlantısı çalışıyor
- [ ] Emoji'ye tıklandığında console'da log var
- [ ] "players collection'a kaydedildi" mesajı görünüyor

### Firebase Tarafı:
- [ ] Firestore Rules: `allow read, write: if true;`
- [ ] `players` collection var
- [ ] `logs` collection var
- [ ] Test döküman eklenebiliyor

### Dashboard Tarafı:
- [ ] Dashboard çalışıyor
- [ ] Firebase config doğru
- [ ] F12 Console'da hata yok
- [ ] Oyuncular sekmesi yükleniyor

---

## Test Komutu

Bot klasöründe:

```bash
node -e "const {db,admin}=require('./services/firebaseAdmin');db.collection('players').doc('test').set({id:'test',username:'Test',discordTag:'@Test',leagues:['Egg_Bot_TFT'],lolStats:{gamesPlayed:0,wins:0,losses:0,roles:{top:{games:0,wins:0},jungle:{games:0,wins:0},mid:{games:0,wins:0},adc:{games:0,wins:0},support:{games:0,wins:0}},champions:{}},tftStats:{gamesPlayed:0,placements:{first:0,second:0,third:0,fourth:0,fifth:0,sixth:0,seventh:0,eighth:0},averagePlacement:0,compositions:{}},createdAt:admin.firestore.FieldValue.serverTimestamp(),updatedAt:admin.firestore.FieldValue.serverTimestamp()}).then(()=>{console.log('OK');process.exit(0)})"
```

Bu komut test oyuncu ekler. Dashboard'da görünmeli.
