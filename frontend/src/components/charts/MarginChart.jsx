import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MarginChart({ data, nameKey = 'lib_produit' }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="v_ht_px_achat" name="Achat HT"  fill="#8884d8" />
        <Bar dataKey="v_ht_px_vente" name="Vente HT"  fill="#82ca9d" />
        <Bar dataKey="marge"          name="Marge"     fill="#ff7300" />
      </BarChart>
    </ResponsiveContainer>
  );
}
