// test/apiTest.js
const axios = require('axios');
const baseURL = 'http://localhost:3000';

async function testAlunos(){
  try {
    console.log("=== Teste: Alunos ===");
    // Criar aluno
    let aluno = {
      nm_aluno: "César Rodrigues",
      status_aluno: "ativo",
      email_aluno: "cesar@gmail.com",
      cd_senha_al: "cesinha",
      cd_peso: "76kg",
      cd_altura: "1.78m"
    };
    let response = await axios.post(`${baseURL}/alunos`, aluno);
    console.log("Aluno criado:", response.data);
    const alunoId = response.data.id;

    // Listar alunos
    console.log("============================================")
    response = await axios.get(`${baseURL}/alunos`);
    console.log("Lista de alunos:", response.data);

    // Buscar aluno por ID
    console.log("============================================")
    response = await axios.get(`${baseURL}/alunos/${alunoId}`);
    console.log("Detalhes do aluno:", response.data);

    // Atualizar aluno
    console.log("============================================")
    let updateData = { nm_aluno: "César  com nome Atualizado" };
    response = await axios.put(`${baseURL}/alunos/${alunoId}`, updateData);
    console.log("Aluno atualizado:", response.data);

    // Remover aluno
    console.log("============================================")
    response = await axios.delete(`${baseURL}/alunos/${alunoId}`);
    console.log("Aluno removido:", response.data);
    console.log("\n");
  } catch (error) {
    console.error("Erro em aluno endpoints:", error.response?.data || error.message);
  }
}

async function testProfessores(){
  try {
    console.log("=== Teste: Professores ===");
    // Criar professor
    let professor = {
      nm_professor: "Anna Isabelle",
      email_professor: "bebelle@mimi.com",
      cd_senha_pf: "mimireal",
      ds_especialidade: "Emagrecimento"
    };
    let response = await axios.post(`${baseURL}/professores`, professor);
    console.log("Professor criado:", response.data);
    const professorId = response.data.id;

    // Listar professores
    console.log("============================================")
    response = await axios.get(`${baseURL}/professores`);
    console.log("Lista de professores:", response.data);

    // Buscar professor por ID
    console.log("============================================")
    response = await axios.get(`${baseURL}/professores/${professorId}`);
    console.log("Detalhes do professor:", response.data);

    // Atualizar professor
    console.log("============================================")
    let updateData = { nm_professor: "Professor Atualizado" };
    response = await axios.put(`${baseURL}/professores/${professorId}`, updateData);
    console.log("Professor atualizado:", response.data);

    // Remover professor
    console.log("============================================")
    response = await axios.delete(`${baseURL}/professores/${professorId}`);
    console.log("Professor removido:", response.data);
    console.log("\n");
  } catch (error) {
    console.error("Erro em professor endpoints:", error.response?.data || error.message);
  }
}

async function testExercicios(){
  try {
    console.log("=== Teste: Exercícios ===");
    // Criar exercício
    let exercicio = {
      nm_exercicio: "Esteira",
      ds_exercicio: "Fazer esteira por 30 minutos.",
      tipo_exercicio: "Cardio"
    };
    let response = await axios.post(`${baseURL}/exercicios`, exercicio);
    console.log("Exercício criado:", response.data);
    const exercicioId = response.data.id;

    // Listar exercícios
    console.log("============================================")
    response = await axios.get(`${baseURL}/exercicios`);
    console.log("Lista de exercícios:", response.data);

    // Buscar exercício por ID
    console.log("============================================")
    response = await axios.get(`${baseURL}/exercicios/${exercicioId}`);
    console.log("Detalhes do exercício:", response.data);

    // Atualizar exercício
    console.log("============================================")
    let updateData = { nm_exercicio: "Exercício Atualizado" };
    response = await axios.put(`${baseURL}/exercicios/${exercicioId}`, updateData);
    console.log("Exercício atualizado:", response.data);

    // Remover exercício
    console.log("============================================")
    response = await axios.delete(`${baseURL}/exercicios/${exercicioId}`);
    console.log("Exercício removido:", response.data);
    console.log("\n");
  } catch (error) {
    console.error("Erro em exercício endpoints:", error.response?.data || error.message);
  }
}

async function testTreinos(){
  try {
    console.log("=== Teste: Treinos ===");
    // Criar aluno
    let aluno = {
      nm_aluno: "Evily",
      email_aluno: "evily@fatec.com",
      cd_senha_al: "12345",
      cd_peso: "70kg",
      cd_altura: "1.75m"
    };
    let response = await axios.post(`${baseURL}/alunos`, aluno);
    const alunoId = response.data.id;

    // Criar professor
    let professor = {
      nm_professor: "Anna Isabelle",
      email_professor: "bebelle@mimi.com",
      cd_senha_pf: "12345",
      ds_especialidade: "Emagrecimento"
    };
    response = await axios.post(`${baseURL}/professores`, professor);
    const professorId = response.data.id;

    // Criar exercício
    console.log("============================================")
    let exercicio = {
      nm_exercicio: "Treino Exercício",
      ds_exercicio: "Descrição do treino exercício",
      tipo_exercicio: "Strength"
    };
    response = await axios.post(`${baseURL}/exercicios`, exercicio);
    const exercicioId = response.data.id;

    // Criar treino
    console.log("============================================")
    let treino = {
      nm_treino: "Cintura",
      nm_fk_exercicio: "Treino Exercício",
      cd_fk_exercicio: exercicioId,
      cd_fk_aluno: alunoId,
      cd_fk_professor: professorId,
      dt_treino: new Date(),
      ds_objetivo: "Afinar a cintura",
      ds_observacao: "Fazer toda a avaliação da cintura para otimização dos treinos"
    };
    response = await axios.post(`${baseURL}/treinos`, treino);
    console.log("Treino criado:", response.data);
    const treinoId = response.data.id;

    // Listar treinos
    console.log("============================================")
    response = await axios.get(`${baseURL}/treinos`);
    console.log("Lista de treinos:", response.data);

    // Buscar treino por ID
    console.log("============================================")
    response = await axios.get(`${baseURL}/treinos/${treinoId}`);
    console.log("Detalhes do treino:", response.data);

    // Atualizar treino
    console.log("============================================")
    let updateData = { nm_treino: "Treino Atualizado" };
    response = await axios.put(`${baseURL}/treinos/${treinoId}`, updateData);
    console.log("Treino atualizado:", response.data);

    // Remover treino
    console.log("============================================")
    response = await axios.delete(`${baseURL}/treinos/${treinoId}`);
    console.log("Treino removido:", response.data);
    console.log("\n");
  } catch (error) {
    console.error("Erro em treino endpoints:", error.response?.data || error.message);
  }
}

async function testHistoricos(){
  try {
    console.log("=== Teste: Histórico de Treinos ===");
    // Criar aluno
    let aluno = {
      nm_aluno: "Histórico Aluno",
      email_aluno: "historicoaluno@example.com",
      cd_senha_al: "12345",
      cd_peso: "70kg",
      cd_altura: "1.75m"
    };
    let response = await axios.post(`${baseURL}/alunos`, aluno);
    const alunoId = response.data.id;

    // Criar professor
    let professor = {
      nm_professor: "Histórico Professor",
      email_professor: "historicoprofessor@example.com",
      cd_senha_pf: "12345",
      ds_especialidade: "Fitness"
    };
    response = await axios.post(`${baseURL}/professores`, professor);
    const professorId = response.data.id;

    // Criar exercício
    let exercicio = {
      nm_exercicio: "Histórico Exercício",
      ds_exercicio: "Descrição do exercício",
      tipo_exercicio: "Flexibilidade"
    };
    response = await axios.post(`${baseURL}/exercicios`, exercicio);
    const exercicioId = response.data.id;

    // Criar treino
    let treino = {
      nm_treino: "Histórico Treino",
      nm_fk_exercicio: "Histórico Exercício",
      cd_fk_exercicio: exercicioId,
      cd_fk_aluno: alunoId,
      cd_fk_professor: professorId,
      dt_treino: new Date(),
      ds_objetivo: "Objetivo do treino",
      ds_observacao: "Observações"
    };
    response = await axios.post(`${baseURL}/treinos`, treino);
    const treinoId = response.data.id;

    // Criar registro histórico
    let historico = {
      cd_fk_aluno: alunoId,
      cd_fk_treino: treinoId,
      dt_treino_realizado: new Date(),
      cd_fk_peso: "70kg",
      ds_comentarios: "Treino realizado com sucesso"
    };
    response = await axios.post(`${baseURL}/historicos`, historico);
    console.log("Histórico criado:", response.data);
    const historicoId = response.data.id;

    // Listar históricos
    response = await axios.get(`${baseURL}/historicos`);
    console.log("Lista de históricos:", response.data);

    // Buscar histórico por ID
    response = await axios.get(`${baseURL}/historicos/${historicoId}`);
    console.log("Detalhes do histórico:", response.data);

    // Atualizar histórico
    let updateData = { ds_comentarios: "Histórico Atualizado" };
    response = await axios.put(`${baseURL}/historicos/${historicoId}`, updateData);
    console.log("Histórico atualizado:", response.data);

    
  } catch (error) {
    console.error("Erro em histórico endpoints:", error.response?.data || error.message);
  }
}

async function runTests(){
  await testAlunos();
  await testProfessores();
  await testExercicios();
  await testTreinos();
  await testHistoricos();
}

runTests();
