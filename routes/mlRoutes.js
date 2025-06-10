const express = require('express');
const router = express.Router();
const { recommend } = require('../ml/recommender');
const RecomendacaoController = require('../controllers/recomendacaoController');

router.post('/recomendar', async (req, res) => {
  try {
    const { userId, tipo, cd_peso, cd_altura, genero, nm_aluno } = req.body;
    
    // Validação básica
    if (!tipo) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Tipo de treino é obrigatório'
      });
    }

    // Preparar dados do aluno
    const alunoData = {
      tipo,
      cd_peso,
      cd_altura,
      genero,
      nm_aluno
    };

    // Se tiver userId, complementa com dados do Firestore
    if (userId) {
      const dadosFirestore = await RecomendacaoController.obterDadosAluno(userId);
      Object.assign(alunoData, dadosFirestore);
    }

    // Gerar recomendação
    const recomendacao = await recommend(alunoData);

    // Salvar recomendação se userId estiver presente
    if (userId) {
      await RecomendacaoController.criarRecomendacao(
        userId, 
        recomendacao, 
        alunoData
      );
    }

    res.json({ sucesso: true, recomendacao });
  } catch (error) {
    console.error('Erro na recomendação:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
});

router.get('/historico/:userId', async (req, res) => {
  try {
    const historico = await RecomendacaoController.obterHistorico(req.params.userId);
    res.json({ sucesso: true, historico });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
});

module.exports = router;