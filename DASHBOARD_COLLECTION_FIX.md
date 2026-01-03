# 🔍 Dashboard Collection Mapping Sorunu

## Sorun
Firebase'de `players` collection'ında veriler var ama Dashboard'da görünmüyor.

## Muhtemel Nedenler

### 1. Dashboard Yanlış Collection'ı Okuyor

Dashboard muhtemelen eski collection isimlerini kullanıyor:
- ❌ `lolLeague` (eski)
- ❌ `tftLeague` (eski)
- ✅ `players` (yeni)

### 2. Çözüm: Dashboard Kodunu Güncelle

Dashboard'da oyuncuları okuyan yerde:

**Eski Kod:**
```javascript
// ❌ Yanlış
const lolPlayers = await getDocs(collection(db, 'lolLeague'));
const tftPlayers = await getDocs(collection(db, 'tftLeague'));
```

**Yeni Kod:**
```javascript
// ✅ Doğru
const allPlayers = await getDocs(collection(db, 'players'));

// LoL oyuncularını filtrele
const lolPlayers = allPlayers.docs.filter(doc => 
  doc.data().leagues?.includes('Egg_Bot_LoL')
);

// TFT oyuncularını filtrele
const tftPlayers = allPlayers.docs.filter(doc => 
  doc.data().leagues?.includes('Egg_Bot_TFT')
);
```

---

## Dashboard Kod Örnekleri

### Oyuncular Sayfası

```javascript
// src/pages/Players.jsx veya benzeri

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'players'));
      const playersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersList);
      setLoading(false);
    } catch (error) {
      console.error('Oyuncular yüklenemedi:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Oyuncular ({players.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Ligler</th>
            <th>LoL Oyun</th>
            <th>TFT Oyun</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.username}</td>
              <td>{player.leagues?.join(', ')}</td>
              <td>{player.lolStats?.gamesPlayed || 0}</td>
              <td>{player.tftStats?.gamesPlayed || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Loglar Sayfası

```javascript
// src/pages/Logs.jsx veya benzeri

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const q = query(
        collection(db, 'logs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const logsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsList);
      setLoading(false);
    } catch (error) {
      console.error('Loglar yüklenemedi:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Loglar ({logs.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Zaman</th>
            <th>İşlem</th>
            <th>Kullanıcı</th>
            <th>Detay</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.timestamp?.toDate().toLocaleString('tr-TR')}</td>
              <td>{log.action}</td>
              <td>{log.username}</td>
              <td>{JSON.stringify(log.details)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Hızlı Test

### 1. Dashboard Console'da Test Et

Dashboard'da F12 bas, Console'a yapıştır:

```javascript
// Firebase'den oyuncuları oku
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Kendi path'inize göre düzenleyin

getDocs(collection(db, 'players')).then(snapshot => {
  console.log('Oyuncu sayısı:', snapshot.size);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
});
```

### 2. Network Tab Kontrol

1. Dashboard'da F12 bas
2. Network sekmesine git
3. Oyuncular sayfasına git
4. Firestore isteklerini kontrol et
5. Hangi collection'a istek atıyor?

---

## Collection İsimleri - Özet

| Eski (❌) | Yeni (✅) | Açıklama |
|-----------|-----------|-----------|
| `lolLeague` | `players` | Tüm oyuncular tek collection'da |
| `tftLeague` | `players` | Ligler `leagues` array'inde |
| `matches_data` | `matches` | Maçlar |
| - | `logs` | Yeni eklendi |

---

## Dashboard Güncelleme Checklist

- [ ] `lolLeague` → `players` değiştir
- [ ] `tftLeague` → `players` değiştir
- [ ] `leagues` array'i ile filtrele
- [ ] `lolStats` ve `tftStats` kullan
- [ ] `logs` collection'ını oku
- [ ] Timestamp formatını düzelt

---

## Eğer Dashboard Koduna Erişiminiz Varsa

Şu dosyaları kontrol edin:
- `src/pages/Players.jsx` (veya benzeri)
- `src/pages/Logs.jsx` (veya benzeri)
- `src/services/firebase.js` (veya benzeri)

Collection isimlerini `players` ve `logs` olarak güncelleyin.
