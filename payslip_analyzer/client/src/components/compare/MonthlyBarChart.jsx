import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';
import Card from '../ui/Card';
import { ChartTooltip, SectionTitle } from './ChartParts';
import { CHART_AXIS_PROPS, eurTick } from './helpers';

export default function MonthlyBarChart({ data }) {
  return (
    <Card>
      <SectionTitle icon={Activity}>Andamento mensile</SectionTitle>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
          <YAxis {...CHART_AXIS_PROPS.y} tickFormatter={eurTick} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
          <Bar dataKey="Lordo" fill="var(--color-lordo)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Netto" fill="var(--color-netto)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Trattenute" fill="var(--color-trattenute)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
