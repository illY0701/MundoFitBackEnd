//Index

/**
 * Módulos essenciais
 */
const express = require('express');
const cors = require('cors');
const os = require('os');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { db } = require('./utils/firebase');

/**
 * Importação de rotas modulares
 */
const alunoRoutes = require('./routes/alunoRoutes');
const professorRoutes = require('./routes/professorRoutes');
const exercicioRoutes = require('./routes/exercicioRoutes');
const treinoRoutes = require('./routes/treinoRoutes');
const historicoRoutes = require('./routes/historicoRoutes');
const mlRoutes = require('./routes/mlRoutes');

/**
 * Configuração do Express
 */
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES GLOBAIS ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== MONITORAMENTO DO SISTEMA ====================
let sistemaStatus = {
  mlModelReady: false,
  lastTrainingAttempt: null,
  dbConnected: false,
  serverStarted: null,
  nodeVersion: process.version,
  lastError: null
};

/**
 * Funções auxiliares
 */
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.values(interfaces)) {
    for (const iface of interfaceName) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// ==================== INICIALIZAÇÃO ASSÍNCRONA ====================
async function initializeSystem() {
  try {
    console.log('⚙ Iniciando inicialização do sistema...');
    
    // 1. Conexão com Firebase
    console.log('🔗 Conectando ao Firebase...');
    await db.collection('system').doc('status').get();
    sistemaStatus.dbConnected = true;
    console.log('✅ Conexão com Firebase estabelecida');

    // 2. Inicialização do Modelo de ML
    console.log('🧠 Inicializando modelo de ML...');
    const { initialize } = require('./ml/recommender');
    sistemaStatus.mlModelReady = await initialize(); // Corrigido para await
    sistemaStatus.lastTrainingAttempt = new Date().toISOString();
    console.log('✅ Modelo de ML inicializado');

    // 3. Iniciar servidor
    app.listen(PORT, () => {
      const ip = getLocalIPAddress();
      sistemaStatus.serverStarted = new Date().toISOString();
      
      console.log(`
      =============================================
      ███╗   ███╗██╗   ██╗███╗   ██╗██████╗  ██████╗
      ████╗ ████║██║   ██║████╗  ██║██╔══██╗██╔════╝
      ██╔████╔██║██║   ██║██╔██╗ ██║██║  ██║██║     
      ██║╚██╔╝██║██║   ██║██║╚██╗██║██║  ██║██║     
      ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██████╔╝╚██████╗
      ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚═════╝
      
      MundoFit Backend 2.1 - ONLINE 🚀
      Local:    http://localhost:${PORT}
      Rede:     http://${ip}:${PORT}
      Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}
      =============================================`);
    });

  } catch (error) {
    console.error('💥 Erro crítico na inicialização:', error);
    sistemaStatus.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    process.exit(1);
  }
}

// ==================== ROTEAMENTO PRINCIPAL ====================
app.get('/', (req, res) => {
  res.send(`
    ███╗   ███╗██╗   ██╗███╗   ██╗██████╗  ██████╗
    ████╗ ████║██║   ██║████╗  ██║██╔══██╗██╔════╝
    ██╔████╔██║██║   ██║██╔██╗ ██║██║  ██║██║     
    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║  ██║██║     
    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██████╔╝╚██████╗
    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚═════╝
    
    MundoFit API 2.1\n
    Endpoints disponíveis:
    - /alunos
    - /professores
    - /exercicios
    - /treinos
    - /historicos
    - /ml/recomendar
    - /login
    - /system/status
  `);
});

// ==================== REGISTRO DE ROTAS ====================
app.use('/alunos', alunoRoutes);
app.use('/professores', professorRoutes);
app.use('/exercicios', exercicioRoutes);
app.use('/treinos', treinoRoutes);
app.use('/historicos', historicoRoutes);
app.use('/ml', mlRoutes);

// ==================== ROTAS DE AUTENTICAÇÃO (OTIMIZADA) ====================
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificação paralela de usuários
    const [professoresSnapshot, alunosSnapshot] = await Promise.all([
      db.collection('professores').get(),
      db.collection('alunos').get()
    ]);

    // Verificação do Admin
    if (email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_SENHA) {
      return res.json({ 
        tipoUsuario: 'admin',
        sistemaStatus
      });
    }

    // Verificação de Professores
    const professor = professoresSnapshot.docs.find(doc => 
      doc.data().email_professor === email && 
      bcrypt.compareSync(senha, doc.data().cd_senha_pf)
    );

    if (professor) {
      return res.json({ 
        tipoUsuario: 'professor',
        id: professor.id,
        nome: professor.data().nm_professor,
        sistemaStatus
      });
    }

    // Verificação de Alunos
    const aluno = alunosSnapshot.docs.find(doc => 
      doc.data().email_aluno === email && 
      bcrypt.compareSync(senha, doc.data().cd_senha_al)
    );

    if (aluno) {
      return res.json({ 
        tipoUsuario: 'aluno',
        id: aluno.id,
        nome: aluno.data().nm_aluno,
        sistemaStatus
      });
    }

    res.status(401).json({ 
      sucesso: false,
      mensagem: 'Credenciais inválidas' 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      sucesso: false,
      error: 'Erro interno no servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== ROTAS DE STATUS ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    versao: '2.1.0',
    timestamp: new Date().toISOString(),
    sistema: 'MundoFit Backend',
    recursos: [
      'Autenticação',
      'Gestão de Alunos',
      'Gestão de Professores',
      'Gestão de Exercícios',
      'Recomendação Inteligente'
    ]
  });
});

app.get('/system/status', (req, res) => {
  res.json({
    status: sistemaStatus,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/historicos', async (req, res) => {
  const { alunoId, tipo } = req.query;
  let query = db.collection('historicos').where('cd_fk_aluno', '==', alunoId);
  
  if (tipo === 'treino') {
    query = query.where('cd_fk_treino', '!=', null);
  }
  
  const snapshot = await query.get();
  const historicos = [];
  snapshot.forEach(doc => historicos.push({ id: doc.id, ...doc.data() }));
  
  res.json(historicos);
});

// index.js (adicionar após as outras rotas)
// ==================== ROTAS DE RECUPERAÇÃO DE SENHA ====================
app.post('/alunos/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.trim().toLowerCase();

    const alunoSnapshot = await db
      .collection('alunos')
      .where('email_aluno', '==', emailLower)
      .limit(1)
      .get();

    if (alunoSnapshot.empty) {
      return res.status(404).json({ mensagem: 'E-mail não encontrado' });
    }

    const alunoDoc = alunoSnapshot.docs[0];
    const alunoId = alunoDoc.id;

    const codigo = crypto.randomInt(100000, 999999).toString();
    const validade = new Date(Date.now() + 15 * 60000); // 15 minutos

    await db.collection('codigosRecuperacao').doc(emailLower).set({
      codigo,
      validade: validade.toISOString(),
      alunoId,
    });

    console.log(`Código de recuperação para ${emailLower}: ${codigo}`);

    res.status(200).json({
      mensagem: 'Código de recuperação enviado para seu e-mail',
      alunoId,
      codigo, // Remover em produção
    });
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// ==================== TRATAMENTO DE ERROS GLOBAL ====================
app.use((err, req, res, next) => {
  console.error('🚨 Erro não tratado:', err);
  sistemaStatus.lastError = {
    message: err.message,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(500).json({
    sucesso: false,
    erro: "Falha interna no servidor",
    detalhes: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


app.get('/debug/emails-alunos', async (req, res) => {
  try {
    const snapshot = await db.collection('alunos').get();
    if (snapshot.empty) {
      console.log('📭 Nenhum aluno encontrado.');
      return res.status(404).json({ mensagem: 'Nenhum aluno encontrado' });
    }

    const emails = snapshot.docs.map(doc => doc.data().email_aluno);
    console.log('📧 E-mails dos alunos cadastrados:');
    emails.forEach(email => console.log('- ' + email));

    res.json({ total: emails.length, emails });
  } catch (error) {
    console.error('❌ Erro ao listar e-mails dos alunos:', error.message);
    res.status(500).json({ erro: 'Erro ao acessar a coleção de alunos' });
  }
});


// ==================== INICIAR APLICAÇÃO ====================
initializeSystem();