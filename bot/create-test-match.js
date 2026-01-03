const { db, admin } = require('./services/firebaseAdmin');

async function createTestMatch() {
  console.log('🎮 Test maçı oluşturuluyor...\n');
  
  try {
    const testMatch = {
      game: "tft",
      gameMode: null,
      teamMode: "random",
      timing: "now",
      scheduledTime: null,
      
      playersReady: false,
      maxPlayers: 8,
      participants: [],
      
      tftMode: "solo",
      mainList: [],
      reserveList: [],
      
      blueCaptain: null,
      redCaptain: null,
      blueTeam: [],
      redTeam: [],
      
      status: "scheduled",
      completed: false,
      
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "test_script",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('matches').add(testMatch);
    
    console.log('✅ Test maçı oluşturuldu!');
    console.log('📝 Match ID:', docRef.id);
    console.log('\n🔔 Şimdi Discord\'da şunları kontrol edin:');
    console.log('1. #content-etkinlik-duyuru kanalında embed mesajı');
    console.log('2. #sohbet kanalında "@TFT 🎮 Yeni TFT maçı..." mesajı');
    console.log('3. TFT rolüne sahip kullanıcılara DM');
    console.log('\n⏳ 5 saniye bekleyin...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Maçı kontrol et
    const matchDoc = await db.collection('matches').doc(docRef.id).get();
    const matchData = matchDoc.data();
    
    if (matchData.discordMessageId) {
      console.log('✅ Bot maçı algıladı ve Discord\'a gönderdi!');
      console.log('📨 Discord Message ID:', matchData.discordMessageId);
    } else {
      console.log('❌ Bot maçı algılamadı!');
      console.log('\n🔍 Kontrol edilecekler:');
      console.log('1. Bot çalışıyor mu? (npm start)');
      console.log('2. Firebase listener başladı mı?');
      console.log('3. Console\'da hata var mı?');
    }
    
    // Test maçını sil
    console.log('\n🧹 Test maçı siliniyor...');
    await docRef.delete();
    console.log('✅ Test maçı silindi');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

createTestMatch();
