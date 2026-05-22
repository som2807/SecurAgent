import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: '1mb' }));
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

const agents = [
  {
    id: 'growthlab-campaign',
    name: 'Marketing Campaign Agent',
    author: 'GrowthLab',
    category: 'Marketing',
    icon: 'megaphone',
    color: 'teal',
    rating: 4.8,
    reviews: 128,
    runs: 1200,
    price: '$0.01 / run',
    status: 'Verified',
    audit: 92,
    model: 'GPT-4o',
    permissions: ['Ads API', 'Email sending', 'Analytics read'],
    description: 'Plans, launches, and optimizes campaigns across email, social, ads, and content.',
    tags: ['Marketing', 'Automation', 'A/B testing'],
    success: 97,
    updated: 'May 18, 2026'
  },
  {
    id: 'quantedge-trader',
    name: 'Crypto Trading Bot',
    author: 'QuantEdge',
    category: 'Trading',
    icon: 'dollar',
    color: 'amber',
    rating: 4.7,
    reviews: 96,
    runs: 980,
    price: '$0.03 / run',
    status: 'Audited',
    audit: 88,
    model: 'Claude 3.7',
    permissions: ['Exchange API', 'Wallet read', 'Market data'],
    description: 'Automates risk-managed trading decisions with backtests and on-chain signals.',
    tags: ['Trading', 'DeFi', 'Python'],
    success: 91,
    updated: 'May 15, 2026'
  },
  {
    id: 'hireworks-screen',
    name: 'Resume Screening AI',
    author: 'HireWorks',
    category: 'HR',
    icon: 'search-user',
    color: 'violet',
    rating: 4.6,
    reviews: 72,
    runs: 760,
    price: '$0.02 / run',
    status: 'Verified',
    audit: 94,
    model: 'GPT-4.1',
    permissions: ['Document read', 'ATS API', 'PII detection'],
    description: 'Ranks resumes, extracts candidate evidence, and creates recruiter-ready summaries.',
    tags: ['HR', 'NLP', 'OpenAI'],
    success: 96,
    updated: 'May 21, 2026'
  },
  {
    id: 'scholar-research',
    name: 'Student Research Agent',
    author: 'ScholarAI',
    category: 'Research',
    icon: 'graduation',
    color: 'green',
    rating: 4.5,
    reviews: 54,
    runs: 620,
    price: '$0.01 / run',
    status: 'Community',
    audit: 81,
    model: 'Llama 4',
    permissions: ['Web search', 'Citation export', 'File read'],
    description: 'Finds, summarizes, and cites academic sources with reproducible research trails.',
    tags: ['Research', 'RAG', 'Summaries'],
    success: 89,
    updated: 'May 10, 2026'
  }
];

let runs = [
  { id: '#8192', agentId: 'growthlab-campaign', status: 'Succeeded', task: 'Marketing brief generated', duration: '3m 42s', createdAt: '2026-05-22T15:32:00.000Z' },
  { id: '#8191', agentId: 'growthlab-campaign', status: 'Succeeded', task: 'Audience clusters synced', duration: '2m 11s', createdAt: '2026-05-22T14:58:00.000Z' },
  { id: '#8190', agentId: 'growthlab-campaign', status: 'Warning', task: 'Ad API rate limit retried', duration: '4m 05s', createdAt: '2026-05-22T14:04:00.000Z' },
  { id: '#8189', agentId: 'growthlab-campaign', status: 'Failed', task: 'Missing OAuth token', duration: '1m 12s', createdAt: '2026-05-22T13:11:00.000Z' }
];

function formatRuns(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function publicAgent(agent) {
  return { ...agent, runsLabel: formatRuns(agent.runs) };
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'agentbox-api', timestamp: new Date().toISOString() });
});

app.get('/api/agents', (request, response) => {
  const search = String(request.query.search || '').toLowerCase();
  const category = String(request.query.category || 'All');
  const filtered = agents.filter((agent) => {
    const haystack = [agent.name, agent.author, agent.category, agent.description, agent.tags.join(' ')].join(' ').toLowerCase();
    return haystack.includes(search) && (category === 'All' || agent.category === category);
  });
  response.json({ agents: filtered.map(publicAgent) });
});

app.post('/api/agents', (request, response) => {
  const body = request.body || {};
  if (!body.name || !body.category || !body.description) {
    response.status(400).json({ error: 'name, category, and description are required' });
    return;
  }

  const agent = {
    id: `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`,
    name: body.name,
    author: body.author || 'New Publisher',
    category: body.category,
    icon: body.icon || 'bot',
    color: body.color || 'teal',
    rating: 0,
    reviews: 0,
    runs: 0,
    price: body.price || '$0.01 / run',
    status: 'Pending',
    audit: 70,
    model: body.model || 'Custom API',
    permissions: body.permissions || [],
    description: body.description,
    tags: body.tags || [body.category],
    success: 0,
    updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  agents.unshift(agent);
  response.status(201).json({ agent: publicAgent(agent) });
});

app.post('/api/agents/:id/run', (request, response) => {
  const agent = agents.find((item) => item.id === request.params.id);
  if (!agent) {
    response.status(404).json({ error: 'Agent not found' });
    return;
  }

  agent.runs += 1;
  const run = {
    id: `#${8200 + runs.length}`,
    agentId: agent.id,
    status: 'Succeeded',
    task: `${agent.name} sandbox execution completed`,
    duration: `${Math.max(1, Math.round(agent.audit / 24))}m ${String(agent.success % 60).padStart(2, '0')}s`,
    createdAt: new Date().toISOString(),
    output: `${agent.name} completed safely.\nAudit gates: passed code scan, permission check, output validation.\nResult: generated a sample task plan with confidence ${agent.success || agent.audit}%.`
  };
  runs = [run, ...runs].slice(0, 20);
  response.json({ run, agent: publicAgent(agent) });
});

app.post('/api/agents/:id/reviews', (request, response) => {
  const agent = agents.find((item) => item.id === request.params.id);
  const score = Number(request.body?.score);
  if (!agent || !Number.isFinite(score) || score < 1 || score > 5) {
    response.status(400).json({ error: 'Valid agent and score from 1 to 5 are required' });
    return;
  }

  agent.rating = Number(((agent.rating * agent.reviews + score) / (agent.reviews + 1)).toFixed(1));
  agent.reviews += 1;
  response.json({ agent: publicAgent(agent) });
});

app.get('/api/runs', (request, response) => {
  const agentId = request.query.agentId;
  response.json({ runs: runs.filter((run) => !agentId || run.agentId === agentId) });
});

const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`AgentBox listening on ${port}`);
});
