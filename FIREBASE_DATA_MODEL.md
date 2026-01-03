# Firebase Data Model

## Collections

### 1. matches
Tüm maçlar (LoL ve TFT)

```javascript
{
  id: "auto-generated",
  game: "lol" | "tft",
  gameMode: "aram" | "sihirdar" | null, // TFT için null
  teamMode: "random" | "captain",
  timing: "now" | "scheduled",
  scheduledTime: timestamp | null,
  
  // Oyuncu durumu
  playersReady: boolean, // Dashboard'da "Oyuncular hazır mı?"
  maxPlayers: 10 | 8, // LoL: 10, TFT: 8
  participants: [], // Katılan oyuncu isimleri
  
  // Kaptanlar (timing: "now" + teamMode: "captain")
  blueCaptain: "username" | null,
  redCaptain: "username" | null,
  
  // Takımlar (LoL için)
  blueTeam: [],
  redTeam: [],
  
  // TFT için
  tftMode: "solo" | "double" | null,
  mainList: [], // 8 kişilik ana liste
  reserveList: [], // Yedek liste
  
  // Discord bilgileri
  discordMessageId: "message_id",
  discordChannelId: "channel_id",
  
  // Durum
  status: "scheduled" | "in_progress" | "completed" | "cancelled",
  completed: false,
  
  // Metadata
  createdAt: timestamp,
  createdBy: "admin_user_id",
  updatedAt: timestamp
}
```

### 2. lolLeague
LoL oyuncu istatistikleri

```javascript
{
  userId: "discord_user_id",
  username: "discord_username",
  wins: 0,
  losses: 0,
  gamesPlayed: 0,
  
  // Detaylı istatistikler
  roles: {
    top: { games: 0, wins: 0 },
    jungle: { games: 0, wins: 0 },
    mid: { games: 0, wins: 0 },
    adc: { games: 0, wins: 0 },
    support: { games: 0, wins: 0 }
  },
  
  champions: {
    "champion_name": { games: 0, wins: 0 }
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. tftLeague
TFT oyuncu istatistikleri

```javascript
{
  userId: "discord_user_id",
  username: "discord_username",
  gamesPlayed: 0,
  
  // Sıralama istatistikleri
  placements: {
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
    fifth: 0,
    sixth: 0,
    seventh: 0,
    eighth: 0
  },
  
  // Ortalama sıralama
  averagePlacement: 0,
  
  // Kompozisyon istatistikleri
  compositions: {
    "comp_name": { games: 0, avgPlacement: 0 }
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. matchResults
Maç sonuçları ve detaylı istatistikler

```javascript
{
  matchId: "match_id",
  game: "lol" | "tft",
  
  // LoL için
  winningTeam: "blue" | "red" | null,
  playerStats: [
    {
      userId: "user_id",
      username: "username",
      team: "blue" | "red",
      role: "top" | "jungle" | "mid" | "adc" | "support",
      champion: "champion_name",
      kills: 0,
      deaths: 0,
      assists: 0,
      won: true | false
    }
  ],
  
  // TFT için
  tftResults: [
    {
      userId: "user_id",
      username: "username",
      placement: 1-8,
      composition: "comp_name",
      champions: []
    }
  ],
  
  // Metadata
  completedAt: timestamp,
  completedBy: "admin_user_id"
}
```

### 5. logs
Tüm işlem logları

```javascript
{
  action: "match_created" | "player_joined" | "player_left" | "role_assigned" | "match_completed" | "match_deleted",
  userId: "user_id",
  username: "username",
  matchId: "match_id" | null,
  details: {}, // İşleme özel detaylar
  timestamp: timestamp
}
```

## Dashboard İşlem Akışı

### Maç Oluşturma
1. Admin dashboard'da "Yeni Maç" butonuna tıklar
2. Oyun seçer (LoL/TFT)
3. Mod seçer (LoL için: ARAM/Sihirdar)
4. Takım tipi seçer (Rastgele/Kaptanlı)
5. Zamanlama seçer (Şimdi/İleri Tarih)
6. "Oyuncular hazır mı?" sorusuna cevap verir
   - Evet → 10 oyuncu ismi girer
   - Hayır → Emoji sistemi aktif olur
7. Şimdi + Kaptanlı ise → Kaptanları seçer
8. Firebase'e kaydet
9. Bot otomatik bildirim gönderir

### Maç Sonucu Girme
1. Admin dashboard'da "Maç Sonuçları" sayfasına gider
2. Maç ID'yi seçer
3. Kazanan takımı/sıralamaları girer
4. Oyuncu bazlı istatistikleri girer
5. Firebase'e kaydet
6. Otomatik lig istatistikleri güncellenir

### Boş Maç Silme
1. Admin dashboard'da "Yönetim" sayfasına gider
2. "Boş Maçları Sil" butonuna tıklar
3. completed: false ve participants: [] olan maçlar silinir
4. Log kaydı oluşturulur
