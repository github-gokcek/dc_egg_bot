const { db, admin } = require('./services/firebaseAdmin');

async function addTestPlayer() {
  console.log('🧪 Test oyuncu ekleniyor...\n');
  
  try {
    await db.collection('players').doc('test_user_123').set({
      id: 'test_user_123',
      username: 'TestOyuncu',
      discordTag: '@TestOyuncu',
      leagues: ['Egg_Bot_TFT', 'Egg_Bot_LoL'],
      lolStats: {
        gamesPlayed: 5,
        wins: 3,
        losses: 2,
        roles: {
          top: { games: 2, wins: 1 },
          jungle: { games: 1, wins: 1 },
          mid: { games: 2, wins: 1 },
          adc: { games: 0, wins: 0 },
          support: { games: 0, wins: 0 }
        },
        champions: {
          'Darius': { games: 2, wins: 1 },
          'Lee Sin': { games: 1, wins: 1 },
          'Ahri': { games: 2, wins: 1 }
        }
      },
      tftStats: {
        gamesPlayed: 3,
        placements: {
          first: 1,
          second: 1,
          third: 0,
          fourth: 1,
          fifth: 0,
          sixth: 0,
          seventh: 0,
          eighth: 0
        },
        averagePlacement: 2.0,
        compositions: {
          '9/5 Yunara': { games: 2, avgPlacement: 1.5 },
          'Bilgewater Reroll': { games: 1, avgPlacement: 4.0 }
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Test oyuncu eklendi!');
    console.log('📝 ID: test_user_123');
    console.log('👤 Username: TestOyuncu');
    console.log('🎮 Ligler: Egg_Bot_TFT, Egg_Bot_LoL');
    console.log('\n🔍 Dashboard\'da Oyuncular sekmesini kontrol edin!');
    
    // Test log da ekle
    await db.collection('logs').add({
      action: 'player_registered',
      userId: 'test_user_123',
      username: 'TestOyuncu',
      matchId: null,
      leagueId: 'Egg_Bot_TFT',
      details: { message: 'Test oyuncu kaydı' },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Test log eklendi!');
    console.log('🔍 Dashboard\'da Loglar sekmesini kontrol edin!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

addTestPlayer();
