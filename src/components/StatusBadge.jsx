const STATUS_CONFIG = {
  'Discarded':              { color: '#ef4444', lightColor: '#c0392b', bg: 'rgba(239,68,68,0.12)',   label: 'Discarded' },
  'No Reply':               { color: '#f97316', lightColor: '#d35400', bg: 'rgba(249,115,22,0.12)',  label: 'No Reply' },
  'Applied':                { color: '#3b82f6', lightColor: '#1a5fb4', bg: 'rgba(59,130,246,0.12)', label: 'Applied' },
  'Contacted':              { color: '#a855f7', lightColor: '#7b2fa8', bg: 'rgba(168,85,247,0.12)', label: 'Contacted' },
  'Waiting 2nd interview':  { color: '#22c55e', lightColor: '#1a7a3c', bg: 'rgba(34,197,94,0.12)',  label: '2nd Interview' },
  'On Hold':                { color: '#e6da33', lightColor: '#C21E56', bg: 'rgba(230,218,51,0.12)', label: 'On Hold' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: '#9898a6', bg: 'rgba(152,152,166,0.12)', label: status }
  const isLight = document.documentElement.classList.contains('light')
  const color = isLight ? cfg.lightColor : cfg.color
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 500,
      letterSpacing: '0.04em',
      color: color,
      background: cfg.bg,
      border: `1px solid ${color}33`,
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}

export { STATUS_CONFIG }
