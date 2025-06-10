// controllers/alunoController.js

// Importa a instância do Firebase configurada no projeto
const { db } = require('../utils/firebase');

// Importa o módulo bcrypt para realizar a criptografia das senhas dos alunos
const bcrypt = require('bcrypt');

// Importa o módulo crypto para geração de código aleatório para recuperação de senha
const crypto = require('crypto');

// Define o número de saltos usados na criptografia de senha
const saltRounds = 10;

/**
 * Criação de um novo aluno na base de dados Firebase
 * Criptografa a senha fornecida, define campos obrigatórios e adiciona data de cadastro
 */
exports.createAluno = async (req, res) => {
  try {
    const alunoData = req.body; // Dados enviados no corpo da requisição

    // Criptografa a senha do aluno antes de armazenar no banco
    const hashedPassword = await bcrypt.hash(alunoData.cd_senha_al, saltRounds);

    // Cria um novo documento na coleção 'alunos'
    const alunoRef = await db.collection('alunos').add({
      nm_aluno: alunoData.nm_aluno, // Nome do aluno
      status_aluno: alunoData.status_aluno || 'ativo', // Status com valor padrão "ativo"
      email_aluno: alunoData.email_aluno, // E-mail do aluno
      cd_senha_al: hashedPassword, // Senha criptografada
      dt_cadastro: new Date().toISOString(), // Data/hora do cadastro
      cd_peso: alunoData.cd_peso, // Peso atual do aluno
      cd_altura: alunoData.cd_altura, // Altura do aluno
      genero: alunoData.genero, // Gênero do aluno
      peso_meta: null, // Campo reservado para peso meta futuro
    });

    // Retorna o ID do novo aluno criado
    res.status(201).json({ id: alunoRef.id });
  } catch (error) {
    // Retorna erro 500 em caso de falha
    res.status(500).json({ error: error.message });
  }
};

/**
 * Recupera a lista completa de alunos cadastrados
 * Lê todos os documentos da coleção 'alunos' e retorna como array
 */
exports.getAlunos = async (req, res) => {
  try {
    const snapshot = await db.collection('alunos').get(); // Busca todos os alunos
    const alunos = [];

    // Itera sobre cada documento e adiciona ao array com o ID incluso
    snapshot.forEach(doc => alunos.push({ id: doc.id, ...doc.data() }));

    // Retorna o array de alunos com status 200
    res.status(200).json(alunos);
  } catch (error) {
    // Retorna erro 500 em caso de falha
    res.status(500).json({ error: error.message });
  }
};

/**
 * Busca um único aluno pelo ID
 * Verifica se o documento existe e retorna os dados completos
 */
exports.getAlunoById = async (req, res) => {
  try {
    const alunoDoc = await db.collection('alunos').doc(req.params.id).get();

    // Verifica se o aluno existe
    if (!alunoDoc.exists) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Retorna os dados do aluno
    res.status(200).json({ id: alunoDoc.id, ...alunoDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Atualiza os dados de um aluno com base no ID
 * Converte a data de cadastro se fornecida e atualiza os campos enviados
 */
exports.updateAluno = async (req, res) => {
  try {
    const alunoData = req.body;

    // Converte a data de cadastro para formato ISO, se presente
    if (alunoData.dt_cadastro) {
      alunoData.dt_cadastro = new Date(alunoData.dt_cadastro).toISOString();
    }

    // Atualiza o documento correspondente
    await db.collection('alunos').doc(req.params.id).update(alunoData);

    res.status(200).json({ mensagem: 'Aluno atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove um aluno com base no ID fornecido
 * Exclui o documento da coleção 'alunos'
 */
exports.deleteAluno = async (req, res) => {
  try {
    await db.collection('alunos').doc(req.params.id).delete();
    res.status(200).json({ mensagem: 'Aluno removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Geração e envio de código de recuperação de senha
 * Valida o e-mail fornecido, gera código numérico e armazena temporariamente
 */
exports.recuperarSenha = async (req, res) => {
  try {
    const { email } = req.body;

    // Normaliza o e-mail (tira espaços e deixa minúsculo)
    const emailLower = email.trim().toLowerCase();

    // Log para debug: e-mail recebido (temporário, remover em produção)
    console.error(`recuperarSenha recebeu email (entre aspas): "${emailLower}"`);

    // Verifica se há aluno com o e-mail informado
    const alunoSnapshot = await db
      .collection('alunos')
      .where('email_aluno', '==', emailLower)
      .limit(1)
      .get();

    if (alunoSnapshot.empty) {
      return res.status(404).json({ mensagem: 'E-mail não encontrado' });
    }

    // Captura o documento e ID do aluno
    const alunoDoc = alunoSnapshot.docs[0];
    const alunoId = alunoDoc.id;

    // Gera um código de 6 dígitos
    const codigo = crypto.randomInt(100000, 999999).toString();

    // Define validade de 15 minutos a partir da geração
    const validade = new Date(Date.now() + 15 * 60000);

    // Armazena o código no Firestore (coleção específica)
    await db.collection('codigosRecuperacao').doc(emailLower).set({
      codigo,
      validade: validade.toISOString(),
      alunoId,
    });

    // Log do código (somente para desenvolvimento - REMOVER EM PRODUÇÃO)
    console.log(`Código de recuperação para ${emailLower}: ${codigo}`);

    // Retorna confirmação e código (para testes)
    res.status(200).json({
      mensagem: 'Código de recuperação enviado para seu e-mail',
      alunoId,
      codigo, // ⚠️ Retirar em ambiente de produção
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Redefine a senha de um aluno baseado no ID
 * A nova senha é criptografada antes de ser atualizada
 */
exports.redefinirSenha = async (req, res) => {
  try {
    const { alunoId, novaSenha } = req.body;

    // Validação de presença dos campos
    if (!alunoId || !novaSenha) {
      return res.status(400).json({ mensagem: 'Dados incompletos' });
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);

    // Atualiza o campo de senha
    await db.collection('alunos').doc(alunoId).update({
      cd_senha_al: hashedPassword,
    });

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

/**
 * Redefine a senha diretamente pelo e-mail (sem código de verificação)
 * Verifica a existência do e-mail e atualiza a senha correspondente
 */
exports.redefinirSenhaSimples = async (req, res) => {
  try {
    const { email, novaSenha } = req.body;

    // Validação de campos obrigatórios
    if (!email || !novaSenha) {
      return res.status(400).json({ mensagem: 'Informe email e nova senha' });
    }

    // Busca o aluno com e-mail informado
    const alunoSnapshot = await db
      .collection('alunos')
      .where('email_aluno', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (alunoSnapshot.empty) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Pega o ID do documento do aluno
    const alunoDoc = alunoSnapshot.docs[0];
    const alunoId = alunoDoc.id;

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);

    // Atualiza a senha no banco
    await db.collection('alunos').doc(alunoId).update({
      cd_senha_al: hashedPassword,
    });

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
