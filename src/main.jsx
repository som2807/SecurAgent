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
  History,
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
  UserCheck,
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
  const [allRuns, setAllRuns] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeSection, setActiveSection] = useState('Marketplace');
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

  useEffect(() => {
    api('/api/runs')
      .then((data) => setAllRuns(data.runs))
      .catch((error) => setNotice(error.message));
  }, [runs.length]);

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
      setAllRuns((items) => [data.run, ...items].slice(0, 20));
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
    setActiveSection('My Agents');
    setNotice('Agent submitted for verification.');
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <main className="main-panel">
        <Topbar
          activeSection={activeSection}
          query={query}
          setQuery={setQuery}
          onPublish={() => setActiveSection('Publish')}
          onMenu={() => setMobileNavOpen(true)}
        />
        {notice && <div className="page-notice notice">{notice}<button onClick={() => setNotice('')}><X size={14} /></button></div>}
        {activeSection === 'Marketplace' && (
          <section className="workspace">
            <div className="marketplace-column">
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
          </section>
        )}
        {activeSection === 'Publish' && <PublishSection onSubmit={publishAgent} />}
        {activeSection === 'Runs' && <RunsSection agents={agents} runs={allRuns} onRun={runSandbox} selected={selected} running={running} />}
        {activeSection === 'My Agents' && <MyAgentsSection agents={agents} setActiveSection={setActiveSection} />}
        {activeSection === 'Audit Logs' && <AuditLogsSection agents={agents} runs={allRuns} />}
        {!['Marketplace', 'Publish', 'Runs', 'My Agents', 'Audit Logs'].includes(activeSection) && (
          <UtilitySection title={activeSection} />
        )}
      </main>
    </div>
  );
}

function Sidebar({ activeSection, setActiveSection, open, onClose }) {
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
          <span>SecurAgent</span>
          <button className="mobile-close" onClick={onClose} title="Close"><X size={18} /></button>
        </div>
        <button className="team-switcher">
          <span className="avatar">SA</span>
          <span><strong>SecurAgent Group</strong><small>Team plan</small></span>
          <ChevronDown size={16} />
        </button>
        <nav>
          {primary.map(([label, Icon]) => (
            <button className={activeSection === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => { setActiveSection(label); onClose(); }}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="nav-section">Manage</div>
        <nav>
          {manage.map(([label, Icon]) => (
            <button className={activeSection === label ? 'nav-item compact active' : 'nav-item compact'} key={label} onClick={() => { setActiveSection(label); onClose(); }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="user-card">
          <span className="avatar mint">SM</span>
          <span><strong>S Maji</strong><small>sm12345@gmail.com</small></span>
        </div>
      </aside>
    </>
  );
}

function Topbar({ activeSection, query, setQuery, onPublish, onMenu }) {
  const descriptions = {
    Marketplace: 'Discover verified AI agents, test them in sandboxes, and deploy with confidence.',
    Publish: 'Submit scripts and API workflows for SecurAgent verification.',
    Runs: 'Monitor sandbox executions, deployment attempts, and autonomous task history.',
    Verification: 'Review trust checks, code scans, policy gates, and reputation signals.',
    Billing: 'Track subscriptions, execution spend, and marketplace commissions.',
    'My Agents': 'Manage your published agents, verification state, pricing, and performance.',
    'API Keys': 'Manage integration keys and permission scopes for agent execution.',
    'Audit Logs': 'Inspect security events, verification changes, and sandbox activity.',
    Settings: 'Configure workspace preferences and operational controls.'
  };
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} title="Open navigation"><Menu size={19} /></button>
      <div className="title-block">
        <h1>{activeSection}</h1>
        <p>{descriptions[activeSection] || descriptions.Marketplace}</p>
      </div>
      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents, capabilities, or authors..." />
      </label>
      <button className="icon-button" title="Notifications"><Bell size={18} /></button>
      <button className="secondary-button filter-button"><Filter size={17} /> Filters</button>
      <button className="primary-button top-publish" onClick={onPublish}><Plus size={18} /> Publish Agent</button>
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
        <div><dt>GitHub</dt><dd>{agent.githubUrl ? <a href={agent.githubUrl} target="_blank" rel="noreferrer">{agent.githubUrl}</a> : 'Not provided'}</dd></div>
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

function PublishSection({ onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    githubUrl: '',
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
        githubUrl: form.githubUrl,
        permissions: form.permissions,
        tags: [form.category, 'Submitted'],
        model: form.endpoint ? 'External API' : 'Custom Script'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-page publish-page">
      <div className="section-grid">
        <div className="section-panel publish-main">
      <div className="drawer-head">
        <div>
          <h2>Publish Agent</h2>
          <p>Package a script or API workflow for SecurAgent marketplace review.</p>
        </div>
      </div>
      <div className="steps"><span className="active">1</span><i /><span>2</span><i /><span>3</span></div>
      <form onSubmit={submit}>
        <label>Agent Name<input required value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Lead Enrichment Agent" /></label>
        <label>Agent Type<select required value={form.category} onChange={(event) => setField('category', event.target.value)}><option value="" disabled>Select type</option><option>Marketing</option><option>Trading</option><option>HR</option><option>Research</option></select></label>
        <label>Description<textarea required value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Describe what your agent does, who should use it, and expected outputs." /></label>
        <label>GitHub Repository<input type="url" value={form.githubUrl} onChange={(event) => setField('githubUrl', event.target.value)} placeholder="https://github.com/your-org/your-agent" /></label>
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
        <div className="drawer-actions"><button type="button" className="secondary-button">Save Draft</button><button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit for Verification'}</button></div>
      </form>
        </div>
        <div className="section-panel checklist-panel">
          <div className="section-title"><h3>Verification Pipeline</h3><span>3 steps</span></div>
          {[
            ['Package Scan', 'Static checks, dependency review, and secret detection.'],
            ['Sandbox Run', 'Controlled test execution with runtime and network limits.'],
            ['Trust Review', 'Audit score, permission summary, and marketplace readiness.']
          ].map(([title, text], index) => (
            <div className="check-step" key={title}>
              <span>{index + 1}</span>
              <div><strong>{title}</strong><small>{text}</small></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RunsSection({ agents, runs, onRun, selected, running }) {
  const runStats = [
    ['Total Runs', runs.length || 4, Activity],
    ['Succeeded', runs.filter((run) => run.status === 'Succeeded').length || 2, Check],
    ['Warnings', runs.filter((run) => run.status === 'Warning').length || 1, ShieldCheck],
    ['Failed', runs.filter((run) => run.status === 'Failed').length || 1, X]
  ];
  return (
    <section className="section-page">
      <div className="metric-grid">
        {runStats.map(([label, value, Icon]) => (
          <div className="metric-card" key={label}>
            <Icon size={18} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="section-panel">
        <div className="section-title">
          <h3>Execution Runs</h3>
          <button className="primary-button" onClick={onRun} disabled={running || !selected}><Play size={17} /> {running ? 'Running...' : 'Run Selected Agent'}</button>
        </div>
        <div className="data-table">
          <div className="table-head"><span>Run</span><span>Agent</span><span>Status</span><span>Duration</span><span>Created</span></div>
          {(runs.length ? runs : []).map((run) => {
            const agent = agents.find((item) => item.id === run.agentId);
            return (
              <div className="table-row" key={run.id}>
                <strong>{run.id}</strong>
                <span>{agent?.name || run.agentId}</span>
                <span className={`table-status ${run.status.toLowerCase()}`}>{run.status}</span>
                <span>{run.duration}</span>
                <span>{new Date(run.createdAt).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MyAgentsSection({ agents, setActiveSection }) {
  return (
    <section className="section-page">
      <div className="section-panel">
        <div className="section-title">
          <h3>My Agents</h3>
          <button className="primary-button" onClick={() => setActiveSection('Publish')}><Plus size={17} /> New Agent</button>
        </div>
        <div className="agent-management-grid">
          {agents.map((agent) => {
            const Icon = iconMap[agent.icon] || Bot;
            return (
              <div className="management-card" key={agent.id}>
                <span className={`agent-icon ${agent.color}`}><Icon size={28} /></span>
                <div>
                  <strong>{agent.name}</strong>
                  <small>{agent.category} - {agent.status} - {agent.runsLabel} runs</small>
                  {agent.githubUrl && <a className="repo-link" href={agent.githubUrl} target="_blank" rel="noreferrer">{agent.githubUrl}</a>}
                  <div className="tag-row">{agent.permissions.slice(0, 3).map((permission) => <span key={permission}>{permission}</span>)}</div>
                </div>
                <div className="card-actions">
                  <button className="secondary-button"><Settings size={16} /> Manage</button>
                  <button className="secondary-button"><ShieldCheck size={16} /> Audit</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AuditLogsSection({ agents, runs }) {
  const auditItems = [
    ...agents.slice(0, 4).map((agent) => ({
      id: `audit-${agent.id}`,
      title: `${agent.name} verification refreshed`,
      detail: `${agent.status} publisher with audit score ${agent.audit}`,
      type: agent.audit > 90 ? 'Passed' : 'Review',
      time: agent.updated
    })),
    ...runs.slice(0, 4).map((run) => ({
      id: `run-${run.id}`,
      title: `${run.id} sandbox event recorded`,
      detail: run.task,
      type: run.status,
      time: new Date(run.createdAt).toLocaleString()
    }))
  ];
  return (
    <section className="section-page">
      <div className="section-panel">
        <div className="section-title">
          <h3>Audit Logs</h3>
          <span>Security and trust events</span>
        </div>
        <div className="audit-timeline">
          {auditItems.map((item) => (
            <div className="audit-item" key={item.id}>
              <span className={`status-dot ${item.type.toLowerCase()}`} />
              <div>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </div>
              <em>{item.time}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UtilitySection({ title }) {
  return (
    <section className="section-page">
      <div className="section-panel utility-panel">
        <ShieldCheck size={30} />
        <h2>{title}</h2>
        <p>This SecurAgent workspace area is ready for the next backend module.</p>
      </div>
    </section>
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
