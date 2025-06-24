// config/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "cougarclub-31161.firebasestorage.app" // Asegúrate de que coincide con tu configuración
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
