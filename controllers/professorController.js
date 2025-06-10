// Importa o banco de dados Firestore configurado e a biblioteca bcrypt para criptografar senhas
const { db } = require('../utils/firebase');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Define o número de rounds para o hash da senha

// Função para criar um novo professor
exports.createProfessor = async (req, res) => {
  try {
    const professorData = req.body; // Recebe os dados do corpo da requisição
    
    // Verifica se o e-mail já está cadastrado na coleção 'professores'
    const emailExists = await db.collection('professores')
      .where('email_professor', '==', professorData.email_professor)
      .get();
    
    // Se já existir, retorna erro
    if (!emailExists.empty) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criptografa a senha antes de salvar no banco
    const hashedPassword = await bcrypt.hash(professorData.cd_senha_pf, saltRounds);
    
    // Cria um novo professor com os dados fornecidos e a senha criptografada
    const professorRef = await db.collection('professores').add({
      ...professorData,                          // Todos os dados recebidos
      cd_senha_pf: hashedPassword,              // Substitui a senha pela versão criptografada
      dt_cadastro_professor: new Date(),        // Adiciona a data de cadastro atual
    });
    
    // Retorna o ID do novo professor criado
    res.status(201).json({ id: professorRef.id });
  } catch (error) {
    // Retorna erro interno do servidor, caso ocorra
    res.status(500).json({ error: error.message });
  }
};

// Função para buscar todos os professores cadastrados
exports.getProfessores = async (req, res) => {
  try {
    const snapshot = await db.collection('professores').get(); // Pega todos os documentos da coleção
    const professores = [];

    // Monta um array com os dados de cada professor
    snapshot.forEach(doc => professores.push({ id: doc.id, ...doc.data() }));

    // Retorna a lista de professores
    res.status(200).json(professores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para buscar um único professor pelo ID
exports.getProfessorById = async (req, res) => {
  try {
    const profDoc = await db.collection('professores').doc(req.params.id).get();

    // Se não encontrar, retorna erro 404
    if (!profDoc.exists) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }

    // Retorna os dados do professor
    res.status(200).json({ id: profDoc.id, ...profDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para atualizar os dados de um professor
exports.updateProfessor = async (req, res) => {
  try {
    const professorData = req.body;

    // Se estiver sendo enviada uma nova senha, criptografa antes de salvar
    if (professorData.cd_senha_pf) {
      professorData.cd_senha_pf = await bcrypt.hash(professorData.cd_senha_pf, saltRounds);
    }

    // Atualiza os dados do professor com o ID especificado
    await db.collection('professores').doc(req.params.id).update(professorData);

    // Retorna mensagem de sucesso
    res.status(200).json({ message: 'Professor atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para deletar um professor pelo ID
exports.deleteProfessor = async (req, res) => {
  try {
    // Remove o professor com o ID especificado
    await db.collection('professores').doc(req.params.id).delete();

    // Retorna mensagem de sucesso
    res.status(200).json({ message: 'Professor removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
