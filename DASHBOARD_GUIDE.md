# Dashboard Firebase İşlemleri

## Maç Oluşturma

### 1. LoL Maçı (Şimdi + Kaptanlı + Oyuncular Hazır)

```javascript
const createLolMatch = async () => {
  const matchData = {
    game: "lol",
    gameMode: "aram", // veya "sihirdar"
    teamMode: "captain",
    timing: "now",
    scheduledTime: null,
    
    playersReady: true,
    maxPlayers: 10,
    participants: [
      "oyuncu1", "oyuncu2", "oyuncu3", "oyuncu4", "oyuncu5",
      "oyuncu6", "oyuncu7", "oyuncu8", "oyuncu9", "oyuncu10"
    ],
    
    blueCaptain: "oyuncu1",
    redCaptain: "oyuncu2",
    blueTeam: ["oyuncu1"],
    redTeam: ["oyuncu2"],
    
    status: "scheduled",
    completed: false,
    
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: currentUser.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  const docRef = await db.collection('matches').add(matchData);
  console.log('Maç oluşturuldu:', docRef.id);
};
```

### 2. LoL Maçı (İleri Tarih + Rastgele + Oyuncular Hazır Değil)

```javascript
const createScheduledLolMatch = async () => {
  const matchData = {
    game: "lol",
    gameMode: "sihirdar",
    teamMode: "random",
    timing: "scheduled",
    scheduledTime: firebase.firestore.Timestamp.fromDate(new Date('2024-12-25 20:00')),
    
    playersReady: false, // Emoji ile katılım aktif
    maxPlayers: 10,
    participants: [],
    
    blueCaptain: null,
    redCaptain: null,
    blueTeam: [],
    redTeam: [],
    
    status: "scheduled",
    completed: false,
    
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: currentUser.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('matches').add(matchData);
};
```

### 3. TFT Maçı (Solo + İleri Tarih)

```javascript
const createTftMatch = async () => {
  const matchData = {
    game: "tft",
    gameMode: null, // TFT için gameMode yok
    teamMode: "random", // TFT'de her zaman random
    timing: "scheduled",
    scheduledTime: firebase.firestore.Timestamp.fromDate(new Date('2024-12-25 21:00')),
    
    playersReady: false,
    maxPlayers: 8,
    participants: [],
    
    tftMode: "solo", // veya "double"
    mainList: [],
    reserveList: [],
    
    status: "scheduled",
    completed: false,
    
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: currentUser.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('matches').add(matchData);
};
```

## Maç Sonucu Girme

### LoL Maç Sonucu

```javascript
const submitLolMatchResult = async (matchId, winningTeam, playerStats) => {
  // 1. Maç sonucunu kaydet
  const resultData = {
    matchId: matchId,
    game: "lol",
    winningTeam: winningTeam, // "blue" veya "red"
    playerStats: [
      {
        userId: "user_id_1",
        username: "oyuncu1",
        team: "blue",
        role: "top",
        champion: "Darius",
        kills: 5,
        deaths: 2,
        assists: 8,
        won: true
      },
      // ... diğer oyuncular
    ],
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    completedBy: currentUser.uid
  };
  
  await db.collection('matchResults').add(resultData);
  
  // 2. Maçı tamamlandı olarak işaretle
  await db.collection('matches').doc(matchId).update({
    status: "completed",
    completed: true,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // 3. Oyuncu istatistiklerini güncelle
  for (const player of playerStats) {
    const playerRef = db.collection('lolLeague').doc(player.userId);
    const playerDoc = await playerRef.get();
    
    if (playerDoc.exists) {
      const currentData = playerDoc.data();
      
      await playerRef.update({
        gamesPlayed: firebase.firestore.FieldValue.increment(1),
        wins: player.won ? firebase.firestore.FieldValue.increment(1) : currentData.wins,
        losses: !player.won ? firebase.firestore.FieldValue.increment(1) : currentData.losses,
        [`roles.${player.role}.games`]: firebase.firestore.FieldValue.increment(1),
        [`roles.${player.role}.wins`]: player.won ? firebase.firestore.FieldValue.increment(1) : currentData.roles[player.role].wins,
        [`champions.${player.champion}.games`]: firebase.firestore.FieldValue.increment(1),
        [`champions.${player.champion}.wins`]: player.won ? firebase.firestore.FieldValue.increment(1) : (currentData.champions[player.champion]?.wins || 0),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  // 4. Log kaydet
  await db.collection('logs').add({
    action: 'match_completed',
    userId: currentUser.uid,
    username: currentUser.displayName,
    matchId: matchId,
    details: { game: 'lol', winningTeam },
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
};
```

### TFT Maç Sonucu

```javascript
const submitTftMatchResult = async (matchId, tftResults) => {
  // 1. Maç sonucunu kaydet
  const resultData = {
    matchId: matchId,
    game: "tft",
    tftResults: [
      {
        userId: "user_id_1",
        username: "oyuncu1",
        placement: 1,
        composition: "Reroll Comp",
        champions: ["Ahri", "Syndra", "Lux"]
      },
      // ... diğer oyuncular
    ],
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    completedBy: currentUser.uid
  };
  
  await db.collection('matchResults').add(resultData);
  
  // 2. Maçı tamamlandı olarak işaretle
  await db.collection('matches').doc(matchId).update({
    status: "completed",
    completed: true,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // 3. Oyuncu istatistiklerini güncelle
  for (const player of tftResults) {
    const playerRef = db.collection('tftLeague').doc(player.userId);
    const playerDoc = await playerRef.get();
    
    if (playerDoc.exists) {
      const currentData = playerDoc.data();
      const placementKey = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][player.placement - 1];
      
      // Ortalama sıralama hesapla
      const totalGames = currentData.gamesPlayed + 1;
      const currentTotal = currentData.averagePlacement * currentData.gamesPlayed;
      const newAverage = (currentTotal + player.placement) / totalGames;
      
      await playerRef.update({
        gamesPlayed: firebase.firestore.FieldValue.increment(1),
        [`placements.${placementKey}`]: firebase.firestore.FieldValue.increment(1),
        averagePlacement: newAverage,
        [`compositions.${player.composition}.games`]: firebase.firestore.FieldValue.increment(1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  // 4. Log kaydet
  await db.collection('logs').add({
    action: 'match_completed',
    userId: currentUser.uid,
    username: currentUser.displayName,
    matchId: matchId,
    details: { game: 'tft' },
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
};
```

## Boş Maçları Silme

```javascript
const deleteEmptyMatches = async () => {
  const emptyMatches = await db.collection('matches')
    .where('completed', '==', false)
    .where('participants', '==', [])
    .get();
  
  const batch = db.batch();
  let count = 0;
  
  emptyMatches.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });
  
  await batch.commit();
  
  // Log kaydet
  await db.collection('logs').add({
    action: 'matches_deleted',
    userId: currentUser.uid,
    username: currentUser.displayName,
    matchId: null,
    details: { count },
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`${count} boş maç silindi`);
};
```

## Leaderboard Sorgulama

### LoL Leaderboard

```javascript
const getLolLeaderboard = async () => {
  const players = await db.collection('lolLeague')
    .orderBy('wins', 'desc')
    .limit(50)
    .get();
  
  return players.docs.map(doc => {
    const data = doc.data();
    const winRate = data.gamesPlayed > 0 
      ? ((data.wins / data.gamesPlayed) * 100).toFixed(1) 
      : 0;
    
    return {
      userId: doc.id,
      username: data.username,
      wins: data.wins,
      losses: data.losses,
      gamesPlayed: data.gamesPlayed,
      winRate: winRate,
      roles: data.roles,
      champions: data.champions
    };
  });
};
```

### TFT Leaderboard

```javascript
const getTftLeaderboard = async () => {
  const players = await db.collection('tftLeague')
    .orderBy('averagePlacement', 'asc')
    .limit(50)
    .get();
  
  return players.docs.map(doc => {
    const data = doc.data();
    
    return {
      userId: doc.id,
      username: data.username,
      gamesPlayed: data.gamesPlayed,
      averagePlacement: data.averagePlacement.toFixed(2),
      placements: data.placements,
      compositions: data.compositions
    };
  });
};
```

## Real-time Dinleme (Dashboard için)

```javascript
// Aktif maçları dinle
const listenToActiveMatches = (callback) => {
  return db.collection('matches')
    .where('status', '==', 'scheduled')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(matches);
    });
};

// Logları dinle
const listenToLogs = (callback) => {
  return db.collection('logs')
    .orderBy('timestamp', 'desc')
    .limit(100)
    .onSnapshot(snapshot => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(logs);
    });
};
```

## Dashboard Sayfaları

### 1. Ana Sayfa (Dashboard)
- Aktif maçlar listesi
- Son loglar
- Hızlı istatistikler (toplam oyuncu, toplam maç, vb.)

### 2. Maç Oluştur
- Oyun seçimi (LoL/TFT)
- Mod seçimi (LoL için ARAM/Sihirdar)
- Takım tipi (Rastgele/Kaptanlı)
- Zamanlama (Şimdi/İleri Tarih)
- Oyuncu durumu (Hazır/Hazır Değil)
- Kaptanlar (gerekirse)

### 3. Maç Sonuçları
- Maç ID seçimi
- Kazanan takım/sıralama girişi
- Oyuncu bazlı istatistik girişi
- Kaydet butonu

### 4. Leaderboard
- LoL Leaderboard
- TFT Leaderboard
- Detaylı istatistikler
- Filtreleme ve sıralama

### 5. Yönetim
- Boş maçları sil butonu
- Log görüntüleme
- Oyuncu yönetimi
