const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function corrigirDatas() {
  try {
    const usuariosRef = db.collection('alunos');
    const snapshot = await usuariosRef.get();

    console.log(`Encontrados ${snapshot.size} documentos`);

    let batch = db.batch();
    let contador = 0;
    let totalAtualizacoes = 0;

    // Usando for...of para loops assíncronos
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data.dt_cadastro && data.dt_cadastro._seconds) {
        const novaData = new admin.firestore.Timestamp(
          data.dt_cadastro._seconds,
          data.dt_cadastro._nanoseconds
        ).toDate();

        batch.update(doc.ref, { dt_cadastro: novaData });
        contador++;
        totalAtualizacoes++;

        // Commit a cada 400 operações
        if (contador === 400) {
          console.log(`Enviando lote de ${contador} atualizações`);
          await batch.commit();
          batch = db.batch();
          contador = 0;
        }
      }
    }

    // Commit do último lote restante
    if (contador > 0) {
      console.log(`Enviando último lote com ${contador} atualizações`);
      await batch.commit();
    }

    console.log(`Conversão concluída! Total de ${totalAtualizacoes} documentos atualizados.`);

  } catch (error) {
    console.error('Erro durante a conversão:', error);
  }
}

corrigirDatas();