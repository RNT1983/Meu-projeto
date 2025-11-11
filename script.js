
// Single-file Node.js + Express app that serves a minimal NGO platform
// Run: npm install && npm start

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory demo data (reset on server restart)
const ngos = [
  {
    id: 1,
    name: 'ONG Exemplo',
    mission: 'Promover bem-estar e acesso a água potável.',
    vision: 'Comunidades saudáveis e sustentáveis.',
    contact: { email: 'contato@ongexemplo.org', phone: '+55 11 99999-0000' },
    reports: [
      { id: 'r1', title: 'Relatório Anual 2024', url: '#' }
    ]
  }
];

let projects = [
  {
    id: 1,
    slug: 'agua-viva',
    title: 'Projeto Água Viva',
    summary: 'Fornecer água potável para comunidades rurais.',
    description: 'Projeto de construção de poços e educação sanitária.',
    goal_amount: 30000,
    raised_amount: 12500,
    category: 'Saneamento',
    media: [
      { url: '/assets/proj1-1.jpg', alt: 'Distribuição de água' }
    ]
  },
  {
    id: 2,
    slug: 'educar-para-o-futuro',
    title: 'Educar para o Futuro',
    summary: 'Projetos educativos para crianças e jovens.',
    description: 'Aulas, materiais e reforço escolar.',
    goal_amount: 20000,
    raised_amount: 5200,
    category: 'Educação',
    media: []
  }
];

let opportunities = [
  { id: 1, project_id: 1, title: 'Voluntário para obras', requirements: 'Maior de 18 anos, disponibilidade 4h/semana', slots: 10, start_date: '2025-01-05' },
  { id: 2, project_id: 2, title: 'Monitor de reforço escolar', requirements: 'Formação em pedagogia ou experiência com ensino', slots: 5, start_date: '2025-02-01' }
];

let donations = []; // store donations
let applications = []; // volunteer applications
let posts = [
  { id: 1, title: 'Inauguração do poço no Assentamento X', slug: 'inauguracao-poço', excerpt: 'Entrega de água potável...', content: 'Conteúdo do post...' }
];

// API endpoints
app.get('/api/ngos', (req, res) => res.json(ngos));
app.get('/api/projects', (req, res) => res.json(projects));
app.get('/api/projects/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = projects.find(x => x.id === id || x.slug === req.params.id);
  if (!p) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json(p);
});

app.get('/api/opportunities', (req, res) => res.json(opportunities));

app.post('/api/opportunities/:id/apply', (req, res) => {
  const id = Number(req.params.id);
  const opp = opportunities.find(o => o.id === id);
  if (!opp) return res.status(404).json({ error: 'Oportunidade não encontrada' });
  const { name, email, message } = req.body;
  const appObj = { id: applications.length + 1, opportunity_id: id, name, email, message, applied_at: new Date().toISOString(), status: 'pending' };
  applications.push(appObj);
  console.log('Nova candidatura:', appObj);
  return res.json({ ok: true, application: appObj });
});

app.post('/api/donations/checkout', (req, res) => {
  const { name, email, amount, project_id } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ error: 'Valor inválido' });
  const donation = { id: donations.length + 1, name, email, amount: Number(amount), project_id: project_id || null, status: 'paid', donated_at: new Date().toISOString() };
  donations.push(donation);
  if (project_id) {
    const p = projects.find(x => x.id === Number(project_id));
    if (p) p.raised_amount += Number(amount);
  }
  console.log('Doação registrada:', donation);
  return res.json({ ok: true, donation });
});

app.get('/api/donations', (req, res) => res.json(donations));
app.get('/api/posts', (req, res) => res.json(posts));

// Serve static frontend via a simple HTML template
app.get('/', (req, res) => {
  res.send(renderIndex());
});

