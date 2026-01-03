const { db } = require('./services/firebaseAdmin');

async function testFirebase() {
  console.log('🔥 Firebase bağlantısı test ediliyor...');
  
  try {
    const testRef = await db.collection('test').add({
      message: 'Test mesajı',
      timestamp: new Date()
    });
    
    console.log('✅ Firebase yazma başarılı! Doc ID:', testRef.id);
    
    const snapshot = await db.collection('test').limit(1).get();
    console.log('✅ Firebase okuma başarılı! Döküman sayısı:', snapshot.size);
    
    await testRef.delete();
    console.log('✅ Test dökümanı silindi');
    
    console.log('\n🎉 Firebase bağlantısı çalışıyor!');
    console.log('\n📝 Şimdi yapmanız gerekenler:');
    console.log('1. npm start ile botu başlatın');
    console.log('2. Dashboard\'dan yeni bir maç oluşturun');
    console.log('3. Bot otomatik olarak Discord\'a bildirim gönderecek');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase hatası:', error.message);
    console.log('\n⚠️ .env dosyasını kontrol edin');
    process.exit(1);
  }
}

testFirebase();
