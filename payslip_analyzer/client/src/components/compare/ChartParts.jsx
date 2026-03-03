import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fmt } from './helpers';

export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.stroke || p.fill || p.color }} />
          <span className="text-text-muted">{p.name}</span>
          <span className="font-mono font-semibold ml-auto" style={{ color: p.stroke || p.fill || p.color }}>
            {formatter ? formatter(p.value) : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {children}
    </h3>
  );
}

export function DeltaBadge({ current, previous, invertColors = false }) {
  if (current == null || previous == null || previous === 0) return null;
  const diff = current - previous;
  const pct = ((diff / Math.abs(previous)) * 100).toFixed(1);
  if (Math.abs(diff) < 0.01) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <Minus className="w-3 h-3" /> 0%
      </span>
    );
  }
  const isPositive = diff > 0;
  const colorClass = invertColors
    ? (isPositive ? 'text-danger' : 'text-success')
    : (isPositive ? 'text-success' : 'text-danger');
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {isPositive ? '+' : ''}{pct}%
    </span>
  );
}

export function StatMini({ label, value, sub, color }) {
  return (
    <div>
      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono text-lg font-semibold ${color || ''}`}>{value}</p>
      {sub && <p className="text-text-muted text-xs">{sub}</p>}
    </div>
  );
}
