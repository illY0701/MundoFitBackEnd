// Importa a instância do Firestore configurada
const { db } = require('../utils/firebase');

// Função para criar um treino novo
exports.createTreino = async (req, res) => {
  try {
    const treinoData = req.body; // Recebe dados do treino via corpo da requisição

    // Adiciona um novo documento na coleção 'treinos' com os dados recebidos
    const treinoRef = await db.collection('treinos').add({
      nm_treino: treinoData.nm_treino,             // Nome do treino
      nm_fk_exercicio: treinoData.nm_fk_exercicio, // Nome do exercício relacionado
      cd_fk_exercicio: treinoData.cd_fk_exercicio, // Código do exercício
      cd_fk_aluno: treinoData.cd_fk_aluno,         // Código do aluno
      cd_fk_professor: treinoData.cd_fk_professor, // Código do professor
      dt_treino: treinoData.dt_treino || new Date(), // Data do treino, ou a data atual se não fornecida
      ds_objetivo: treinoData.ds_objetivo,         // Descrição do objetivo do treino
      ds_observacao: treinoData.ds_observacao,     // Observações adicionais
      nm_dia_semana: treinoData.nm_dia_semana,     // Nome do dia da semana do treino

      // Campos adicionados recentemente
      qtd_carga: treinoData.qtd_carga,              // Quantidade de carga (peso)
      cd_serie: Number(treinoData.cd_serie),        // Número da série, convertido para número
      qtd_repeticoes: Number(treinoData.qtd_repeticoes) // Quantidade de repetições, convertido para número
    });

    // Responde com status 201 (Criado) e o id do treino criado
    res.status(201).json({ id: treinoRef.id });
  } catch (error) {
    // Em caso de erro, responde com status 500 e a mensagem do erro
    res.status(500).json({ error: error.message });
  }
};

// Função para obter treinos, possivelmente filtrando por aluno e dia da semana
exports.getTreinos = async (req, res) => {
  try {
    const { alunoId, diaSemana } = req.query; // Pega filtros da query string
    let query = db.collection('treinos');      // Começa a consulta na coleção 'treinos'

    // Objeto para normalizar nomes curtos dos dias para nomes completos
    const diasCompletos = {
      'segunda': 'Segunda-feira',
      'terca': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };

    // Normaliza o dia recebido para o formato completo
    const diaFormatado = diasCompletos[diaSemana?.toLowerCase()] || diaSemana;

    // Aplica filtros na consulta se forem fornecidos
    if (alunoId) query = query.where('cd_fk_aluno', '==', alunoId);
    if (diaFormatado) query = query.where('nm_dia_semana', '==', diaFormatado);

    // Executa a consulta
    const snapshot = await query.get();

    // Mapeia os documentos para um array de objetos contendo id e dados do treino
    const treinos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Retorna os treinos encontrados com status 200
    res.status(200).json(treinos);
  } catch (error) {
    // Em caso de erro, responde com status 500 e mensagem do erro
    res.status(500).json({ error: error.message });
  }
};

// Função para obter um treino pelo seu ID
exports.getTreinoById = async (req, res) => {
  try {
    // Busca o documento do treino pelo ID na URL
    const treinoDoc = await db.collection('treinos').doc(req.params.id).get();

    // Se não existir, retorna erro 404
    if (!treinoDoc.exists) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    // Retorna o treino encontrado com status 200
    res.status(200).json({ id: treinoDoc.id, ...treinoDoc.data() });
  } catch (error) {
    // Em caso de erro, responde com status 500 e mensagem do erro
    res.status(500).json({ error: error.message });
  }
};

// Função para atualizar um treino pelo ID
exports.updateTreino = async (req, res) => {
  try {
    const treinoData = req.body; // Dados atualizados do treino

    // Atualiza o documento na coleção 'treinos' com os novos dados
    await db.collection('treinos').doc(req.params.id).update(treinoData);

    // Logs simples no console para indicar sucesso
    console.log("=============================================");
    res.status(200).json({ message: 'Treino atualizado com sucesso' });
    console.log("=============================================");
  } catch (error) {
    // Em caso de erro, responde com status 500 e mensagem do erro
    res.status(500).json({ error: error.message });
  }
};

// Função para deletar um treino pelo ID
exports.deleteTreino = async (req, res) => {
  try {
    // Remove o documento da coleção 'treinos' pelo ID
    await db.collection('treinos').doc(req.params.id).delete();

    // Logs simples no console para indicar sucesso
    console.log("=============================================");
    res.status(200).json({ message: 'Treino removido com sucesso' });
    console.log("=============================================");
  } catch (error) {
    // Em caso de erro, responde com status 500 e mensagem do erro
    res.status(500).json({ error: error.message });
  }
};
