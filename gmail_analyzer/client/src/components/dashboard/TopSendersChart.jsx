import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORIES } from '../../lib/categorizer';

export default function TopSendersChart({ clusters }) {
  const data = clusters.slice(0, 20).map((c) => ({
    name: c.name || c.email,
    email: c.email,
    count: c.count,
    category: c.category,
  }));

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tick={{ fill: '#8888a0', fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fill: '#e4e4ed', fontSize: 11 }}
            tickFormatter={(v) => (v.length > 22 ? v.slice(0, 20) + '...' : v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #2a2a3a',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name, props) => [
              `${value} email`,
              props.payload.email,
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CATEGORIES[entry.category]?.color || '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
