# Firebase Data Model - Güncellenmiş

## Collections

### 1. leagues (Ligler)
```javascript
{
  id: "Egg_Bot_LoL" | "Egg_Bot_TFT",
  name: "Egg Bot LoL" | "Egg Bot TFT",
  game: "lol" | "tft",
  createdAt: timestamp
}
```

### 2. players (Oyuncular)
```javascript
{
  id: "discord_user_id", // Unique ID
  username: "discord_username", // @ahmet -> ahmet
  discordTag: "@ahmet", // Mention formatı
  
  // Kayıtlı olduğu ligler
  leagues: ["Egg_Bot_LoL", "Egg_Bot_TFT"],
  
  // LoL istatistikleri
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
    champions: {
      "Ahri": { games: 5, wins: 3 },
      "Yasuo": { games: 10, wins: 6 }
    }
  },
  
  // TFT istatistikleri
  tftStats: {
    gamesPlayed: 0,
    placements: {
      first: 0, second: 0, third: 0, fourth: 0,
      fifth: 0, sixth: 0, seventh: 0, eighth: 0
    },
    averagePlacement: 0,
    compositions: {
      "9/5 Yunara": { games: 3, avgPlacement: 2.3 },
      "Bilgewater Reroll": { games: 5, avgPlacement: 3.8 }
    }
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. matches (Maçlar)
```javascript
{
  id: "auto-generated",
  leagueId: "Egg_Bot_LoL" | "Egg_Bot_TFT",
  game: "lol" | "tft",
  gameMode: "aram" | "sihirdar" | null,
  teamMode: "random" | "captain",
  timing: "now" | "scheduled",
  scheduledTime: timestamp | null,
  
  playersReady: boolean,
  maxPlayers: 10 | 8,
  participants: ["userId1", "userId2"], // User ID'ler
  
  // LoL için
  blueCaptain: "userId" | null,
  redCaptain: "userId" | null,
  blueTeam: ["userId1", "userId2"],
  redTeam: ["userId3", "userId4"],
  
  // TFT için
  tftMode: "solo" | "double" | null,
  
  // Discord
  discordMessageId: "message_id",
  discordChannelId: "channel_id",
  
  // Durum
  status: "scheduled" | "in_progress" | "completed" | "cancelled",
  completed: false,
  
  // Sonuç (completed: true ise)
  result: {
    // LoL için
    winningTeam: "blue" | "red",
    blueTeamPlayers: [
      {
        userId: "user_id",
        username: "ahmet",
        role: "top",
        champion: "Darius",
        kills: 5,
        deaths: 2,
        assists: 8
      }
    ],
    redTeamPlayers: [
      // Aynı format
    ],
    
    // TFT için
    tftResults: [
      {
        placement: 1,
        userId: "user_id",
        username: "ahmet",
        composition: "9/5 Yunara"
      },
      {
        placement: 2,
        userId: "user_id2",
        username: "mehmet",
        composition: "Bilgewater Reroll"
      }
      // ... 8 kişi
    ]
  },
  
  createdAt: timestamp,
  createdBy: "admin_user_id",
  updatedAt: timestamp,
  completedAt: timestamp | null
}
```

### 4. logs (İşlem Logları)
```javascript
{
  action: "match_created" | "player_joined" | "player_left" | "role_assigned" | "match_completed" | "match_deleted" | "player_registered",
  userId: "user_id",
  username: "username",
  matchId: "match_id" | null,
  leagueId: "league_id" | null,
  details: {},
  timestamp: timestamp
}
```

## Dashboard İşlem Akışları

### Maç Sonucu Girme - TFT

```javascript
// Dashboard'da TFT maç sonucu formu
const submitTftResult = async (matchId) => {
  const results = [
    { placement: 1, username: "@ahmet", composition: "9/5 Yunara" },
    { placement: 2, username: "@mehmet", composition: "Bilgewater Reroll" },
    { placement: 3, username: "@ayşe", composition: "Reroll Comp" },
    { placement: 4, username: "@fatma", composition: "Fast 8" },
    { placement: 5, username: "@ali", composition: "Slow Roll" },
    { placement: 6, username: "@veli", composition: "Hyperroll" },
    { placement: 7, username: "@zeynep", composition: "Flex" },
    { placement: 8, username: "@can", composition: "Standard" }
  ];
  
  // 1. Username'lerden userId'leri bul
  const playersSnapshot = await db.collection('players').get();
  const playerMap = {};
  playersSnapshot.forEach(doc => {
    const data = doc.data();
    playerMap[data.username] = doc.id;
  });
  
  // 2. Results'ı userId ile güncelle
  const tftResults = results.map(r => ({
    placement: r.placement,
    userId: playerMap[r.username.replace('@', '')],
    username: r.username.replace('@', ''),
    composition: r.composition
  }));
  
  // 3. Match'i güncelle
  await db.collection('matches').doc(matchId).update({
    status: 'completed',
    completed: true,
    result: { tftResults },
    completedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // 4. Oyuncu istatistiklerini güncelle
  for (const result of tftResults) {
    const playerRef = db.collection('players').doc(result.userId);
    const playerDoc = await playerRef.get();
    const stats = playerDoc.data().tftStats;
    
    const placementKey = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][result.placement - 1];
    const newGamesPlayed = stats.gamesPlayed + 1;
    const newAvg = ((stats.averagePlacement * stats.gamesPlayed) + result.placement) / newGamesPlayed;
    
    await playerRef.update({
      'tftStats.gamesPlayed': newGamesPlayed,
      [`tftStats.placements.${placementKey}`]: admin.firestore.FieldValue.increment(1),
      'tftStats.averagePlacement': newAvg,
      [`tftStats.compositions.${result.composition}.games`]: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};
```

### Maç Sonucu Girme - LoL

```javascript
// Dashboard'da LoL maç sonucu formu
const submitLolResult = async (matchId) => {
  const blueTeam = [
    { username: "@ahmet", role: "top", champion: "Darius", kills: 5, deaths: 2, assists: 8 },
    { username: "@mehmet", role: "jungle", champion: "Lee Sin", kills: 3, deaths: 4, assists: 10 },
    { username: "@ayşe", role: "mid", champion: "Ahri", kills: 8, deaths: 1, assists: 6 },
    { username: "@fatma", role: "adc", champion: "Jinx", kills: 10, deaths: 2, assists: 5 },
    { username: "@ali", role: "support", champion: "Thresh", kills: 1, deaths: 3, assists: 15 }
  ];
  
  const redTeam = [
    { username: "@veli", role: "top", champion: "Garen", kills: 2, deaths: 5, assists: 3 },
    { username: "@zeynep", role: "jungle", champion: "Elise", kills: 4, deaths: 3, assists: 8 },
    { username: "@can", role: "mid", champion: "Zed", kills: 6, deaths: 8, assists: 4 },
    { username: "@deniz", role: "adc", champion: "Caitlyn", kills: 3, deaths: 10, assists: 2 },
    { username: "@ece", role: "support", champion: "Lulu", kills: 0, deaths: 4, assists: 10 }
  ];
  
  const winningTeam = "blue"; // veya "red"
  
  // 1. Username'lerden userId'leri bul
  const playersSnapshot = await db.collection('players').get();
  const playerMap = {};
  playersSnapshot.forEach(doc => {
    const data = doc.data();
    playerMap[data.username] = doc.id;
  });
  
  // 2. Teams'i userId ile güncelle
  const blueTeamPlayers = blueTeam.map(p => ({
    ...p,
    userId: playerMap[p.username.replace('@', '')],
    username: p.username.replace('@', '')
  }));
  
  const redTeamPlayers = redTeam.map(p => ({
    ...p,
    userId: playerMap[p.username.replace('@', '')],
    username: p.username.replace('@', '')
  }));
  
  // 3. Match'i güncelle
  await db.collection('matches').doc(matchId).update({
    status: 'completed',
    completed: true,
    result: {
      winningTeam,
      blueTeamPlayers,
      redTeamPlayers
    },
    completedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // 4. Oyuncu istatistiklerini güncelle
  const allPlayers = [...blueTeamPlayers, ...redTeamPlayers];
  
  for (const player of allPlayers) {
    const won = (winningTeam === 'blue' && blueTeamPlayers.includes(player)) ||
                (winningTeam === 'red' && redTeamPlayers.includes(player));
    
    const playerRef = db.collection('players').doc(player.userId);
    
    await playerRef.update({
      'lolStats.gamesPlayed': admin.firestore.FieldValue.increment(1),
      'lolStats.wins': won ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      'lolStats.losses': !won ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      [`lolStats.roles.${player.role}.games`]: admin.firestore.FieldValue.increment(1),
      [`lolStats.roles.${player.role}.wins`]: won ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      [`lolStats.champions.${player.champion}.games`]: admin.firestore.FieldValue.increment(1),
      [`lolStats.champions.${player.champion}.wins`]: won ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};
```

## Bot Tarafı - Oyuncu Kaydı

Bot'ta emoji ile katılımda otomatik kayıt:

```javascript
// firebaseListener.js içinde
async function handleMatchReaction(reaction, user, isAdd) {
  if (isAdd && reaction.emoji.name === '🎯') {
    const match = matchData.match;
    const leagueId = match.leagueId; // "Egg_Bot_LoL" veya "Egg_Bot_TFT"
    
    // 1. Oyuncu var mı kontrol et
    const playerRef = db.collection('players').doc(user.id);
    const playerDoc = await playerRef.get();
    
    if (!playerDoc.exists) {
      // Yeni oyuncu oluştur
      await playerRef.set({
        id: user.id,
        username: user.username,
        discordTag: `@${user.username}`,
        leagues: [leagueId],
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
      });
    } else {
      // Lige ekle (yoksa)
      const leagues = playerDoc.data().leagues || [];
      if (!leagues.includes(leagueId)) {
        await playerRef.update({
          leagues: admin.firestore.FieldValue.arrayUnion(leagueId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    // 2. Rol ver
    const roleName = match.game === 'lol' ? 'LoL' : 'TFT';
    // ... rol verme kodu
  }
}
```

## Dashboard UI Önerileri

### TFT Sonuç Formu
```jsx
<form>
  {[1,2,3,4,5,6,7,8].map(placement => (
    <div key={placement}>
      <input placeholder={`${placement}. Oyuncu (@username)`} />
      <input placeholder="Kompozisyon (9/5 Yunara)" />
    </div>
  ))}
  <button>Kaydet</button>
</form>
```

### LoL Sonuç Formu
```jsx
<form>
  <h3>Mavi Takım</h3>
  {[1,2,3,4,5].map(i => (
    <div key={i}>
      <input placeholder="@username" />
      <select><option>Top</option><option>Jungle</option>...</select>
      <input placeholder="Şampiyon" />
      <input placeholder="K" type="number" />
      <input placeholder="D" type="number" />
      <input placeholder="A" type="number" />
    </div>
  ))}
  
  <h3>Kırmızı Takım</h3>
  {/* Aynı format */}
  
  <select>
    <option value="blue">Mavi Kazandı</option>
    <option value="red">Kırmızı Kazandı</option>
  </select>
  
  <button>Kaydet</button>
</form>
```
