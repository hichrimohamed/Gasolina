import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = {
  ssp:       '#14b8a6',
  gasoil:    '#6366f1',
  gasoil_50: '#f59e0b',
  total:     '#64748b',
};

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
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color, flexShrink: 0 }} />
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

export default function FuelSalesChart({ data }) {
  const chartData = data.map(r => ({
    date:      shortDate(r.date),
    SSP:       r.ssp       != null ? +r.ssp       : null,
    Gasoil:    r.gasoil    != null ? +r.gasoil    : null,
    'Gasoil 50': r.gasoil_50 != null ? +r.gasoil_50 : null,
    Total:     r.total_jour != null ? +r.total_jour : null,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Grouped bar chart: SSP / Gasoil / Gasoil50 per day ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
          Ventes journalières par type de carburant
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barCategoryGap="30%" barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={55}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="SSP"       fill={COLORS.ssp}       radius={[3, 3, 0, 0]} />
            <Bar dataKey="Gasoil"    fill={COLORS.gasoil}    radius={[3, 3, 0, 0]} />
            <Bar dataKey="Gasoil 50" fill={COLORS.gasoil_50} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Line chart: total jour trend ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
          Évolution du total journalier
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={55}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Total" stroke={COLORS.total}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
