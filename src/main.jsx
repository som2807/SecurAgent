import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  Box,
  CalendarClock,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Code2,
  CreditCard,
  Filter,
  FlaskConical,
  Gauge,
  GraduationCap,
  KeyRound,
  Megaphone,
  Play,
  Plus,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRoundSearch,
  Users
} from 'lucide-react';
import './styles.css';

const agents = [
  {
    id: 'growthlab-campaign',
    name: 'Marketing Campaign Agent',
    author: 'GrowthLab',
    category: 'Marketing',
    icon: Megaphone,
    color: 'teal',
    rating: 4.8,
    reviews: 128,
    runs: '1.2K',
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
    icon: CircleDollarSign,
    color: 'amber',
    rating: 4.7,
    reviews: 96,
    runs: '980',
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
    icon: UserRoundSearch,
    color: 'violet',
    rating: 4.6,
    reviews: 72,
    runs: '760',
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
    icon: GraduationCap,
    color: 'green',
    rating: 4.5,
    reviews: 54,
    runs: '620',
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

const logs = [
  ['#8192', 'Succeeded', 'Marketing brief generated', '3m 42s'],
  ['#8191', 'Succeeded', 'Audience clusters synced', '2m 11s'],
  ['#8190', 'Warning', 'Ad API rate limit retried', '4m 05s'],
  ['#8189', 'Failed', 'Missing OAuth token', '1m 12s']
];

function App() {
  const [selectedId, setSelectedId] = useState(agents[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('Sandbox ready. Select an agent and run a controlled test.');
  const [reviewScore, setReviewScore] = useState(5);

  const selected = agents.find((agent) => agent.id === selectedId) ?? agents[0];
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesQuery = [agent.name, agent.author, agent.category, agent.description, agent.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === 'All' || agent.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const runSandbox = () => {
    setRunning(true);
    setRunOutput(`Starting ${selected.name} in an isolated sandbox...`);
    window.setTimeout(() => {
      setRunning(false);
      setRunOutput(
        `${selected.name} completed safely.\nAudit gates: passed code scan, permission check, output validation.\nResult: generated a sample task plan with confidence ${selected.success}%.`
      );
    }, 1100);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-panel">
        <Topbar query={query} setQuery={setQuery} onPublish={() => setDrawerOpen(true)} />
        <section className="workspace">
          <div className="marketplace-column">
            <MarketplaceHeader category={category} setCategory={setCategory} count={filteredAgents.length} />
            <div className="agent-list">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  active={selected.id === agent.id}
                  onClick={() => setSelectedId(agent.id)}
                />
              ))}
            </div>
            <Roadmap />
          </div>
          <AgentDetail
            agent={selected}
            running={running}
            runOutput={runOutput}
            onRun={runSandbox}
            reviewScore={reviewScore}
            setReviewScore={setReviewScore}
          />
          {drawerOpen && <PublishDrawer onClose={() => setDrawerOpen(false)} />}
        </section>
      </main>
    </div>
  );
}

function Sidebar() {
  const primary = [
    ['Marketplace', Box],
    ['Publish', Plus],
    ['Runs', Play],
    ['Verification', ShieldCheck],
    ['Billing', CreditCard]
  ];
  const manage = [
    ['My Agents', Bot],
    ['API Keys', KeyRound],
    ['Audit Logs', ClipboardCheck],
    ['Settings', Settings]
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Box size={21} /></div>
        <span>AgentBox</span>
      </div>
      <button className="team-switcher">
        <span className="avatar">AC</span>
        <span><strong>Acme Corp</strong><small>Team plan</small></span>
        <ChevronDown size={16} />
      </button>
      <nav>
        {primary.map(([label, Icon], index) => (
          <button className={index === 0 ? 'nav-item active' : 'nav-item'} key={label}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="nav-section">Manage</div>
      <nav>
        {manage.map(([label, Icon]) => (
          <button className="nav-item compact" key={label}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <div className="user-card">
        <span className="avatar mint">JS</span>
        <span><strong>Jane Smith</strong><small>jane@acme.com</small></span>
      </div>
    </aside>
  );
}

function Topbar({ query, setQuery, onPublish }) {
  return (
    <header className="topbar">
      <div>
        <h1>Marketplace</h1>
        <p>Discover verified AI agents, test them in sandboxes, and deploy with confidence.</p>
      </div>
      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents, capabilities, or authors..." />
      </label>
      <button className="icon-button" title="Notifications"><Bell size={18} /></button>
      <button className="secondary-button"><Filter size={17} /> Filters</button>
      <button className="primary-button" onClick={onPublish}><Plus size={18} /> Publish Agent</button>
    </header>
  );
}

function MarketplaceHeader({ category, setCategory, count }) {
  const categories = ['All', 'Marketing', 'Trading', 'HR', 'Research'];
  return (
    <div className="marketplace-header">
      <div className="tabs">
        {categories.map((item) => (
          <button key={item} className={category === item ? 'tab active' : 'tab'} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <span className="count">{count} agents</span>
    </div>
  );
}

function AgentCard({ agent, active, onClick }) {
  const Icon = agent.icon;
  return (
    <button className={active ? 'agent-card active' : 'agent-card'} onClick={onClick}>
      <span className={`agent-icon ${agent.color}`}><Icon size={31} /></span>
      <span className="agent-card-body">
        <span className="agent-title">{agent.name} <BadgeCheck size={16} /></span>
        <span className="agent-author">by {agent.author}</span>
        <span className="agent-description">{agent.description}</span>
        <span className="tag-row">{agent.tags.map((tag) => <span key={tag}>{tag}</span>)}</span>
      </span>
      <span className="agent-meta">
        <strong><Star size={14} fill="currentColor" /> {agent.rating}</strong>
        <small>({agent.reviews})</small>
        <Sparkline />
      </span>
    </button>
  );
}

function Sparkline() {
  return <span className="sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>;
}

function AgentDetail({ agent, running, runOutput, onRun, reviewScore, setReviewScore }) {
  const Icon = agent.icon;
  return (
    <aside className="detail-panel">
      <div className="detail-heading">
        <span className={`agent-icon large ${agent.color}`}><Icon size={35} /></span>
        <div>
          <h2>{agent.name}</h2>
          <p>by {agent.author} · {agent.status} publisher</p>
          <span className="rating"><Star size={14} fill="currentColor" /> {agent.rating} ({agent.reviews} reviews) · {agent.runs} runs</span>
        </div>
      </div>
      <p className="detail-copy">{agent.description}</p>
      <div className="trust-grid">
        <div className="trust-card">
          <Gauge size={18} />
          <span>Audit Score</span>
          <strong>{agent.audit}</strong>
          <small>{agent.audit > 90 ? 'Excellent' : 'Production ready'}</small>
        </div>
        <div className="trust-card">
          <ShieldCheck size={18} />
          <span>Verification</span>
          <ul>
            <li><Check size={14} /> Code scan</li>
            <li><Check size={14} /> Sandbox test</li>
            <li><Check size={14} /> Policy check</li>
          </ul>
        </div>
      </div>
      <dl className="spec-list">
        <div><dt>Category</dt><dd>{agent.category}</dd></div>
        <div><dt>Model</dt><dd>{agent.model}</dd></div>
        <div><dt>Pricing</dt><dd>{agent.price}</dd></div>
        <div><dt>Updated</dt><dd>{agent.updated}</dd></div>
        <div><dt>Permissions</dt><dd>{agent.permissions.join(', ')}</dd></div>
      </dl>
      <div className="action-row">
        <button className="secondary-button" onClick={onRun} disabled={running}><FlaskConical size={17} /> {running ? 'Running...' : 'Run in Sandbox'}</button>
        <button className="primary-button"><Rocket size={17} /> Deploy Agent</button>
      </div>
      <pre className="sandbox-output">{runOutput}</pre>
      <div className="reviews">
        <div className="section-title">
          <h3>Ratings & Reviews</h3>
          <span>{reviewScore}.0 selected</span>
        </div>
        <input type="range" min="1" max="5" value={reviewScore} onChange={(event) => setReviewScore(event.target.value)} />
      </div>
      <div className="run-table">
        <div className="section-title">
          <h3>Recent Runs</h3>
          <a href="#runs">View all runs</a>
        </div>
        {logs.map(([id, status, task, duration]) => (
          <div className="run-row" key={id}>
            <span className={`status-dot ${status.toLowerCase()}`} />
            <span><strong>Run {id}</strong><small>{task}</small></span>
            <em>{duration}</em>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PublishDrawer({ onClose }) {
  return (
    <aside className="publish-drawer">
      <div className="drawer-head">
        <div>
          <h2>Publish Agent</h2>
          <p>Package a script or API workflow for marketplace review.</p>
        </div>
        <button className="icon-button" onClick={onClose} title="Close">×</button>
      </div>
      <div className="steps"><span className="active">1</span><i /><span>2</span><i /><span>3</span></div>
      <form>
        <label>Agent Name<input placeholder="e.g. Lead Enrichment Agent" /></label>
        <label>Agent Type<select defaultValue=""><option value="" disabled>Select type</option><option>Marketing</option><option>Trading</option><option>HR</option><option>Research</option></select></label>
        <label>Description<textarea placeholder="Describe what your agent does, who should use it, and expected outputs." /></label>
        <div className="segmented"><button type="button" className="active">Script</button><button type="button">API Endpoint</button></div>
        <label>Script / API Endpoint<textarea className="code-input" placeholder="// Paste Python, Node.js, or endpoint details..." /></label>
        <fieldset>
          <legend>Permissions</legend>
          {['Internet Access', 'File System Read', 'External APIs', 'Send Emails'].map((item, index) => (
            <label className="checkbox" key={item}><input type="checkbox" defaultChecked={index < 3} /> {item}</label>
          ))}
        </fieldset>
        <div className="limits">
          <label>Max Runtime<input defaultValue="300 seconds" /></label>
          <label>Memory<input defaultValue="512 MB" /></label>
          <label>CPU<input defaultValue="1 vCPU" /></label>
          <label>Timeout<input defaultValue="30 seconds" /></label>
        </div>
        <div className="drawer-actions"><button type="button" className="secondary-button">Save Draft</button><button type="button" className="primary-button">Submit for Verification</button></div>
      </form>
    </aside>
  );
}

function Roadmap() {
  const phases = [
    ['MVP', 'Upload scripts, browse listings, run manually, rate agents.', Code2],
    ['Automation', 'Schedules, workflows, integrations, and run memory.', CalendarClock],
    ['Trust', 'Badges, audits, sandbox limits, reputation scoring.', ShieldCheck],
    ['Monetize', 'Commission, subscriptions, pay-per-execution, enterprise.', BarChart3],
    ['Scale', 'SDK, API marketplace, plugins, enterprise dashboards.', Activity]
  ];
  return (
    <section className="roadmap">
      <div className="section-title">
        <h3>Build Roadmap</h3>
        <span>5 platform layers</span>
      </div>
      <div className="phase-grid">
        {phases.map(([title, text, Icon]) => (
          <div className="phase-card" key={title}>
            <Icon size={18} />
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
