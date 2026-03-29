import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';

const FAMILY_COLORS = [
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

export default function ProductSalesChart({ data }) {
  // Aggregate daily totals
  const byDate = Object.values(
    data.reduce((acc, r) => {
      const d = shortDate(r.date);
      if (!acc[d]) acc[d] = { date: d, Montant: 0, Quantité: 0 };
      acc[d].Montant   += r.montant  ? +r.montant  : 0;
      acc[d].Quantité  += r.quantite ? +r.quantite : 0;
      return acc;
    }, {})
  );

  // Aggregate by famille
  const byFamille = Object.values(
    data.reduce((acc, r) => {
      const k = r.famille ?? 'Autre';
      if (!acc[k]) acc[k] = { famille: k, Montant: 0 };
      acc[k].Montant += r.montant ? +r.montant : 0;
      return acc;
    }, {})
  ).sort((a, b) => b.Montant - a.Montant);

  // Top 5 products by montant
  const top5 = Object.values(
    data.reduce((acc, r) => {
      const k = r.libelle ?? 'Inconnu';
      if (!acc[k]) acc[k] = { produit: k, Montant: 0 };
      acc[k].Montant += r.montant ? +r.montant : 0;
      return acc;
    }, {})
  )
    .sort((a, b) => b.Montant - a.Montant)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Daily montant trend ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
          Montant journalier total
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={55}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Montant" stroke="#6366f1"
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Montant by famille ── */}
      {byFamille.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
            Montant par famille de produit
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byFamille} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <YAxis type="category" dataKey="famille" tick={{ ...axisStyle, fontSize: 11 }}
                axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)' }} />
              <Bar dataKey="Montant" radius={[0, 4, 4, 0]}>
                {byFamille.map((_, i) => (
                  <Cell key={i} fill={FAMILY_COLORS[i % FAMILY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Top 5 products ── */}
      {top5.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
            Top 5 produits — Montant total
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top5} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <YAxis type="category" dataKey="produit" tick={{ ...axisStyle, fontSize: 11 }}
                axisLine={false} tickLine={false} width={150} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)' }} />
              <Bar dataKey="Montant" radius={[0, 4, 4, 0]}>
                {top5.map((_, i) => (
                  <Cell key={i} fill={FAMILY_COLORS[i % FAMILY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
