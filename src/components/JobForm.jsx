import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { STATUS_CONFIG } from './StatusBadge'

const EMPTY = {
  company_name: '',
  company_website: '',
  source: '',
  location: '',
  job_title: '',
  job_link: '',
  application_date: '',
  status: '',
  notes: '',
}

const today = () => new Date().toISOString().split('T')[0]

export default function JobForm({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : { ...EMPTY, application_date: today() })
      setErrors({})
    }
  }, [open, initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.company_name.trim()) e.company_name = 'Required'
    if (!form.job_title.trim()) e.job_title = 'Required'
    if (!form.status) e.status = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  if (!open) return null

  return (
    <>
      <style>{`
        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        .panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(480px, 100vw);
          background: var(--surface);
          border-left: 1px solid var(--border);
          z-index: 101;
          display: flex; flex-direction: column;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: -8px 0 48px rgba(0,0,0,0.5);
        }
        .panel-header {
          padding: 24px 24px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 700;
          color: var(--text);
        }
        .panel-subtitle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: var(--text-3);
          margin-top: 2px;
        }
        .close-btn {
          width: 36px; height: 36px; border-radius: 9px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
        }
        .close-btn:hover { border-color: var(--border-2); color: var(--text); }
        .panel-body {
          flex: 1; overflow-y: auto;
          padding: 24px;
          display: flex; flex-direction: column; gap: 18px;
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 500;
          color: var(--text-3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .label span { color: #ef4444; margin-left: 2px; }
        .input, .textarea, .select {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 10px 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          width: 100%;
        }
        .input:focus, .textarea:focus, .select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .input.error, .select.error { border-color: rgba(239,68,68,0.6); }
        .textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
        .select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239898a6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .select option { background: #1c1c20; }
        .error-msg { font-size: 11px; color: #ef4444; font-family: 'IBM Plex Mono', monospace; margin-top: 2px; }
        .status-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .status-option {
          padding: 9px 12px; border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-family: 'IBM Plex Mono', monospace;
          color: var(--text-2);
        }
        .status-option:hover { border-color: var(--border-2); color: var(--text); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .panel-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          display: flex; gap: 10px; flex-shrink: 0;
        }
        .btn-primary {
          flex: 1; padding: 12px;
          border-radius: 9px; border: none;
          background: var(--accent);
          color: #0c0c0e;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-secondary {
          padding: 12px 20px; border-radius: 9px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-secondary:hover { border-color: var(--border-2); color: var(--text); }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(12,12,14,0.3);
          border-top-color: #0c0c0e;
          animation: spin 0.6s linear infinite;
        }
        .section-label {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: var(--text-2); padding-top: 4px;
          border-top: 1px solid var(--border);
          padding-top: 18px; margin-top: 2px;
        }
      `}</style>

      <div className="overlay" onClick={onClose} />
      <aside className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{initial ? 'Edit Application' : 'New Application'}</div>
            <div className="panel-subtitle">{initial ? 'Update job details' : 'Track a new opportunity'}</div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="panel-body">

          {/* Company */}
          <div className="section-label">Company</div>
          <div className="field-row">
            <div className="field">
              <label className="label">Company Name <span>*</span></label>
              <input className={`input ${errors.company_name ? 'error' : ''}`} value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Acme Corp" />
              {errors.company_name && <span className="error-msg">{errors.company_name}</span>}
            </div>
            <div className="field">
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Barcelona, ES" />
            </div>
          </div>
          <div className="field">
            <label className="label">Company Website</label>
            <input className="input" type="url" value={form.company_website} onChange={e => set('company_website', e.target.value)} placeholder="https://acme.com" />
          </div>

          {/* Job */}
          <div className="section-label">Job Details</div>
          <div className="field">
            <label className="label">Job Title <span>*</span></label>
            <input className={`input ${errors.job_title ? 'error' : ''}`} value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Senior Frontend Engineer" />
            {errors.job_title && <span className="error-msg">{errors.job_title}</span>}
          </div>
          <div className="field">
            <label className="label">Job Posting Link</label>
            <input className="input" type="url" value={form.job_link} onChange={e => set('job_link', e.target.value)} placeholder="https://linkedin.com/jobs/..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label">Source</label>
              <select className="select" value={form.source} onChange={e => set('source', e.target.value)}>
                <option value="">Select source…</option>
                <option value="LinkedIn">🔷 LinkedIn</option>
                <option value="Infojobs">🟠 Infojobs</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Application Date</label>
              <input className="input" type="date" value={form.application_date} onChange={e => set('application_date', e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div className="section-label">Status <span style={{ color: '#ef4444' }}>*</span></div>
          {errors.status && <span className="error-msg">{errors.status}</span>}
          <div className="status-grid">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className="status-option"
                onClick={() => set('status', key)}
                style={form.status === key ? {
                  borderColor: cfg.color,
                  background: cfg.bg,
                  color: cfg.color,
                } : {}}
              >
                <span className="status-dot" style={{ background: cfg.color }} />
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="section-label">Notes</div>
          <div className="field">
            <label className="label">Additional Notes</label>
            <textarea
              className="textarea"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Recruiter name, salary range, interview details…"
            />
          </div>

        </div>

        <div className="panel-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : <Check size={15} />}
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </aside>
    </>
  )
}