export default function DateRangePicker({ from, to, onChange }) {
  const inputStyle = {
    border: 'none', outline: 'none', background: 'none',
    fontFamily: 'inherit', fontSize: 13, color: 'var(--text)', cursor: 'pointer',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="date-pill">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 1v2M10 1v2M1 5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input type="date" value={from} style={inputStyle}
          onChange={e => onChange(e.target.value, to)} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>—</span>
      <div className="date-pill">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 1v2M10 1v2M1 5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input type="date" value={to} style={inputStyle}
          onChange={e => onChange(from, e.target.value)} />
      </div>
    </div>
  );
}
