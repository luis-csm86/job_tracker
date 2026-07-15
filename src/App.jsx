import { useState, useEffect, useCallback } from 'react'
import { Plus, Briefcase, RefreshCw, Search, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { supabase } from './lib/supabase'
import JobCard from './components/JobCard'
import JobForm from './components/JobForm'
import { STATUS_CONFIG } from './components/StatusBadge'
import './index.css'

const STATUS_ORDER = ['Applied', 'Contacted', 'Waiting interview', 'Waiting Reply', 'No Reply', 'Discarded', 'On Hold']

export default function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('date_desc')
  const [hiddenStatuses, setHiddenStatuses] = useState(new Set ())
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
     if (saved) return saved
     return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
})

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setJobs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleSave = async (form) => {
    const payload = { ...form }
    if (!payload.application_date) delete payload.application_date

    if (editing) {
      const { error } = await supabase
        .from('job_applications')
        .update(payload)
        .eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); return }
    } else {
      const { error } = await supabase
        .from('job_applications')
        .insert([payload])
      if (error) { alert('Error: ' + error.message); return }
    }
    setFormOpen(false)
    setEditing(null)
    fetchJobs()
  }

  const handleEdit = (job) => {
    setEditing(job)
    setFormOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    const { error } = await supabase.from('job_applications').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else fetchJobs()
  }

  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  // Filter + sort
  const filtered = jobs
    .filter(j => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        j.job_title?.toLowerCase().includes(q) ||
        j.company_name?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'All' || j.status === filterStatus
      const notHidden = !hiddenStatuses.has(j.status)
      return matchSearch && matchStatus && notHidden
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'date_asc')  return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === 'status')    return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      if (sortBy === 'company')   return (a.company_name || '').localeCompare(b.company_name || '')
      return 0
    })

  const toggleHidden = (status, e) => {
    e.stopPropagation()
    setHiddenStatuses(prev => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else {
        next.add(status)
        if (filterStatus === status) setFilterStatus('All')
        }
      return next
    })
  }

  // Stats
  const stats = STATUS_ORDER.map(s => ({
    label: s,
    count: jobs.filter(j => j.status === s).length,
    color: STATUS_CONFIG[s]?.color,
  }))

  return (
    <div className="app">
      <style>{`
        .app { min-height: 100vh; }
        .header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(10,10,39,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
        }
        .light .header {
          background: #0066cc;
          border-bottom: 1px solid #0055aa;
        }
        .header-inner {
          max-width: 1280px; margin: 0 auto;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
          color: var(--text); text-decoration: none;
          flex-shrink: 0;
        }
        .logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--accent); display: flex; align-items: center; justify-content: center;
        }
        .header-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: var(--text);
          padding: 3px 8px; border: 1px solid var(--accent-2);
          border-radius: 4px;
        }
        .main { max-width: 1280px; margin: 0 auto; padding: 32px 24px 80px; }
        .stats-row {
          display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px;
        }
        .stat-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: var(--text-2);
          transition: border-color 0.15s;
          cursor: pointer;
        }
        .stat-chip:hover, .stat-chip.active {
          border-color: var(--border-2);
          background: var(--surface-2);
        }
        .stat-chip.active { border-color: var(--accent); color: var(--text); }
        .stat-chip.hidden-chip {
          opacity: 0.38;
          border-style: dashed;
        }
        .stat-chip.hidden-chip:hover { opacity: 0.65; }
        .eye-toggle {
          display: flex; align-items: center;
          margin-left: 4px;
          padding: 2px;
          border-radius: 4px;
          color: var(--text-3);
          opacity: 0;
          transition: opacity 0.15s, color 0.15s;
          background: none; border: none; cursor: pointer;
        }
        .stat-chip:hover .eye-toggle { opacity: 1; }
        .eye-toggle:hover { color: var(--text); }
        .hidden-banner {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 8px 14px; border-radius: 8px;
          border: 1px dashed var(--border-2);
          background: var(--surface);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: var(--text-3);
          margin-bottom: 16px;
        }
        .hidden-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 2px 8px; border-radius: 4px;
          background: var(--surface-2);
          border: 1px solid var(--border-2);
          color: var(--text-2);
          cursor: pointer; transition: all 0.15s;
        }
        .hidden-tag:hover { border-color: var(--accent); color: var(--accent); }
        .stat-count {
          font-weight: 600; font-size: 14px; color: var(--text);
        }
        .controls {
          display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1; min-width: 200px;
          position: relative;
        }
        .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--text-3); pointer-events: none;
        }
        .search-input {
          width: 100%; padding: 10px 12px 10px 38px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 9px; color: var(--text);
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input:focus {
          border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .search-input::placeholder { color: var(--text-3); }
        .sort-select {
          padding: 10px 36px 10px 12px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 9px; color: var(--text-2);
          font-family: 'IBM Plex Mono', monospace; font-size: 12px;
          outline: none; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239898a6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
          transition: border-color 0.15s;
        }
        .sort-select:focus { border-color: var(--accent); outline: none; }
        .sort-select option { background: #1c1c20; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center; padding: 80px 24px;
        }
        .empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: var(--text-3);
        }
        .empty-title {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
          color: var(--text); margin-bottom: 6px;
        }
        .empty-sub { font-size: 14px; color: var(--text-3); }
        .fab {
          position: fixed; right: 28px; bottom: 28px;
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--accent); border: none;
          color: #0c0c0e;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 4px 24px rgba(232,197,71,0.35);
          transition: all 0.2s;
          z-index: 90;
        }
        .fab:hover { transform: scale(1.06) rotate(3deg); box-shadow: 0 6px 32px rgba(232,197,71,0.45); }
        .fab:active { transform: scale(0.96); }
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .skeleton {
          height: 200px; border-radius: var(--radius-lg);
          background: var(--surface);
          border: 1px solid var(--border);
          animation: pulse 1.5s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .error-banner {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 14px; color: #ef4444;
        }
        .section-heading {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: var(--text-3); letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .refresh-btn {
          padding: 10px 14px; border-radius: 9px;
          border: 1px solid var(--border); background: var(--surface);
          color: var(--text-2); cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
          font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        }
        .refresh-btn:hover { border-color: var(--border-2); color: var(--text); }
        .spinning { animation: spin 0.8s linear infinite; }
      `}</style>
 
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <Briefcase size={16} color="#0c0c0e" strokeWidth={2.5} />
            </div>
            Job Tracker
          </div>
          <span className="header-count">{jobs.length} applications</span>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="refresh-btn"
            title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
        </div>
      </header>
 
      <main className="main">
        {/* Status filter chips */}
        <div className="stats-row">
          <button
            className={`stat-chip ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            <span className="stat-count">{jobs.length}</span>
            All
          </button>
          {stats.map(s => {
            const isHidden = hiddenStatuses.has(s.label)
            const isActive = filterStatus === s.label
            return (
              <button
                key={s.label}
                className={`stat-chip ${isActive ? 'active' : ''} ${isHidden ? 'hidden-chip' : ''}`}
                onClick={() => !isHidden && setFilterStatus(isActive ? 'All' : s.label)}
                style={isActive && !isHidden ? { borderColor: s.color, color: s.color } : {}}
                title={isHidden ? `${s.label} is hidden — click eye to show` : s.label}
              >
                <span
                  className="stat-count"
                  style={{ color: isActive && !isHidden ? s.color : undefined }}
                >
                  {s.count}
                </span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                {STATUS_CONFIG[s.label]?.label || s.label}
                <button
                  className="eye-toggle"
                  onClick={(e) => toggleHidden(s.label, e)}
                  title={isHidden ? `Show ${s.label}` : `Hide ${s.label}`}
                >
                  {isHidden ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>
              </button>
            )
          })}
        </div>
 
        {/* Hidden statuses banner */}
        {hiddenStatuses.size > 0 && (
          <div className="hidden-banner">
            <EyeOff size={12} />
            <span>Hidden:</span>
            {[...hiddenStatuses].map(s => (
              <span
                key={s}
                className="hidden-tag"
                onClick={() => setHiddenStatuses(prev => { const n = new Set(prev); n.delete(s); return n })}
                title={`Click to show ${s}`}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_CONFIG[s]?.color, display: 'inline-block', flexShrink: 0 }} />
                {STATUS_CONFIG[s]?.label || s}
                <Eye size={10} />
              </span>
            ))}
            <button
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}
              onClick={() => setHiddenStatuses(new Set())}
            >
              Show all
            </button>
          </div>
        )}
 
        {/* Controls */}
        <div className="controls">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by title, company, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="status">By status</option>
            <option value="company">By company</option>
          </select>
          <button className="refresh-btn" onClick={fetchJobs} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
 
        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button className="refresh-btn" onClick={fetchJobs}>Retry</button>
          </div>
        )}
 
        {/* Grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ animationDelay: `${i * 100}ms` }} />)}
          </div>
        ) : (
          <div className="grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Briefcase size={24} /></div>
                <div className="empty-title">
                  {jobs.length === 0 ? 'No applications yet' : 'No results found'}
                </div>
                <div className="empty-sub">
                  {jobs.length === 0
                    ? 'Hit the + button to track your first job application'
                    : 'Try a different search or filter'}
                </div>
              </div>
            ) : (
              filtered.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}
      </main>
 
      {/* FAB */}
      <button className="fab" onClick={handleAdd} title="Add application">
        <Plus size={24} strokeWidth={2.5} />
      </button>
 
      {/* Form panel */}
      <JobForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
