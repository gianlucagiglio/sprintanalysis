import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORIES } from '../../lib/categorizer';

export default function FrequencyTimeline({ emails }) {
  if (!emails || emails.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
        Timeline disponibile solo durante la sessione di scan
      </div>
    );
  }

  // Group emails by month
  const monthMap = {};

  for (const email of emails) {
    const date = new Date(email.internalDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const cat = email.category || 'personal';

    if (!monthMap[key]) {
      monthMap[key] = { month: key };
    }
    monthMap[key][cat] = (monthMap[key][cat] || 0) + 1;
  }

  const data = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

  const categoryKeys = Object.keys(CATEGORIES);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <XAxis
            dataKey="month"
            tick={{ fill: '#8888a0', fontSize: 10 }}
            tickFormatter={(v) => {
              const [y, m] = v.split('-');
              return `${m}/${y.slice(2)}`;
            }}
          />
          <YAxis tick={{ fill: '#8888a0', fontSize: 11 }} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #2a2a3a',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          {categoryKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              fill={CATEGORIES[key].color}
              stroke={CATEGORIES[key].color}
              fillOpacity={0.6}
              name={CATEGORIES[key].label}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
