const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAzb4FT3w9FFeeiumio8Yl1YB0nDsoMg0U",
  authDomain: "egg-bot-dashboard.firebaseapp.com",
  projectId: "egg-bot-dashboard",
  storageBucket: "egg-bot-dashboard.firebasestorage.app",
  messagingSenderId: "751715219546",
  appId: "1:751715219546:web:95e858d6ae9ab5a8e54063"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
