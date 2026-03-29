import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const SERVICE_COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#10b981',
  '#3b82f6', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16',
];

function shortDate(d) {
  if (!d) return '';
  const parts = d.slice(0, 10).split('-');
  return `${parts[2]}/${parts[1]}`;
}

function fmtVal(v) {
  if (v === null || v === undefined) return '—';
  return (+v).toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,.1)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey ?? p.name} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color ?? p.fill, flexShrink: 0 }} />
          <span style={{ color: 'var(--muted)' }}>{p.name}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--text)', marginLeft: 'auto', paddingLeft: 12 }}>
            {fmtVal(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const axisStyle = { fontSize: 10, fill: 'var(--muted)', fontFamily: 'inherit' };

export default function ServiceSalesChart({ data }) {
  // Aggregate daily TTC totals
  const byDate = Object.values(
    data.reduce((acc, r) => {
      const d = shortDate(r.date);
      if (!acc[d]) acc[d] = { date: d, 'TTC Vente': 0 };
      acc[d]['TTC Vente'] += r.ttc_vente_prod ? +r.ttc_vente_prod : 0;
      return acc;
    }, {})
  );

  // Aggregate by service type
  const byService = Object.values(
    data.reduce((acc, r) => {
      const k = r.lib_service ?? 'Autre';
      if (!acc[k]) acc[k] = { service: k, 'TTC Vente': 0, Quantité: 0 };
      acc[k]['TTC Vente'] += r.ttc_vente_prod ? +r.ttc_vente_prod : 0;
      acc[k].Quantité     += r.quantite       ? +r.quantite       : 0;
      return acc;
    }, {})
  ).sort((a, b) => b['TTC Vente'] - a['TTC Vente']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Daily TTC trend ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
          TTC vente journalier total
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={55}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="TTC Vente" stroke="#14b8a6"
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── TTC by service type ── */}
      {byService.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
            TTC vente par type de service
          </div>
          <ResponsiveContainer width="100%" height={Math.max(180, byService.length * 36)}>
            <BarChart data={byService} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <YAxis type="category" dataKey="service" tick={{ ...axisStyle, fontSize: 11 }}
                axisLine={false} tickLine={false} width={140} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)' }} />
              <Bar dataKey="TTC Vente" radius={[0, 4, 4, 0]}>
                {byService.map((_, i) => (
                  <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
