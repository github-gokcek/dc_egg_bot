const { db } = require('./services/firebaseAdmin');
const fs = require('fs');
const path = require('path');

async function migrateData() {
  console.log('🔄 Veri taşıma başlıyor...');

  try {
    // LoL League Data
    const leagueData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'league_data.json'), 'utf8'));
    console.log('📊 LoL lig verileri okundu:', Object.keys(leagueData).length, 'oyuncu');

    // LoL ligini oluştur
    const lolLeagueRef = await db.collection('leagues').add({
      name: 'LoL Ana Lig',
      game: 'lol',
      createdAt: new Date()
    });
    console.log('✅ LoL ligi oluşturuldu:', lolLeagueRef.id);

    // Oyuncuları ekle
    for (const [discordId, player] of Object.entries(leagueData)) {
      await db.collection('leaguePlayers').add({
        leagueId: lolLeagueRef.id,
        discordId: discordId,
        username: player.username,
        wins: player.wins || 0,
        losses: player.losses || 0,
        joinedAt: new Date()
      });
    }
    console.log('✅ LoL oyuncuları eklendi');

    // TFT League Data
    const tftLeagueData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tft_league_data.json'), 'utf8'));
    console.log('📊 TFT lig verileri okundu:', Object.keys(tftLeagueData).length, 'oyuncu');

    // TFT ligini oluştur
    const tftLeagueRef = await db.collection('leagues').add({
      name: 'TFT Ana Lig',
      game: 'tft',
      createdAt: new Date()
    });
    console.log('✅ TFT ligi oluşturuldu:', tftLeagueRef.id);

    // TFT oyuncularını ekle
    for (const [discordId, player] of Object.entries(tftLeagueData)) {
      const totalMatches = player.matches?.length || 0;
      const wins = player.matches?.filter(m => m.placement <= 4).length || 0;
      const losses = totalMatches - wins;

      await db.collection('leaguePlayers').add({
        leagueId: tftLeagueRef.id,
        discordId: discordId,
        username: player.username,
        wins: wins,
        losses: losses,
        joinedAt: new Date()
      });
    }
    console.log('✅ TFT oyuncuları eklendi');

    // Matches Data
    const matchesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'matches_data.json'), 'utf8'));
    console.log('📊 Maç verileri okundu:', Object.keys(matchesData).length, 'maç');

    for (const [matchId, match] of Object.entries(matchesData)) {
      if (match.completed) {
        await db.collection('matches').add({
          leagueId: lolLeagueRef.id,
          game: 'lol',
          gameMode: match.gameMode,
          teamMode: 'random',
          players: [...match.blueTeam, ...match.redTeam],
          blueTeam: match.blueTeam,
          redTeam: match.redTeam,
          winner: match.winner,
          status: 'completed',
          scheduledTime: new Date(match.timestamp),
          completedAt: new Date(match.completedAt || match.timestamp),
          createdAt: new Date(match.timestamp)
        });
      }
    }
    console.log('✅ Maçlar eklendi');

    console.log('🎉 Veri taşıma tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

migrateData();
