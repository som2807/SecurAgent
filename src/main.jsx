import React, { useEffect, useMemo, useState } from 'react';
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
  Loader2,
  Megaphone,
  Menu,
  Play,
  Plus,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRoundSearch,
  X
} from 'lucide-react';
import './styles.css';

const iconMap = {
  megaphone: Megaphone,
  dollar: CircleDollarSign,
  'search-user': UserRoundSearch,
  graduation: GraduationCap,
  bot: Bot
};

const categories = ['All', 'Marketing', 'Trading', 'HR', 'Research'];
const apiBase = import.meta.env.DEV ? 'http://127.0.0.1:8080' : '';

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function App() {
  const [agents, setAgents] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('Sandbox ready. Select an agent and run a controlled test.');
  const [reviewScore, setReviewScore] = useState(5);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let ignore = false;
    async function loadAgents() {
      setLoading(true);
      try {
        const data = await api(`/api/agents?search=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
        if (ignore) return;
        setAgents(data.agents);
        setSelectedId((current) => current || data.agents[0]?.id || '');
      } catch (error) {
        setNotice(error.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadAgents();
    return () => {
      ignore = true;
    };
  }, [query, category]);

  const selected = useMemo(() => {
    return agents.find((agent) => agent.id === selectedId) || agents[0];
  }, [agents, selectedId]);

  useEffect(() => {
    if (!selected?.id) return;
    api(`/api/runs?agentId=${selected.id}`)
      .then((data) => setRuns(data.runs))
      .catch((error) => setNotice(error.message));
  }, [selected?.id]);

  const upsertAgent = (agent) => {
    setAgents((items) => items.map((item) => (item.id === agent.id ? agent : item)));
  };

  const runSandbox = async () => {
    if (!selected) return;
    setRunning(true);
    setRunOutput(`Starting ${selected.name} in an isolated sandbox...`);
    try {
      const data = await api(`/api/agents/${selected.id}/run`, { method: 'POST' });
      upsertAgent(data.agent);
      setRuns((items) => [data.run, ...items].slice(0, 8));
      setRunOutput(data.run.output);
      setNotice('Sandbox execution completed.');
    } catch (error) {
      setRunOutput(error.message);
    } finally {
      setRunning(false);
    }
  };

  const submitReview = async () => {
    if (!selected) return;
    try {
      const data = await api(`/api/agents/${selected.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ score: Number(reviewScore) })
      });
      upsertAgent(data.agent);
      setNotice('Review submitted.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const publishAgent = async (payload) => {
    const data = await api('/api/agents', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAgents((items) => [data.agent, ...items]);
    setSelectedId(data.agent.id);
    setDrawerOpen(false);
    setNotice('Agent submitted for verification.');
  };

  return (
    <div className="app-shell">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <main className="main-panel">
        <Topbar
          query={query}
          setQuery={setQuery}
          onPublish={() => setDrawerOpen(true)}
          onMenu={() => setMobileNavOpen(true)}
        />
        <section className="workspace">
          <div className="marketplace-column">
            {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={14} /></button></div>}
            <MarketplaceHeader category={category} setCategory={setCategory} count={agents.length} />
            {loading ? (
              <div className="loading-state"><Loader2 size={22} /> Loading agents from API...</div>
            ) : (
              <div className="agent-list">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    active={selected?.id === agent.id}
                    onClick={() => setSelectedId(agent.id)}
                  />
                ))}
              </div>
            )}
            <Roadmap />
          </div>
          {selected && (
            <AgentDetail
              agent={selected}
              runs={runs}
              running={running}
              runOutput={runOutput}
              onRun={runSandbox}
              reviewScore={reviewScore}
              setReviewScore={setReviewScore}
              onReview={submitReview}
            />
          )}
          {drawerOpen && <PublishDrawer onClose={() => setDrawerOpen(false)} onSubmit={publishAgent} />}
        </section>
      </main>
    </div>
  );
}

function Sidebar({ open, onClose }) {
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
    <>
      <button className={open ? 'nav-scrim visible' : 'nav-scrim'} onClick={onClose} aria-label="Close navigation" />
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brand-mark"><Box size={21} /></div>
          <span>AgentBox</span>
          <button className="mobile-close" onClick={onClose} title="Close"><X size={18} /></button>
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
    </>
  );
}

function Topbar({ query, setQuery, onPublish, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} title="Open navigation"><Menu size={19} /></button>
      <div className="title-block">
        <h1>Marketplace</h1>
        <p>Discover verified AI agents, test them in sandboxes, and deploy with confidence.</p>
      </div>
      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents, capabilities, or authors..." />
      </label>
      <button className="icon-button" title="Notifications"><Bell size={18} /></button>
      <button className="secondary-button filter-button"><Filter size={17} /> Filters</button>
      <button className="primary-button" onClick={onPublish}><Plus size={18} /> Publish Agent</button>
    </header>
  );
}

function MarketplaceHeader({ category, setCategory, count }) {
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
  const Icon = iconMap[agent.icon] || Bot;
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
        <strong><Star size={14} fill="currentColor" /> {agent.rating || 'New'}</strong>
        <small>{agent.reviews ? `(${agent.reviews})` : 'No reviews'}</small>
        <Sparkline />
      </span>
    </button>
  );
}

function Sparkline() {
  return <span className="sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>;
}

function AgentDetail({ agent, runs, running, runOutput, onRun, reviewScore, setReviewScore, onReview }) {
  const Icon = iconMap[agent.icon] || Bot;
  return (
    <aside className="detail-panel">
      <div className="detail-heading">
        <span className={`agent-icon large ${agent.color}`}><Icon size={35} /></span>
        <div>
          <h2>{agent.name}</h2>
          <p>by {agent.author} - {agent.status} publisher</p>
          <span className="rating"><Star size={14} fill="currentColor" /> {agent.rating || 'New'} ({agent.reviews} reviews) - {agent.runsLabel} runs</span>
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
        <div><dt>Permissions</dt><dd>{agent.permissions.join(', ') || 'None requested'}</dd></div>
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
        <div className="review-row">
          <input type="range" min="1" max="5" value={reviewScore} onChange={(event) => setReviewScore(event.target.value)} />
          <button className="secondary-button" onClick={onReview}>Submit</button>
        </div>
      </div>
      <div className="run-table">
        <div className="section-title">
          <h3>Recent Runs</h3>
          <a href="#runs">Live API</a>
        </div>
        {(runs.length ? runs : []).map((run) => (
          <div className="run-row" key={run.id}>
            <span className={`status-dot ${run.status.toLowerCase()}`} />
            <span><strong>Run {run.id}</strong><small>{run.task}</small></span>
            <em>{run.duration}</em>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PublishDrawer({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    endpoint: '',
    permissions: ['Internet Access', 'External APIs'],
    runtime: '300 seconds',
    memory: '512 MB'
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const togglePermission = (permission) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission]
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name,
        category: form.category,
        description: form.description,
        permissions: form.permissions,
        tags: [form.category, 'Submitted'],
        model: form.endpoint ? 'External API' : 'Custom Script'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="publish-drawer">
      <div className="drawer-head">
        <div>
          <h2>Publish Agent</h2>
          <p>Package a script or API workflow for marketplace review.</p>
        </div>
        <button className="icon-button" onClick={onClose} title="Close"><X size={18} /></button>
      </div>
      <div className="steps"><span className="active">1</span><i /><span>2</span><i /><span>3</span></div>
      <form onSubmit={submit}>
        <label>Agent Name<input required value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Lead Enrichment Agent" /></label>
        <label>Agent Type<select required value={form.category} onChange={(event) => setField('category', event.target.value)}><option value="" disabled>Select type</option><option>Marketing</option><option>Trading</option><option>HR</option><option>Research</option></select></label>
        <label>Description<textarea required value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Describe what your agent does, who should use it, and expected outputs." /></label>
        <div className="segmented"><button type="button" className="active">Script</button><button type="button">API Endpoint</button></div>
        <label>Script / API Endpoint<textarea className="code-input" value={form.endpoint} onChange={(event) => setField('endpoint', event.target.value)} placeholder="// Paste Python, Node.js, or endpoint details..." /></label>
        <fieldset>
          <legend>Permissions</legend>
          {['Internet Access', 'File System Read', 'External APIs', 'Send Emails'].map((item) => (
            <label className="checkbox" key={item}><input type="checkbox" checked={form.permissions.includes(item)} onChange={() => togglePermission(item)} /> {item}</label>
          ))}
        </fieldset>
        <div className="limits">
          <label>Max Runtime<input value={form.runtime} onChange={(event) => setField('runtime', event.target.value)} /></label>
          <label>Memory<input value={form.memory} onChange={(event) => setField('memory', event.target.value)} /></label>
        </div>
        <div className="drawer-actions"><button type="button" className="secondary-button" onClick={onClose}>Save Draft</button><button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit for Verification'}</button></div>
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
