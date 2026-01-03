# Dashboard React Components

## Örnek Component Yapısı

### 1. CreateMatch.jsx - Maç Oluşturma

```jsx
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateMatch() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    game: '',
    gameMode: '',
    teamMode: '',
    timing: '',
    scheduledTime: null,
    playersReady: false,
    participants: [],
    blueCaptain: '',
    redCaptain: ''
  });

  const handleGameSelect = (game) => {
    setFormData({ ...formData, game });
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      const matchData = {
        ...formData,
        maxPlayers: formData.game === 'lol' ? 10 : 8,
        status: 'scheduled',
        completed: false,
        blueTeam: formData.blueCaptain ? [formData.blueCaptain] : [],
        redTeam: formData.redCaptain ? [formData.redCaptain] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'matches'), matchData);
      alert('Maç başarıyla oluşturuldu!');
      
      // Reset form
      setFormData({
        game: '',
        gameMode: '',
        teamMode: '',
        timing: '',
        scheduledTime: null,
        playersReady: false,
        participants: [],
        blueCaptain: '',
        redCaptain: ''
      });
      setStep(1);
    } catch (error) {
      console.error('Maç oluşturma hatası:', error);
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="create-match">
      <h2>Yeni Maç Oluştur</h2>
      
      {/* Step 1: Oyun Seçimi */}
      {step === 1 && (
        <div className="step">
          <h3>Oyun Seçin</h3>
          <button onClick={() => handleGameSelect('lol')}>
            🎮 League of Legends
          </button>
          <button onClick={() => handleGameSelect('tft')}>
            ♟️ Teamfight Tactics
          </button>
        </div>
      )}

      {/* Step 2: Mod Seçimi (sadece LoL için) */}
      {step === 2 && formData.game === 'lol' && (
        <div className="step">
          <h3>Oyun Modu</h3>
          <button onClick={() => {
            setFormData({ ...formData, gameMode: 'aram' });
            setStep(3);
          }}>
            ⚔️ ARAM
          </button>
          <button onClick={() => {
            setFormData({ ...formData, gameMode: 'sihirdar' });
            setStep(3);
          }}>
            🏰 Sihirdar Vadisi
          </button>
        </div>
      )}

      {/* TFT için direkt 3. adıma geç */}
      {step === 2 && formData.game === 'tft' && (
        <div className="step">
          <h3>TFT Modu</h3>
          <button onClick={() => {
            setFormData({ ...formData, tftMode: 'solo' });
            setStep(3);
          }}>
            👤 Solo
          </button>
          <button onClick={() => {
            setFormData({ ...formData, tftMode: 'double' });
            setStep(3);
          }}>
            👥 Double
          </button>
        </div>
      )}

      {/* Step 3: Takım Tipi */}
      {step === 3 && (
        <div className="step">
          <h3>Takım Tipi</h3>
          <button onClick={() => {
            setFormData({ ...formData, teamMode: 'random' });
            setStep(4);
          }}>
            🎲 Rastgele
          </button>
          <button onClick={() => {
            setFormData({ ...formData, teamMode: 'captain' });
            setStep(4);
          }}>
            👑 Kaptanlı
          </button>
        </div>
      )}

      {/* Step 4: Zamanlama */}
      {step === 4 && (
        <div className="step">
          <h3>Ne Zaman?</h3>
          <button onClick={() => {
            setFormData({ ...formData, timing: 'now' });
            setStep(5);
          }}>
            ⚡ Şimdi
          </button>
          <button onClick={() => {
            setFormData({ ...formData, timing: 'scheduled' });
            setStep(5);
          }}>
            📅 İleri Tarih
          </button>
        </div>
      )}

      {/* Step 5: Oyuncu Durumu */}
      {step === 5 && (
        <div className="step">
          <h3>Oyuncular Hazır mı?</h3>
          <button onClick={() => {
            setFormData({ ...formData, playersReady: true });
            setStep(6);
          }}>
            ✅ Evet
          </button>
          <button onClick={() => {
            setFormData({ ...formData, playersReady: false });
            handleSubmit();
          }}>
            ❌ Hayır (Emoji ile katılım)
          </button>
        </div>
      )}

      {/* Step 6: Oyuncu İsimleri (sadece hazırsa) */}
      {step === 6 && formData.playersReady && (
        <div className="step">
          <h3>Oyuncu İsimleri</h3>
          <textarea
            placeholder="Her satıra bir oyuncu ismi girin"
            rows={10}
            onChange={(e) => {
              const names = e.target.value.split('\n').filter(n => n.trim());
              setFormData({ ...formData, participants: names });
            }}
          />
          <p>Girilen: {formData.participants.length} / {formData.game === 'lol' ? 10 : 8}</p>
          
          {formData.timing === 'now' && formData.teamMode === 'captain' && (
            <div>
              <h4>Kaptanları Seçin</h4>
              <select onChange={(e) => setFormData({ ...formData, blueCaptain: e.target.value })}>
                <option value="">Mavi Kaptan</option>
                {formData.participants.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select onChange={(e) => setFormData({ ...formData, redCaptain: e.target.value })}>
                <option value="">Kırmızı Kaptan</option>
                {formData.participants.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
          
          <button onClick={handleSubmit}>
            🚀 Maçı Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2. MatchResults.jsx - Maç Sonucu Girişi

```jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function MatchResults() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const q = query(
      collection(db, 'matches'),
      where('completed', '==', false)
    );
    const snapshot = await getDocs(q);
    setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async () => {
    try {
      if (selectedMatch.game === 'lol') {
        await submitLolResult();
      } else {
        await submitTftResult();
      }
      alert('Sonuç başarıyla kaydedildi!');
      loadMatches();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Sonuç kaydetme hatası:', error);
      alert('Hata: ' + error.message);
    }
  };

  const submitLolResult = async () => {
    // LoL sonuç kaydetme mantığı
    await addDoc(collection(db, 'matchResults'), {
      matchId: selectedMatch.id,
      game: 'lol',
      winningTeam: results.winningTeam,
      playerStats: results.playerStats,
      completedAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'matches', selectedMatch.id), {
      status: 'completed',
      completed: true,
      updatedAt: serverTimestamp()
    });
  };

  const submitTftResult = async () => {
    // TFT sonuç kaydetme mantığı
    await addDoc(collection(db, 'matchResults'), {
      matchId: selectedMatch.id,
      game: 'tft',
      tftResults: results.tftResults,
      completedAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'matches', selectedMatch.id), {
      status: 'completed',
      completed: true,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="match-results">
      <h2>Maç Sonuçları</h2>
      
      {!selectedMatch ? (
        <div className="match-list">
          <h3>Tamamlanmamış Maçlar</h3>
          {matches.map(match => (
            <div key={match.id} className="match-item">
              <span>{match.game.toUpperCase()} - {match.gameMode || 'TFT'}</span>
              <span>{match.participants.length} oyuncu</span>
              <button onClick={() => setSelectedMatch(match)}>
                Sonuç Gir
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="result-form">
          <h3>Maç: {selectedMatch.id.slice(0, 8)}</h3>
          
          {selectedMatch.game === 'lol' ? (
            <div>
              <h4>Kazanan Takım</h4>
              <button onClick={() => setResults({ ...results, winningTeam: 'blue' })}>
                🔵 Mavi Takım
              </button>
              <button onClick={() => setResults({ ...results, winningTeam: 'red' })}>
                🔴 Kırmızı Takım
              </button>
              
              {/* Oyuncu istatistikleri formu */}
            </div>
          ) : (
            <div>
              <h4>Sıralamalar</h4>
              {/* TFT sıralama formu */}
            </div>
          )}
          
          <button onClick={handleSubmit}>💾 Kaydet</button>
          <button onClick={() => setSelectedMatch(null)}>❌ İptal</button>
        </div>
      )}
    </div>
  );
}
```

### 3. Leaderboard.jsx - Liderlik Tablosu

```jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Leaderboard() {
  const [game, setGame] = useState('lol');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, [game]);

  const loadLeaderboard = async () => {
    const collectionName = game === 'lol' ? 'lolLeague' : 'tftLeague';
    const orderField = game === 'lol' ? 'wins' : 'averagePlacement';
    const orderDirection = game === 'lol' ? 'desc' : 'asc';

    const q = query(
      collection(db, collectionName),
      orderBy(orderField, orderDirection),
      limit(50)
    );

    const snapshot = await getDocs(q);
    setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="leaderboard">
      <h2>🏆 Liderlik Tablosu</h2>
      
      <div className="game-selector">
        <button 
          className={game === 'lol' ? 'active' : ''}
          onClick={() => setGame('lol')}
        >
          🎮 LoL
        </button>
        <button 
          className={game === 'tft' ? 'active' : ''}
          onClick={() => setGame('tft')}
        >
          ♟️ TFT
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Oyuncu</th>
            {game === 'lol' ? (
              <>
                <th>Galibiyet</th>
                <th>Mağlubiyet</th>
                <th>Win Rate</th>
              </>
            ) : (
              <>
                <th>Oyun</th>
                <th>Ort. Sıralama</th>
                <th>1. Yer</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>{player.username}</td>
              {game === 'lol' ? (
                <>
                  <td>{player.wins}</td>
                  <td>{player.losses}</td>
                  <td>
                    {player.gamesPlayed > 0 
                      ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) 
                      : 0}%
                  </td>
                </>
              ) : (
                <>
                  <td>{player.gamesPlayed}</td>
                  <td>{player.averagePlacement.toFixed(2)}</td>
                  <td>{player.placements?.first || 0}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. Management.jsx - Yönetim Paneli

```jsx
import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Management() {
  const [loading, setLoading] = useState(false);

  const deleteEmptyMatches = async () => {
    if (!confirm('Boş maçları silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'matches'),
        where('completed', '==', false)
      );
      
      const snapshot = await getDocs(q);
      let count = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        if (!data.participants || data.participants.length === 0) {
          await deleteDoc(doc(db, 'matches', docSnapshot.id));
          count++;
        }
      }

      // Log kaydet
      await addDoc(collection(db, 'logs'), {
        action: 'matches_deleted',
        userId: 'admin',
        username: 'Admin',
        matchId: null,
        details: { count },
        timestamp: serverTimestamp()
      });

      alert(`${count} boş maç silindi!`);
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management">
      <h2>🔧 Yönetim</h2>
      
      <div className="actions">
        <button 
          onClick={deleteEmptyMatches}
          disabled={loading}
          className="danger"
        >
          🧹 Boş Maçları Sil
        </button>
      </div>
    </div>
  );
}
```

## Firebase Config

```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## Styling (Tailwind CSS örneği)

```css
/* Sibernetik / Futuristik tema */
:root {
  --primary: #00ffff;
  --secondary: #ff00ff;
  --dark: #0a0a0a;
  --darker: #050505;
  --glow: 0 0 10px var(--primary);
}

.create-match button {
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  border: 2px solid var(--primary);
  box-shadow: var(--glow);
  transition: all 0.3s;
}

.create-match button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px var(--primary);
}
```
