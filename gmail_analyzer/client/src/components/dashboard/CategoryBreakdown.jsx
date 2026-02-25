import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORIES } from '../../lib/categorizer';
import { formatNumber } from '../../lib/formatters';

export default function CategoryBreakdown({ emails, clusters }) {
  const counts = {};

  if (emails.length > 0) {
    for (const email of emails) {
      const cat = email.category || 'personal';
      counts[cat] = (counts[cat] || 0) + 1;
    }
  } else if (clusters?.length > 0) {
    for (const cluster of clusters) {
      const cat = cluster.category || 'personal';
      counts[cat] = (counts[cat] || 0) + cluster.count;
    }
  }

  const data = Object.entries(counts)
    .map(([key, value]) => ({
      name: CATEGORIES[key]?.label || key,
      value,
      key,
      color: CATEGORIES[key]?.color || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#12121a',
                border: '1px solid #2a2a3a',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`${formatNumber(value)} email`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-text-muted">{name}</span>
            </div>
            <span className="font-mono">
              {formatNumber(value)}
              <span className="text-text-muted ml-1">
                ({Math.round((value / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
