import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, BarChart3, Activity, PieChart,
  Clock, CalendarDays, Wallet, Calculator, Target, Percent, ArrowRight,
} from 'lucide-react';
import Card from '../ui/Card';

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

const MESI = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

function parsePeriodo(periodo) {
  if (!periodo) return new Date(0);
  const parts = periodo.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return new Date(0);
  const mese = MESI[parts[0]];
  const anno = parseInt(parts[1], 10);
  if (mese == null || isNaN(anno)) return new Date(0);
  return new Date(anno, mese, 1);
}

function shortPeriodo(periodo) {
  if (!periodo) return '?';
  const parts = periodo.trim().split(/\s+/);
  if (parts.length < 2) return periodo;
  return parts[0].substring(0, 3) + ' ' + parts[1];
}

function fmt(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

function fmtNum(value, decimals = 2) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: decimals }).format(value);
}

function fmtPct(value) {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function safe(v, fallback = 0) { return v ?? fallback; }

function sumInps(d) {
  return (d.trattenute?.contributi_inps || []).reduce((s, c) => s + safe(c.importo), 0);
}

function sumAddizionali(d) {
  return safe(d.trattenute?.addizionale_regionale?.importo_mese)
    + safe(d.trattenute?.addizionale_comunale?.importo_mese)
    + safe(d.trattenute?.acconto_addizionale_comunale?.importo_mese);
}

function getIrpef(d) {
  return d.trattenute?.ritenute_irpef ?? d.trattenute?.irpef_netta ?? d.trattenute?.irpef_lorda ?? 0;
}

function getOreTotali(d) {
  return safe(d.ore?.ordinarie) + safe(d.ore?.telelavoro) + safe(d.ore?.straordinario);
}

function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }
function sum(arr) { return arr.reduce((s, v) => s + v, 0); }
function stdDev(arr) {
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

// ═══════════════════════════════════════════════════════
// SHARED CHART COMPONENTS
// ═══════════════════════════════════════════════════════

function ChartTooltip({ active, payload, label, formatter }) {
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

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {children}
    </h3>
  );
}

function DeltaBadge({ current, previous, invertColors = false }) {
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

function StatMini({ label, value, sub, color }) {
  return (
    <div>
      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono text-lg font-semibold ${color || ''}`}>{value}</p>
      {sub && <p className="text-text-muted text-xs">{sub}</p>}
    </div>
  );
}

const CHART_AXIS_PROPS = {
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

const eurTick = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v;
const pctTick = (v) => `${v}%`;

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function CompareMonths({ payslips }) {
  const sorted = useMemo(() => {
    return payslips
      .filter((ps) => ps.data && !ps.loading && !ps.error)
      .map((ps) => ps.data)
      .sort((a, b) => parsePeriodo(a.periodo) - parsePeriodo(b.periodo));
  }, [payslips]);

  if (sorted.length < 2) return null;

  // ── Computed data ──────────────────────────────────

  const netti = sorted.map((d) => safe(d.netto));
  const lordi = sorted.map((d) => safe(d.competenze?.totale_competenze));
  const trattenuteArr = sorted.map((d) => safe(d.trattenute?.totale_trattenute));

  const nettoMedio = avg(netti);
  const nettoTotale = sum(netti);
  const lordoMedio = avg(lordi);
  const lordoTotale = sum(lordi);
  const trattenuteMedie = avg(trattenuteArr);
  const nettoStdDev = stdDev(netti);
  const stabilita = nettoMedio > 0 ? ((1 - nettoStdDev / nettoMedio) * 100) : 100;

  const meseMigliore = sorted.reduce((best, d) => safe(d.netto) > safe(best.netto) ? d : best);
  const mesePeggiore = sorted.reduce((worst, d) => safe(d.netto) < safe(worst.netto) ? d : worst);

  const primoNetto = sorted[0]?.netto;
  const ultimoNetto = sorted[sorted.length - 1]?.netto;
  const variazionePct = primoNetto && ultimoNetto
    ? ((ultimoNetto - primoNetto) / Math.abs(primoNetto)) * 100
    : null;

  // Pressione fiscale media
  const pressioneFiscaleArr = sorted.map((d) => {
    const lordo = safe(d.competenze?.totale_competenze);
    const tratt = safe(d.trattenute?.totale_trattenute);
    return lordo > 0 ? (tratt / lordo) * 100 : 0;
  });
  const pressioneFiscaleMedia = avg(pressioneFiscaleArr);

  // TFR cumulato
  const tfrQuote = sorted.map((d) => safe(d.tfr?.quota_mese ?? d.tfr?.maturato_mese));
  const tfrCumulato = tfrQuote.reduce((acc, v) => { acc.push((acc[acc.length - 1] || 0) + v); return acc; }, []);

  // Proiezione annuale
  const proiezioneNettoAnnuo = nettoMedio * 12;
  const proiezione13esima = nettoMedio * 13;
  const proiezioneRAL = lordoMedio * 13; // stima RAL
  const tfrAnnuoStimato = avg(tfrQuote) * 12;

  // Costo azienda
  const costoAziendaArr = sorted.map((d) => safe(d.costo_azienda?.totale));
  const hasCostoAzienda = costoAziendaArr.some((v) => v > 0);
  const costoAziendaMedio = hasCostoAzienda ? avg(costoAziendaArr.filter((v) => v > 0)) : 0;
  const cuneoFiscale = hasCostoAzienda && costoAziendaMedio > 0
    ? ((costoAziendaMedio - nettoMedio) / costoAziendaMedio) * 100
    : null;

  // ── Chart data ─────────────────────────────────────

  const mainChartData = sorted.map((d, i) => ({
    name: shortPeriodo(d.periodo),
    Lordo: safe(d.competenze?.totale_competenze),
    Netto: safe(d.netto),
    Trattenute: safe(d.trattenute?.totale_trattenute),
  }));

  const nettoTrendData = sorted.map((d, i) => {
    const val = safe(d.netto);
    // Media mobile a 3 mesi
    const windowStart = Math.max(0, i - 2);
    const window = netti.slice(windowStart, i + 1);
    const mm3 = avg(window);
    return {
      name: shortPeriodo(d.periodo),
      Netto: val,
      'Media mobile': sorted.length > 2 ? Math.round(mm3 * 100) / 100 : null,
      Media: Math.round(nettoMedio * 100) / 100,
    };
  });

  const breakdownData = sorted.map((d) => ({
    name: shortPeriodo(d.periodo),
    INPS: Math.round(sumInps(d) * 100) / 100,
    IRPEF: Math.round(getIrpef(d) * 100) / 100,
    Addizionali: Math.round(sumAddizionali(d) * 100) / 100,
    Altro: Math.round(Math.max(0, safe(d.trattenute?.totale_trattenute) - sumInps(d) - getIrpef(d) - sumAddizionali(d)) * 100) / 100,
  }));

  const pressioneData = sorted.map((d, i) => ({
    name: shortPeriodo(d.periodo),
    'Pressione %': Math.round(pressioneFiscaleArr[i] * 10) / 10,
    'Netto %': Math.round((100 - pressioneFiscaleArr[i]) * 10) / 10,
  }));

  const oreData = sorted.map((d) => ({
    name: shortPeriodo(d.periodo),
    Ordinarie: safe(d.ore?.ordinarie),
    'Smart working': safe(d.ore?.telelavoro),
    Straordinario: safe(d.ore?.straordinario),
  }));
  const hasOreData = oreData.some((d) => d.Ordinarie > 0 || d['Smart working'] > 0);

  const ferieData = sorted.map((d) => ({
    name: shortPeriodo(d.periodo),
    'Ferie residue': safe(d.ferie_permessi?.ferie?.residue),
    'Permessi residui': safe(d.ferie_permessi?.permessi_par?.residui),
  }));
  const hasFerieData = ferieData.some((d) => d['Ferie residue'] > 0 || d['Permessi residui'] > 0);

  const tfrData = sorted.map((d, i) => ({
    name: shortPeriodo(d.periodo),
    'Quota mese': tfrQuote[i],
    Cumulato: tfrCumulato[i],
  }));
  const hasTfr = tfrQuote.some((v) => v > 0);

  const costoData = hasCostoAzienda ? sorted.map((d) => ({
    name: shortPeriodo(d.periodo),
    'Costo azienda': safe(d.costo_azienda?.totale),
    Lordo: safe(d.competenze?.totale_competenze),
    Netto: safe(d.netto),
  })) : [];

  // ── Table rows ─────────────────────────────────────

  const ROWS = [
    { key: 'netto', label: 'Netto', get: (d) => d.netto, cur: true },
    { key: 'competenze', label: 'Totale Competenze', get: (d) => d.competenze?.totale_competenze, cur: true },
    { key: 'trattenute', label: 'Totale Trattenute', get: (d) => d.trattenute?.totale_trattenute, cur: true, inv: true },
    { key: 'inps', label: 'INPS', get: (d) => sumInps(d), cur: true, inv: true },
    { key: 'irpef', label: 'IRPEF', get: (d) => getIrpef(d), cur: true, inv: true },
    { key: 'addiz', label: 'Addizionali', get: (d) => sumAddizionali(d), cur: true, inv: true },
    { key: 'tfr', label: 'TFR quota mese', get: (d) => d.tfr?.quota_mese ?? d.tfr?.maturato_mese, cur: true },
    { key: 'ore', label: 'Ore totali', get: (d) => getOreTotali(d), cur: false },
    { key: 'strao', label: 'Straordinario', get: (d) => d.ore?.straordinario, cur: false },
    { key: 'ferie', label: 'Ferie residue', get: (d) => d.ferie_permessi?.ferie?.residue, cur: false },
    { key: 'perm', label: 'Permessi residui', get: (d) => d.ferie_permessi?.permessi_par?.residui, cur: false },
    { key: 'pressione', label: 'Pressione fiscale %', get: (d) => {
      const l = safe(d.competenze?.totale_competenze);
      return l > 0 ? Math.round((safe(d.trattenute?.totale_trattenute) / l) * 1000) / 10 : null;
    }, cur: false, unit: '%', inv: true },
  ];

  const tableRows = ROWS.map((row) => {
    const values = sorted.map((d) => row.get(d));
    const nums = values.filter((v) => v != null && !isNaN(v));
    return { ...row, values, max: nums.length ? Math.max(...nums) : null, min: nums.length ? Math.min(...nums) : null };
  });

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Analisi comparativa</h2>
        <span className="text-text-muted text-sm">
          {sorted.length} mesi &middot; {shortPeriodo(sorted[0]?.periodo)} → {shortPeriodo(sorted[sorted.length - 1]?.periodo)}
        </span>
      </div>

      {/* ── KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="!p-4">
          <StatMini label="Netto medio" value={fmt(nettoMedio)} color="text-netto" />
        </Card>
        <Card className="!p-4">
          <StatMini label="Netto totale" value={fmt(nettoTotale)} sub={`${sorted.length} mesi`} />
        </Card>
        <Card className="!p-4">
          <StatMini label="Lordo medio" value={fmt(lordoMedio)} color="text-lordo" />
        </Card>
        <Card className="!p-4">
          <StatMini
            label="Pressione fiscale"
            value={`${pressioneFiscaleMedia.toFixed(1)}%`}
            color={pressioneFiscaleMedia > 45 ? 'text-danger' : pressioneFiscaleMedia > 35 ? 'text-warning' : 'text-success'}
            sub="trattenute / lordo"
          />
        </Card>
        <Card className="!p-4">
          <StatMini label="Mese migliore" value={fmt(meseMigliore.netto)} sub={meseMigliore.periodo} color="text-netto" />
        </Card>
        <Card className="!p-4">
          {variazionePct != null ? (
            <StatMini
              label="Variazione"
              value={fmtPct(variazionePct)}
              color={variazionePct >= 0 ? 'text-success' : 'text-danger'}
              sub={`${shortPeriodo(sorted[0]?.periodo)} → ${shortPeriodo(sorted[sorted.length - 1]?.periodo)}`}
            />
          ) : (
            <StatMini label="Mese peggiore" value={fmt(mesePeggiore.netto)} sub={mesePeggiore.periodo} color="text-danger" />
          )}
        </Card>
      </div>

      {/* ── 1. Andamento mensile (bar chart) ────────── */}
      <Card>
        <SectionTitle icon={Activity}>Andamento mensile</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mainChartData} barGap={4} barCategoryGap="20%">
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

      {/* ── 2. Trend netto con media mobile ─────────── */}
      <Card>
        <SectionTitle icon={TrendingUp}>Trend netto mensile</SectionTitle>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={nettoTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
            <YAxis {...CHART_AXIS_PROPS.y} tickFormatter={eurTick} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
            <Area type="monotone" dataKey="Netto" fill="var(--color-netto)" fillOpacity={0.1} stroke="var(--color-netto)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-netto)' }} />
            {sorted.length > 2 && (
              <Line type="monotone" dataKey="Media mobile" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            )}
            <ReferenceLine y={nettoMedio} stroke="var(--color-text-muted)" strokeDasharray="3 3" label={{ value: `Media ${fmt(nettoMedio)}`, position: 'right', fill: 'var(--color-text-muted)', fontSize: 11 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-sm text-text-muted">
          <span>Stabilita: <strong className={`font-mono ${stabilita > 95 ? 'text-success' : stabilita > 85 ? 'text-warning' : 'text-danger'}`}>{stabilita.toFixed(1)}%</strong></span>
          <span>Deviazione: <strong className="font-mono">{fmt(nettoStdDev)}</strong></span>
          <span>Range: <strong className="font-mono">{fmt(Math.min(...netti))}</strong> — <strong className="font-mono">{fmt(Math.max(...netti))}</strong></span>
        </div>
      </Card>

      {/* ── 3. Composizione trattenute (stacked bar) ── */}
      <Card>
        <SectionTitle icon={PieChart}>Composizione trattenute</SectionTitle>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={breakdownData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
            <YAxis {...CHART_AXIS_PROPS.y} tickFormatter={eurTick} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
            <Bar dataKey="INPS" stackId="a" fill="var(--color-inps)" />
            <Bar dataKey="IRPEF" stackId="a" fill="var(--color-irpef)" />
            <Bar dataKey="Addizionali" stackId="a" fill="var(--color-addizionali)" />
            <Bar dataKey="Altro" stackId="a" fill="var(--color-altro)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {/* Medie breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-border text-sm">
          <div>
            <span className="text-text-muted">INPS medio</span>
            <p className="font-mono font-semibold text-inps">{fmt(avg(breakdownData.map((d) => d.INPS)))}</p>
          </div>
          <div>
            <span className="text-text-muted">IRPEF media</span>
            <p className="font-mono font-semibold text-irpef">{fmt(avg(breakdownData.map((d) => d.IRPEF)))}</p>
          </div>
          <div>
            <span className="text-text-muted">Addiz. medie</span>
            <p className="font-mono font-semibold text-addizionali">{fmt(avg(breakdownData.map((d) => d.Addizionali)))}</p>
          </div>
          <div>
            <span className="text-text-muted">Trattenute medie</span>
            <p className="font-mono font-semibold text-trattenute">{fmt(trattenuteMedie)}</p>
          </div>
        </div>
      </Card>

      {/* ── 4. Pressione fiscale % ────────────────── */}
      <Card>
        <SectionTitle icon={Percent}>Pressione fiscale mensile</SectionTitle>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={pressioneData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
            <YAxis {...CHART_AXIS_PROPS.y} tickFormatter={pctTick} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
            <Area type="monotone" dataKey="Netto %" stackId="1" fill="var(--color-netto)" fillOpacity={0.3} stroke="var(--color-netto)" />
            <Area type="monotone" dataKey="Pressione %" stackId="1" fill="var(--color-trattenute)" fillOpacity={0.3} stroke="var(--color-trattenute)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── 5. Ore lavorate ─────────────────────────── */}
      {hasOreData && (
        <Card>
          <SectionTitle icon={Clock}>Ore lavorate</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={oreData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
              <YAxis {...CHART_AXIS_PROPS.y} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${fmtNum(v)} ore`} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
              <Bar dataKey="Ordinarie" stackId="a" fill="var(--color-lordo)" />
              <Bar dataKey="Smart working" stackId="a" fill="var(--color-accent)" />
              <Bar dataKey="Straordinario" stackId="a" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-sm text-text-muted">
            <span>Ore medie: <strong className="font-mono">{fmtNum(avg(oreData.map((d) => d.Ordinarie + d['Smart working'] + d.Straordinario)))}</strong></span>
            <span>Straordinario totale: <strong className="font-mono text-warning">{fmtNum(sum(oreData.map((d) => d.Straordinario)))}</strong> ore</span>
          </div>
        </Card>
      )}

      {/* ── 6. Ferie e permessi ─────────────────────── */}
      {hasFerieData && (
        <Card>
          <SectionTitle icon={CalendarDays}>Ferie e permessi residui</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ferieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
              <YAxis {...CHART_AXIS_PROPS.y} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${fmtNum(v)} ore`} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
              <Line type="monotone" dataKey="Ferie residue" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-accent)' }} />
              <Line type="monotone" dataKey="Permessi residui" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-warning)' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-sm text-text-muted">
            <span>Ferie ultimo mese: <strong className="font-mono">{fmtNum(ferieData[ferieData.length - 1]?.['Ferie residue'])}</strong> ore</span>
            <span>Permessi ultimo mese: <strong className="font-mono">{fmtNum(ferieData[ferieData.length - 1]?.['Permessi residui'])}</strong> ore</span>
          </div>
        </Card>
      )}

      {/* ── 7. TFR accumulato ──────────────────────── */}
      {hasTfr && (
        <Card>
          <SectionTitle icon={Wallet}>TFR maturato</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={tfrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
              <YAxis yAxisId="left" {...CHART_AXIS_PROPS.y} tickFormatter={eurTick} />
              <YAxis yAxisId="right" orientation="right" {...CHART_AXIS_PROPS.y} tickFormatter={eurTick} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
              <Bar yAxisId="left" dataKey="Quota mese" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Cumulato" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-warning)' }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-sm text-text-muted">
            <span>TFR cumulato ({sorted.length} mesi): <strong className="font-mono text-warning">{fmt(tfrCumulato[tfrCumulato.length - 1])}</strong></span>
            <span>TFR medio/mese: <strong className="font-mono">{fmt(avg(tfrQuote))}</strong></span>
            <span>Stima annua: <strong className="font-mono">{fmt(tfrAnnuoStimato)}</strong></span>
          </div>
        </Card>
      )}

      {/* ── 8. Cuneo fiscale (costo azienda vs netto) ─ */}
      {hasCostoAzienda && (
        <Card>
          <SectionTitle icon={Target}>Cuneo fiscale — Costo azienda vs Netto</SectionTitle>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costoData} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
              <YAxis {...CHART_AXIS_PROPS.y} tickFormatter={eurTick} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
              <Bar dataKey="Costo azienda" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Lordo" fill="var(--color-lordo)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Netto" fill="var(--color-netto)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {cuneoFiscale != null && (
            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-sm text-text-muted">
              <span>Cuneo fiscale medio: <strong className="font-mono text-danger">{cuneoFiscale.toFixed(1)}%</strong></span>
              <span>Costo azienda medio: <strong className="font-mono text-warning">{fmt(costoAziendaMedio)}</strong></span>
              <span>Differenza media: <strong className="font-mono">{fmt(costoAziendaMedio - nettoMedio)}</strong></span>
            </div>
          )}
        </Card>
      )}

      {/* ── 9. Proiezione annuale ─────────────────── */}
      <Card>
        <SectionTitle icon={Calculator}>Proiezione annuale stimata</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Netto annuo (12 mesi)</p>
            <p className="font-mono text-xl font-semibold text-netto">{fmt(proiezioneNettoAnnuo)}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Netto annuo (13 mens.)</p>
            <p className="font-mono text-xl font-semibold text-netto">{fmt(proiezione13esima)}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">RAL stimata</p>
            <p className="font-mono text-xl font-semibold text-lordo">{fmt(proiezioneRAL)}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">TFR annuo stimato</p>
            <p className="font-mono text-xl font-semibold text-warning">{fmt(tfrAnnuoStimato)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Trattenute annue stimate</p>
            <p className="font-mono text-lg font-semibold text-trattenute">{fmt(trattenuteMedie * 12)}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">INPS annuo stimato</p>
            <p className="font-mono text-lg font-semibold text-inps">{fmt(avg(breakdownData.map((d) => d.INPS)) * 12)}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">IRPEF annua stimata</p>
            <p className="font-mono text-lg font-semibold text-irpef">{fmt(avg(breakdownData.map((d) => d.IRPEF)) * 12)}</p>
          </div>
          {hasCostoAzienda && (
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Costo azienda annuo</p>
              <p className="font-mono text-lg font-semibold text-warning">{fmt(costoAziendaMedio * 13)}</p>
            </div>
          )}
        </div>
        <p className="text-text-muted text-xs mt-3 italic">
          * Stime basate sulla media dei {sorted.length} mesi analizzati. La 13esima e la RAL sono calcolate su 13 mensilita.
        </p>
      </Card>

      {/* ── 10. Tabella comparativa dettagliata ───── */}
      <Card>
        <SectionTitle icon={BarChart3}>Dettaglio comparativo</SectionTitle>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-text-muted font-medium whitespace-nowrap">Voce</th>
                {sorted.map((d, i) => (
                  <th key={i} className="text-right py-2 px-3 text-text-muted font-medium whitespace-nowrap">
                    {shortPeriodo(d.periodo)}
                  </th>
                ))}
                <th className="text-right py-2 px-3 text-accent font-medium whitespace-nowrap">Media</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const nums = row.values.filter((v) => v != null && !isNaN(v));
                const rowAvg = nums.length ? avg(nums) : null;
                return (
                  <tr key={row.key} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 pr-4 font-medium whitespace-nowrap">{row.label}</td>
                    {row.values.map((val, ci) => {
                      const isMax = val != null && val === row.max && row.max !== row.min;
                      const isMin = val != null && val === row.min && row.max !== row.min;
                      let hl = '';
                      if (isMax) hl = row.inv ? 'text-danger' : 'text-success';
                      if (isMin) hl = row.inv ? 'text-success' : 'text-danger';
                      return (
                        <td key={ci} className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className={`font-mono ${hl} ${isMax || isMin ? 'font-semibold' : ''}`}>
                            {row.cur ? fmt(val) : val != null ? `${fmtNum(val)}${row.unit || ''}` : '—'}
                          </span>
                          {ci > 0 && (
                            <div className="mt-0.5">
                              <DeltaBadge current={val} previous={row.values[ci - 1]} invertColors={row.inv} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="font-mono text-accent font-semibold">
                        {row.cur ? fmt(rowAvg) : rowAvg != null ? `${fmtNum(rowAvg)}${row.unit || ''}` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
