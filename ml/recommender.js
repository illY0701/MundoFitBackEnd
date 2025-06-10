const { db } = require('../utils/firebase');

// Definição dos tipos de treino e seus grupos musculares relacionados
const TIPOS_TREINO = {
  'superiores': ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],  // Músculos membros superiores
  'inferiores': ['Pernas', 'Glúteos', 'Panturrilha'],               // Músculos membros inferiores
  'core': ['Abdômen', 'Lombar'],                                   // Core (abdômen, lombar)
  'cardio': ['Cardio', 'HIIT', 'Circuito'],                        // Exercícios cardiovasculares
  'funcional': ['Funcional', 'Calistenia', 'Cross Training']       // Treinos funcionais
};

let exerciciosCache = null; // Cache para armazenar exercícios e evitar várias consultas

// Função para carregar exercícios do Firestore (Firebase)
async function carregarExercicios() {
  if (exerciciosCache) return exerciciosCache; // Se já estiver no cache, retorna imediatamente

  try {
    const snapshot = await db.collection('exercicios').get(); // Busca todos os exercícios da coleção
    exerciciosCache = [];

    // Percorre cada documento retornado e adiciona no cache
    snapshot.forEach(doc => {
      exerciciosCache.push({
        id: doc.id,       // ID do documento
        ...doc.data()     // Dados do exercício (nome, tipo, descrição, etc)
      });
    });

    return exerciciosCache; // Retorna o array com os exercícios carregados
  } catch (error) {
    console.error('Erro ao carregar exercícios:', error);
    throw error; // Repasse o erro para tratamento externo
  }
}

// Função que filtra exercícios pelo tipo de treino (superiores, inferiores, etc)
function filtrarExerciciosPorTipo(exercicios, tipo) {
  // Pega os grupos musculares relacionados ao tipo informado, ou vazio se não existir
  const gruposMusculares = TIPOS_TREINO[tipo] || [];

  // Filtra só os exercícios cujo campo 'tipo_exercicio' contenha algum grupo muscular do tipo
  return exercicios.filter(ex =>
    gruposMusculares.some(grupo => ex.tipo_exercicio.includes(grupo))
  );
}

// Inicializa o sistema, carregando exercícios e exibindo logs
async function initialize() {
  try {
    console.log('🔄 Carregando exercícios...');
    await carregarExercicios(); // Carrega e cacheia exercícios
    console.log('✅ Sistema inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
    return false;
  }
}

// Gera uma recomendação de treino simples para o aluno, com base no tipo de treino
async function recommend(aluno) {
  try {
    if (!aluno.tipo) throw new Error('Tipo de treino não especificado'); // Validação simples

    // Busca todos os exercícios (usando cache se possível)
    const todosExercicios = await carregarExercicios();

    // Filtra os exercícios conforme o tipo do aluno
    let exerciciosFiltrados = filtrarExerciciosPorTipo(todosExercicios, aluno.tipo);

    // Caso não encontre exercícios específicos para o tipo, usa todos os exercícios como fallback
    if (exerciciosFiltrados.length === 0) {
      exerciciosFiltrados = todosExercicios;
    }

    // Seleciona aleatoriamente 9 exercícios da lista filtrada
    const exerciciosSelecionados = [...exerciciosFiltrados]
      .sort(() => 0.9 - Math.random()) // Embaralha
      .slice(0, 9);                    // Pega os primeiros 9

    // Monta e retorna o objeto de recomendação
    return {
      tipo: aluno.tipo,
      exercicios: exerciciosSelecionados.map(ex => ({
        id: ex.id,
        nome: ex.nm_exercicio,
        tipo: ex.tipo_exercicio,
        descricao: ex.ds_exercicio || 'Sem descrição' // Coloca descrição padrão se não tiver
      })),
      observacoes: [
        aluno.nm_aluno ? `Recomendação para ${aluno.nm_aluno}` : 'Recomendação genérica'
      ]
    };
  } catch (error) {
    console.error('Erro ao gerar recomendação:', error);
    return {
      tipo: aluno.tipo || 'erro',
      exercicios: [],
      observacoes: ['Erro: ' + error.message]
    };
  }
}

module.exports = {
  initialize,
  recommend,
  carregarExercicios
};
