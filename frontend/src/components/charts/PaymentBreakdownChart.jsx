import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function PaymentBreakdownChart({ data }) {
  const slices = [
    { name: 'Espèce',       value: data?.espece   || 0 },
    { name: 'TPE',          value: data?.tpe2     || 0 },
    { name: 'Carte',        value: data?.carte_b  || 0 },
    { name: 'Autres',       value: data?.autres   || 0 },
  ].filter(s => s.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {slices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
