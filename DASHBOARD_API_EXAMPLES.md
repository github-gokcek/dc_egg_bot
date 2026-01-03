# Dashboard API Fonksiyonları

## Firebase Config (Aynı Kalacak)

```javascript
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzb4FT3w9FFeeiumio8Yl1YB0nDsoMg0U",
  authDomain: "egg-bot-dashboard.firebaseapp.com",
  projectId: "egg-bot-dashboard",
  storageBucket: "egg-bot-dashboard.firebasestorage.app",
  messagingSenderId: "751715219546",
  appId: "1:751715219546:web:95e858d6ae9ab5a8e54063",
  measurementId: "G-LGDEPH7BCL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## Oyuncular API

```javascript
// src/api/players.js
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Tüm oyuncuları getir
export const getAllPlayers = async () => {
  const snapshot = await getDocs(collection(db, 'players'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// LoL oyuncularını getir
export const getLolPlayers = async () => {
  const allPlayers = await getAllPlayers();
  return allPlayers.filter(player => 
    player.leagues?.includes('Egg_Bot_LoL')
  );
};

// TFT oyuncularını getir
export const getTftPlayers = async () => {
  const allPlayers = await getAllPlayers();
  return allPlayers.filter(player => 
    player.leagues?.includes('Egg_Bot_TFT')
  );
};

// Tek oyuncu getir
export const getPlayer = async (playerId) => {
  const docRef = doc(db, 'players', playerId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Username'den oyuncu bul
export const getPlayerByUsername = async (username) => {
  const allPlayers = await getAllPlayers();
  return allPlayers.find(p => 
    p.username === username || p.discordTag === `@${username}`
  );
};
```

---

## Maçlar API

```javascript
// src/api/matches.js
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Tüm maçları getir
export const getAllMatches = async () => {
  const snapshot = await getDocs(collection(db, 'matches'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Aktif maçları getir
export const getActiveMatches = async () => {
  const allMatches = await getAllMatches();
  return allMatches.filter(match => 
    match.status === 'scheduled' || match.status === 'in_progress'
  );
};

// Tamamlanmış maçları getir
export const getCompletedMatches = async () => {
  const allMatches = await getAllMatches();
  return allMatches.filter(match => match.completed === true);
};

// Tek maç getir
export const getMatch = async (matchId) => {
  const docRef = doc(db, 'matches', matchId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Maç sonucu kaydet
export const submitMatchResult = async (matchId, result) => {
  const matchRef = doc(db, 'matches', matchId);
  await updateDoc(matchRef, {
    status: 'completed',
    completed: true,
    result: result,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};
```

---

## Loglar API

```javascript
// src/api/logs.js
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Son logları getir
export const getRecentLogs = async (limitCount = 100) => {
  const q = query(
    collection(db, 'logs'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Belirli bir işlem türüne göre logları getir
export const getLogsByAction = async (action) => {
  const allLogs = await getRecentLogs(1000);
  return allLogs.filter(log => log.action === action);
};

// Belirli bir kullanıcının loglarını getir
export const getLogsByUser = async (userId) => {
  const allLogs = await getRecentLogs(1000);
  return allLogs.filter(log => log.userId === userId);
};
```

---

## Kullanım Örnekleri

### Oyuncular Sayfası

```javascript
import { useEffect, useState } from 'react';
import { getAllPlayers } from '../api/players';

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Hata:', error);
    } finally {
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
            <th>Discord Tag</th>
            <th>Ligler</th>
            <th>LoL Oyun</th>
            <th>TFT Oyun</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.username}</td>
              <td>{player.discordTag}</td>
              <td>{player.leagues?.join(', ')}</td>
              <td>{player.lolStats?.gamesPlayed || 0}</td>
              <td>{player.tftStats?.gamesPlayed || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Loglar Sayfası

```javascript
import { useEffect, useState } from 'react';
import { getRecentLogs } from '../api/logs';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getRecentLogs(100);
      setLogs(data);
    } catch (error) {
      console.error('Hata:', error);
    } finally {
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
              <td>
                {log.timestamp?.toDate 
                  ? log.timestamp.toDate().toLocaleString('tr-TR')
                  : 'N/A'}
              </td>
              <td>{log.action}</td>
              <td>{log.username || 'N/A'}</td>
              <td>{JSON.stringify(log.details)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Önemli Notlar

1. **Collection İsimleri:**
   - ✅ `players` (tüm oyuncular)
   - ✅ `matches` (tüm maçlar)
   - ✅ `logs` (tüm loglar)

2. **Oyuncu Filtreleme:**
   - `player.leagues.includes('Egg_Bot_LoL')` → LoL oyuncuları
   - `player.leagues.includes('Egg_Bot_TFT')` → TFT oyuncuları

3. **İstatistikler:**
   - `player.lolStats` → LoL istatistikleri
   - `player.tftStats` → TFT istatistikleri

4. **Timestamp:**
   - Firebase timestamp: `log.timestamp.toDate()`
   - Format: `toLocaleString('tr-TR')`
