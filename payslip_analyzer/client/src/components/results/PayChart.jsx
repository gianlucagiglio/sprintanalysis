import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../ui/Card';

const COLORS = {
  Netto: 'var(--color-netto)',
  'INPS (IVS)': 'var(--color-inps)',
  IRPEF: 'var(--color-irpef)',
  Addizionali: 'var(--color-addizionali)',
  'Altri contrib.': 'var(--color-altro)',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm text-text-muted">{name}</p>
      <p className="font-mono text-sm font-semibold" style={{ color: COLORS[name] }}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

export default function PayChart({ data }) {
  const { trattenute, netto } = data;
  if (!trattenute || netto == null) return null;

  // Somma contributi INPS
  const totaleInps = (trattenute.contributi_inps || [])
    .reduce((sum, c) => sum + (c.importo || 0), 0);

  const irpef = trattenute.ritenute_irpef || trattenute.irpef_lorda || 0;

  const addizionali =
    (trattenute.addizionale_regionale?.importo_mese || 0) +
    (trattenute.addizionale_comunale?.importo_mese || 0) +
    (trattenute.acconto_addizionale_comunale?.importo_mese || 0);

  const chartData = [
    { name: 'Netto', value: netto },
    totaleInps > 0 && { name: 'INPS (IVS)', value: Math.round(totaleInps * 100) / 100 },
    irpef > 0 && { name: 'IRPEF', value: irpef },
    addizionali > 0 && { name: 'Addizionali', value: Math.round(addizionali * 100) / 100 },
  ].filter(Boolean);

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
        Distribuzione stipendio
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-text-muted text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
