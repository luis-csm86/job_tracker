import { ExternalLink, Pencil, Trash2, Briefcase, MapPin, Calendar, Newspaper } from 'lucide-react'
import StatusBadge from './StatusBadge'

const SOURCE_ICONS = {
  LinkedIn:  '🔷',
  Infojobs:  '🟠',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function JobCard({ job, onEdit, onDelete, index }) {
  return (
    <article
      className="job-card"
      style={{
        animation: `fadeUp 0.4s ease both`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <style>{`
        .job-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .job-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(232,197,71,0.04), transparent);
          pointer-events: none;
        }
        .job-card:hover {
          border-color: var(--border-2);
          box-shadow: -3px -5px 45px -1px rgba(9, 54, 190, 0.30);
          transform: translateY(-2px);
        }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .card-title-block { flex: 1; min-width: 0; }
        .card-job-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-company {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--accent);
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .icon-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .icon-btn:hover { border-color: var(--border-2); color: var(--text); background: var(--border); }
        .icon-btn.danger:hover { border-color: rgba(239,68,68,0.4); color: #ef4444; background: rgba(239,68,68,0.08); }
        .card-meta {
          display: flex; flex-wrap: wrap; gap: 10px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-3);
        }
        .meta-item { display: flex; align-items: center; gap: 5px; }
        .card-divider { height: 1px; background: var(--border); }
        .card-notes {
          font-size: 13px;
          color: var(--text-2);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
        .link-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          border-radius: 7px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-2);
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .link-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .link-btn:disabled, .link-btn[data-disabled] { opacity: 0.35; pointer-events: none; }
      `}</style>

      <div className="card-header">
        <div className="card-title-block">
          <div className="card-job-title">{job.job_title}</div>
          <div className="card-company">{job.company_name}</div>
        </div>
        <div className="card-actions">
          <button className="icon-btn" onClick={() => onEdit(job)} title="Edit">
            <Pencil size={14} />
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(job.id)} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <StatusBadge status={job.status} />
        <div className="card-meta">
          {job.location && (
            <span className="meta-item"><MapPin size={11} />{job.location}</span>
          )}
          {job.application_date && (
            <span className="meta-item"><Calendar size={11} />{formatDate(job.application_date)}</span>
          )}
          {job.source && (
            <span className="meta-item">
              <span style={{ fontSize: 12 }}>{SOURCE_ICONS[job.source] || '📌'}</span>
              {job.source}
            </span>
          )}
        </div>
      </div>

      {job.notes && (
        <>
          <div className="card-divider" />
          <p className="card-notes">{job.notes}</p>
        </>
      )}

      <div className="card-links">
        <a
          className="link-btn"
          href={job.company_website || undefined}
          target="_blank"
          rel="noopener noreferrer"
          {...(!job.company_website ? { 'data-disabled': true } : {})}
        >
          <Briefcase size={12} /> Company
        </a>
        <a
          className="link-btn"
          href={job.job_link || undefined}
          target="_blank"
          rel="noopener noreferrer"
          {...(!job.job_link ? { 'data-disabled': true } : {})}
        >
          <ExternalLink size={12} /> Job Posting
        </a>
      </div>
    </article>
  )
}
