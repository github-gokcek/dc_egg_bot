const { db } = require('./services/firebaseAdmin');

console.log('🔍 Firebase Listener Test\n');
console.log('Firebase dinleniyor...\n');

let changeCount = 0;

// Matches collection'ı dinle
const unsubscribe = db.collection('matches')
  .where('status', '==', 'scheduled')
  .onSnapshot(snapshot => {
    console.log(`📡 Snapshot alındı! (${new Date().toLocaleTimeString()})`);
    console.log(`📊 Toplam döküman: ${snapshot.size}`);
    
    snapshot.docChanges().forEach(change => {
      changeCount++;
      console.log(`\n🔔 Değişiklik #${changeCount}:`);
      console.log(`   Tip: ${change.type}`);
      console.log(`   Doc ID: ${change.doc.id}`);
      
      if (change.type === 'added') {
        const data = change.doc.data();
        console.log(`   ✅ YENİ MAÇ ALGILANDI!`);
        console.log(`   Oyun: ${data.game}`);
        console.log(`   Mod: ${data.tftMode || data.gameMode || 'N/A'}`);
        console.log(`   Oyuncular: ${data.participants?.length || 0}/${data.maxPlayers}`);
      }
    });
    
    if (snapshot.docChanges().length === 0) {
      console.log('   ℹ️ Değişiklik yok');
    }
  }, error => {
    console.error('❌ Listener hatası:', error);
  });

console.log('✅ Listener başlatıldı!');
console.log('\n📝 Test için:');
console.log('1. Başka bir terminal açın');
console.log('2. "node create-test-match.js" çalıştırın');
console.log('3. Bu ekranda değişiklik görmelisiniz\n');
console.log('⏹️ Durdurmak için Ctrl+C\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Listener durduruluyor...');
  unsubscribe();
  console.log('✅ Listener durduruldu');
  process.exit(0);
});
