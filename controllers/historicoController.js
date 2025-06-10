const { db } = require('../utils/firebase');

// Criação de um novo registro no histórico de treinos
exports.createHistorico = async (req, res) => {
  try {
    const historicoData = req.body;

    // Se houver uma data informada, converte para formato ISO. Caso contrário, usa a data atual
    const dtTreino = historicoData.dt_treino_realizado 
      ? new Date(historicoData.dt_treino_realizado).toISOString()
      : new Date().toISOString();

    // Adiciona um novo documento à coleção 'historicos'
    const historicoRef = await db.collection('historicos').add({
      cd_fk_aluno: historicoData.cd_fk_aluno,         // Código do aluno
      cd_fk_treino: historicoData.cd_fk_treino,       // Código do treino
      dt_treino_realizado: dtTreino,                  // Data do treino realizado (formato ISO)
      cd_fk_peso: historicoData.cd_fk_peso,           // Código relacionado ao peso do aluno
      ds_comentarios: historicoData.ds_comentarios,   // Comentários adicionais
    });

    // Retorna o ID do novo histórico criado
    res.status(201).json({ id: historicoRef.id });
  } catch (error) {
    // Retorna erro interno do servidor
    res.status(500).json({ error: error.message });
  }
};

// Busca todos os históricos ou filtra por aluno se for passado via query
exports.getHistoricos = async (req, res) => {
  try {
    const { alunoId } = req.query;      // ID do aluno vindo pela URL (?alunoId=123)
    let query = db.collection('historicos');  // Referência à coleção

    // Se um aluno for especificado, aplica filtro por aluno
    if (alunoId) {
      query = query.where('cd_fk_aluno', '==', alunoId);
    }

    // Executa a consulta
    const snapshot = await query.get();
    const historicos = [];

    // Itera sobre cada documento e adiciona ao array de resultados
    snapshot.forEach(doc => historicos.push({ id: doc.id, ...doc.data() }));

    // Retorna todos os históricos encontrados
    res.status(200).json(historicos);
  } catch (error) {
    // Retorna erro interno do servidor
    res.status(500).json({ error: error.message });
  }
};

// Busca um único histórico pelo ID (usado para exibir detalhes)
exports.getHistoricoById = async (req, res) => {
  try {
    // Busca o documento pelo ID passado na URL (/historico/:id)
    const histDoc = await db.collection('historicos').doc(req.params.id).get();

    // Se o documento não existir, retorna erro 404
    if (!histDoc.exists) {
      return res.status(404).json({ error: 'Registro histórico não encontrado' });
    }

    // Retorna os dados do histórico
    res.status(200).json({ id: histDoc.id, ...histDoc.data() });
  } catch (error) {
    // Retorna erro interno do servidor
    res.status(500).json({ error: error.message });
  }
};

// Atualiza um histórico existente
exports.updateHistorico = async (req, res) => {
  try {
    const historicoData = req.body;

    // Atualiza o documento com o ID passado na URL
    await db.collection('historicos').doc(req.params.id).update(historicoData);

    // Retorna confirmação da atualização
    res.status(200).json({ message: 'Histórico atualizado com sucesso' });
  } catch (error) {
    // Retorna erro interno do servidor
    res.status(500).json({ error: error.message });
  }
};

// Remove um histórico específico pelo ID
exports.deleteHistorico = async (req, res) => {
  try {
    // Deleta o documento com o ID informado
    await db.collection('historicos').doc(req.params.id).delete();

    // Retorna confirmação da exclusão
    res.status(200).json({ message: 'Histórico removido com sucesso' });
  } catch (error) {
    // Retorna erro interno do servidor
    res.status(500).json({ error: error.message });
  }
};

// Retorna todos os treinos concluídos por um aluno (ou seja, históricos com treino vinculado)
exports.getTreinosConcluidosByAluno = async (req, res) => {
  try {
    const alunoId = req.query.alunoId;  // ID do aluno vindo pela query

    // Busca todos os históricos onde o aluno corresponde e o treino está preenchido
    const snapshot = await db.collection('historicos')
      .where('cd_fk_aluno', '==', alunoId)
      .where('cd_fk_treino', '!=', null) // Garante que o treino foi concluído
      .get();

    const historicos = [];
    snapshot.forEach(doc => historicos.push({ id: doc.id, ...doc.data() }));

    // Retorna os históricos encontrados
    res.status(200).json(historicos);
  } catch (error) {
    // Loga o erro no console do backend para depuração
    console.error('[BACK] Erro ao buscar treinos concluídos:', error);

    // Retorna erro interno do servidor
    res.status(500).json({ error: error.message });
  }
};
