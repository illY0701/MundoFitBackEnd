// controllers/exercicioController.js

// Importa o objeto 'db' do arquivo de utilidades Firebase para interagir com o Firestore
const { db } = require('../utils/firebase');

/**
 * Cria um novo exercício na coleção 'exercicios' do Firestore.
 * Espera receber no corpo da requisição os campos:
 * - nm_exercicio: Nome do exercício
 * - ds_exercicio: Descrição do exercício
 * - tipo_exercicio: Tipo ou categoria do exercício
 */
exports.createExercicio = async (req, res) => {
  try {
    // Recupera os dados do exercício enviados no corpo da requisição
    const exercicioData = req.body;

    // Adiciona o novo exercício ao Firestore
    const exercicioRef = await db.collection('exercicios').add({
      nm_exercicio: exercicioData.nm_exercicio,
      ds_exercicio: exercicioData.ds_exercicio,
      tipo_exercicio: exercicioData.tipo_exercicio,
    });

    // Retorna sucesso com o ID gerado do novo documento
    res.status(201).json({ id: exercicioRef.id });
  } catch (error) {
    // Em caso de erro, retorna erro 500 e a mensagem
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lista todos os exercícios registrados na coleção 'exercicios'.
 * Cada documento é retornado com seu ID e seus dados correspondentes.
 */
exports.getExercicios = async (req, res) => {
  try {
    // Recupera todos os documentos da coleção 'exercicios'
    const snapshot = await db.collection('exercicios').get();

    // Inicializa array que armazenará os exercícios formatados
    const exercicios = [];

    // Itera sobre os documentos retornados e formata os dados
    snapshot.forEach(doc => exercicios.push({ id: doc.id, ...doc.data() }));

    // Retorna lista completa dos exercícios
    res.status(200).json(exercicios);
  } catch (error) {
    // Em caso de erro, retorna erro 500 com mensagem
    res.status(500).json({ error: error.message });
  }
};

/**
 * Busca um exercício específico pelo seu ID (recebido via parâmetros na URL).
 * Retorna os dados do exercício encontrado ou erro 404 se não existir.
 */
exports.getExercicioById = async (req, res) => {
  try {
    // Busca o documento pelo ID fornecido nos parâmetros da requisição
    const exerDoc = await db.collection('exercicios').doc(req.params.id).get();

    // Verifica se o documento existe
    if (!exerDoc.exists) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }

    // Retorna os dados do exercício encontrado
    res.status(200).json({ id: exerDoc.id, ...exerDoc.data() });
  } catch (error) {
    // Em caso de erro, retorna erro 500 com a mensagem de exceção
    res.status(500).json({ error: error.message });
  }
};

/**
 * Atualiza os dados de um exercício existente.
 * Espera receber no corpo da requisição os campos a serem atualizados.
 * O ID do exercício deve ser informado na URL.
 */
exports.updateExercicio = async (req, res) => {
  try {
    // Recupera os novos dados enviados no corpo da requisição
    const exercicioData = req.body;

    // Atualiza o documento com os novos dados usando o ID fornecido
    await db.collection('exercicios').doc(req.params.id).update(exercicioData);

    // Retorna mensagem de sucesso
    res.status(200).json({ message: 'Exercício atualizado com sucesso' });
  } catch (error) {
    // Em caso de erro, retorna erro 500 com mensagem detalhada
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove um exercício da coleção com base no ID fornecido na URL.
 * Utiliza o método delete() do Firestore.
 */
exports.deleteExercicio = async (req, res) => {
  try {
    // Remove o documento com o ID especificado
    await db.collection('exercicios').doc(req.params.id).delete();

    // Retorna confirmação de remoção
    res.status(200).json({ message: 'Exercício removido com sucesso' });
  } catch (error) {
    // Em caso de erro, retorna erro 500 com mensagem
    res.status(500).json({ error: error.message });
  }
};
