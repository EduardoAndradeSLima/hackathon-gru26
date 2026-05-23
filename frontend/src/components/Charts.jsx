import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const colors = ['#1d4ed8', '#059669', '#f59e0b', '#dc2626', '#64748b', '#0b2a64'];

export function ChartPanel({ title, children }) {
  return (
    <section className="surface p-4">
      <h2 className="mb-4 text-base font-bold text-civic-ink">{title}</h2>
      <div className="h-72">{children}</div>
    </section>
  );
}

export function SimpleBarChart({ data, xKey, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 8, bottom: 16, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d8e0ee" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} fill="#1d4ed8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({ data, nameKey, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={55} outerRadius={92} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={entry[nameKey]} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
