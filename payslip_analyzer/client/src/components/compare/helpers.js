export const MESI = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

export function parsePeriodo(periodo) {
  if (!periodo) return new Date(0);
  const parts = periodo.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return new Date(0);
  const mese = MESI[parts[0]];
  const anno = parseInt(parts[1], 10);
  if (mese == null || isNaN(anno)) return new Date(0);
  return new Date(anno, mese, 1);
}

export function shortPeriodo(periodo) {
  if (!periodo) return '?';
  const parts = periodo.trim().split(/\s+/);
  if (parts.length < 2) return periodo;
  return parts[0].substring(0, 3) + ' ' + parts[1];
}

export function fmt(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

export function fmtNum(value, decimals = 2) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: decimals }).format(value);
}

export function fmtPct(value) {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function safe(v, fallback = 0) { return v ?? fallback; }

export function sumInps(d) {
  return (d.trattenute?.contributi_inps || []).reduce((s, c) => s + safe(c.importo), 0);
}

export function sumAddizionali(d) {
  return safe(d.trattenute?.addizionale_regionale?.importo_mese)
    + safe(d.trattenute?.addizionale_comunale?.importo_mese)
    + safe(d.trattenute?.acconto_addizionale_comunale?.importo_mese);
}

export function getIrpef(d) {
  return d.trattenute?.ritenute_irpef ?? d.trattenute?.irpef_netta ?? d.trattenute?.irpef_lorda ?? 0;
}

export function getOreTotali(d) {
  return safe(d.ore?.ordinarie) + safe(d.ore?.telelavoro) + safe(d.ore?.straordinario);
}

export function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }
export function sum(arr) { return arr.reduce((s, v) => s + v, 0); }
export function stdDev(arr) {
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

export const CHART_AXIS_PROPS = {
  x: {
    tick: { fill: 'var(--color-text-muted)', fontSize: 12 },
    axisLine: { stroke: 'var(--color-border)' },
    tickLine: false,
  },
  y: {
    tick: { fill: 'var(--color-text-muted)', fontSize: 12 },
    axisLine: false,
    tickLine: false,
  },
};

export const eurTick = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v;
export const pctTick = (v) => `${v}%`;
