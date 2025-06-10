const { db } = require('../utils/firebase');

/**
 * Deleta todos os documentos de uma coleção
 * @param {string} collectionPath - Caminho da coleção no Firestore
 * @returns {Promise<void>}
 */
async function deleteCollection(collectionPath) {
  // 1. Busca todos os documentos
  const snapshot = await db.collection(collectionPath).get();
  
  // 2. Cria operação em lote
  const batch = db.batch();
  
  // 3. Adiciona operações de delete ao batch
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // 4. Executa todas as operações atomicamente
  await batch.commit();
  console.log(`Coleção '${collectionPath}' resetada.`);
}

/**
 * Função principal que orquestra o reset geral
 */
async function resetTestData() {
  try {
    // Lista ordenada de coleções para reset
    await deleteCollection('alunos');
    await deleteCollection('professores');
    await deleteCollection('exercicios');
    await deleteCollection('treinos');
    await deleteCollection('historicos');
    
    console.log("Todos os dados de teste foram resetados!");
    process.exit(0); // Encerra com código de sucesso
  } catch (error) {
    console.error("Erro ao resetar dados de teste:", error);
    process.exit(1); // Encerra com código de erro
  }
}

// Execução do script
resetTestData();