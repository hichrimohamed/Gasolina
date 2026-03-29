export default function KPICard({ title, value, unit = '' }) {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value} {unit}</p>
    </div>
  );
}
