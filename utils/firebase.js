// utils/firebase.js

/**
 * Módulos essenciais
 * @module firebase-admin - SDK oficial para integração com serviços Firebase
 * @module serviceAccountKey - Credenciais de serviço (NUNCA versionar!)
 */
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
require('dotenv').config(); // Carrega variáveis de ambiente

/**
 * Inicialização do Firebase Admin SDK
 * @description Configuração segura usando service account e variáveis de ambiente
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

/**
 * Instâncias exportadas
 * @const db - Referência ao Firestore Database
 * @const admin - Instância completa do Admin SDK (para auth, storage, etc)
 */
const db = admin.firestore();
module.exports = { admin, db };