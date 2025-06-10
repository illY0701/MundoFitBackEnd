// Importa a instância do Firestore do arquivo de configuração
const { db } = require('../utils/firebase');

// Classe para controlar as operações de recomendações
class RecomendacaoController {
  // Método para obter dados do aluno pelo ID (userId)
  static async obterDadosAluno(userId) {
    try {
      // Busca o documento do aluno na coleção 'alunos' pelo ID
      const alunoDoc = await db.collection('alunos').doc(userId).get();

      // Se o documento não existir, lança erro
      if (!alunoDoc.exists) {
        throw new Error('Aluno não encontrado');
      }

      // Retorna os dados do aluno encontrados
      return alunoDoc.data();
    } catch (error) {
      // Loga erro e repassa para quem chamou
      console.error('Erro ao obter dados do aluno:', error);
      throw error;
    }
  }

  // Método para criar uma nova recomendação para um usuário
  static async criarRecomendacao(userId, recomendacao, parametros) {
    try {
      // Adiciona um novo documento na coleção 'recomendacoes' com os dados passados
      const docRef = await db.collection('recomendacoes').add({
        userId,                // ID do usuário para quem a recomendação é
        data: new Date(),      // Data atual do registro
        recomendacao,          // Conteúdo da recomendação
        parametros,            // Parâmetros usados para gerar a recomendação
        utilizado: false       // Flag para indicar se recomendação já foi usada
      });

      // Retorna o ID do novo documento criado junto com os dados da recomendação
      return { id: docRef.id, ...recomendacao };
    } catch (error) {
      // Loga erro e repassa para quem chamou
      console.error('Erro ao criar recomendação:', error);
      throw error;
    }
  }

  // Método para obter histórico das últimas recomendações de um usuário
  static async obterHistorico(userId, limit = 5) {
    try {
      // Busca recomendações do usuário, ordenadas pela data decrescente, limitando a quantidade
      const snapshot = await db.collection('recomendacoes')
        .where('userId', '==', userId)
        .orderBy('data', 'desc')
        .limit(limit)
        .get();

      // Se não houver registros, retorna array vazio
      if (snapshot.empty) {
        return [];
      }

      // Mapeia cada documento para um objeto, convertendo o timestamp para Date do JS
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate() // converte Firestore Timestamp para Date
      }));
    } catch (error) {
      // Loga erro e repassa para quem chamou
      console.error('Erro ao obter histórico:', error);
      throw error;
    }
  }
}

// Exporta a classe para ser usada em outras partes do sistema
module.exports = RecomendacaoController;
