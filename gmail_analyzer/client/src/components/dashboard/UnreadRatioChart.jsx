import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORIES } from '../../lib/categorizer';
import { formatNumber, formatPercent } from '../../lib/formatters';

export default function UnreadRatioChart({ clusters }) {
  // Only show clusters with 5+ emails for meaningful data
  const data = clusters
    .filter((c) => c.count >= 5)
    .slice(0, 100)
    .map((c) => ({
      name: c.name || c.email,
      x: c.count,
      y: Math.round(c.unreadRatio * 100),
      category: c.category,
    }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <XAxis
            dataKey="x"
            name="Volume"
            tick={{ fill: '#8888a0', fontSize: 11 }}
            label={{ value: 'Email totali', position: 'bottom', fill: '#8888a0', fontSize: 11 }}
          />
          <YAxis
            dataKey="y"
            name="% Non lette"
            tick={{ fill: '#8888a0', fontSize: 11 }}
            label={{ value: '% Non lette', angle: -90, position: 'insideLeft', fill: '#8888a0', fontSize: 11 }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #2a2a3a',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === 'Volume') return [formatNumber(value), 'Email'];
              return [`${value}%`, 'Non lette'];
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
          />
          <Scatter data={data} fillOpacity={0.7}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CATEGORIES[entry.category]?.color || '#6366f1'}
                r={Math.min(8, Math.max(3, Math.sqrt(entry.x) * 0.5))}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
