// utils/firebase.js

const admin = require('firebase-admin');
require('dotenv').config(); // Carrega variáveis do .env se existir

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  // Carrega o JSON das credenciais da variável de ambiente
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  // Fallback para ambiente local usando o arquivo .json
  serviceAccount = require('../serviceAccountKey.json');
}

// Inicialização do Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { admin, db };
