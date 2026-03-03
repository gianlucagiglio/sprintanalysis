import { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, PieChart, Clock, CalendarDays, Wallet, Target, Percent, BarChart3,
} from 'lucide-react';
import Card from '../ui/Card';
import { Tabs, Tab } from '../ui/Tabs';
import { ChartTooltip, SectionTitle, DeltaBadge } from './ChartParts';
import {
  parsePeriodo, shortPeriodo, fmt, fmtNum, fmtPct, safe,
  sumInps, sumAddizionali, getIrpef, getOreTotali,
  avg, sum, stdDev,
  CHART_AXIS_PROPS, eurTick, pctTick,
} from './helpers';

export default function CompareMonths({ payslips }) {
  const [subTab, setSubTab] = useState('trend');

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
  const nettoStdDev = stdDev(netti);
  const stabilita = nettoMedio > 0 ? ((1 - nettoStdDev / nettoMedio) * 100) : 100;
  const trattenuteMedie = avg(trattenuteArr);

  const pressioneFiscaleArr = sorted.map((d) => {
    const lordo = safe(d.competenze?.totale_competenze);
    const tratt = safe(d.trattenute?.totale_trattenute);
    return lordo > 0 ? (tratt / lordo) * 100 : 0;
  });

  const tfrQuote = sorted.map((d) => safe(d.tfr?.quota_mese ?? d.tfr?.maturato_mese));
  const tfrCumulato = tfrQuote.reduce((acc, v) => { acc.push((acc[acc.length - 1] || 0) + v); return acc; }, []);
  const tfrAnnuoStimato = avg(tfrQuote) * 12;

  const costoAziendaArr = sorted.map((d) => safe(d.costo_azienda?.totale));
  const hasCostoAzienda = costoAziendaArr.some((v) => v > 0);
  const costoAziendaMedio = hasCostoAzienda ? avg(costoAziendaArr.filter((v) => v > 0)) : 0;
  const cuneoFiscale = hasCostoAzienda && costoAziendaMedio > 0
    ? ((costoAziendaMedio - nettoMedio) / costoAziendaMedio) * 100
    : null;

  // ── Chart data ─────────────────────────────────────
  const nettoTrendData = sorted.map((d, i) => {
    const val = safe(d.netto);
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
    'Ferie disponibili': safe(d.ferie_permessi?.ferie?.residue) + safe(d.ferie_permessi?.ferie?.residue_ap),
    'Permessi disponibili': safe(d.ferie_permessi?.permessi_par?.residui) + safe(d.ferie_permessi?.permessi_par?.residui_ap),
  }));
  const hasFerieData = ferieData.some((d) => d['Ferie disponibili'] > 0 || d['Permessi disponibili'] > 0);

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

  // ── Table data ─────────────────────────────────────
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
    { key: 'ferie', label: 'Ferie disponibili', get: (d) => {
      const r = d.ferie_permessi?.ferie?.residue;
      const ap = d.ferie_permessi?.ferie?.residue_ap;
      return r != null || ap != null ? safe(r) + safe(ap) : null;
    }, cur: false },
    { key: 'perm', label: 'Permessi disponibili', get: (d) => {
      const r = d.ferie_permessi?.permessi_par?.residui;
      const ap = d.ferie_permessi?.permessi_par?.residui_ap;
      return r != null || ap != null ? safe(r) + safe(ap) : null;
    }, cur: false },
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
      <Tabs value={subTab} onChange={setSubTab}>
        <Tab value="trend" label="Trend" icon={TrendingUp} />
        <Tab value="fiscalita" label="Fiscalita'" icon={Percent} />
        <Tab value="lavoro" label="Lavoro" icon={Clock} />
        <Tab value="dettaglio" label="Dettaglio" icon={BarChart3} />
      </Tabs>

      {/* ── TREND ──────────────────────────────────── */}
      {subTab === 'trend' && (
        <div className="space-y-4">
          {/* Trend netto con media mobile */}
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

          {/* Composizione trattenute (stacked bar) */}
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
        </div>
      )}

      {/* ── FISCALITA ─────────────────────────────── */}
      {subTab === 'fiscalita' && (
        <div className="space-y-4">
          {/* Pressione fiscale % */}
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

          {/* Cuneo fiscale */}
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
        </div>
      )}

      {/* ── LAVORO ────────────────────────────────── */}
      {subTab === 'lavoro' && (
        <div className="space-y-4">
          {/* Ore lavorate */}
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

          {/* Ferie e permessi */}
          {hasFerieData && (
            <Card>
              <SectionTitle icon={CalendarDays}>Ferie e permessi disponibili</SectionTitle>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ferieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" {...CHART_AXIS_PROPS.x} />
                  <YAxis {...CHART_AXIS_PROPS.y} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${fmtNum(v)} ore`} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend formatter={(v) => <span className="text-text-muted text-sm">{v}</span>} />
                  <Line type="monotone" dataKey="Ferie disponibili" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-accent)' }} />
                  <Line type="monotone" dataKey="Permessi disponibili" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-warning)' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-sm text-text-muted">
                <span>Ferie ultimo mese: <strong className="font-mono">{fmtNum(ferieData[ferieData.length - 1]?.['Ferie disponibili'])}</strong> ore</span>
                <span>Permessi ultimo mese: <strong className="font-mono">{fmtNum(ferieData[ferieData.length - 1]?.['Permessi disponibili'])}</strong> ore</span>
              </div>
            </Card>
          )}

          {!hasOreData && !hasFerieData && (
            <Card>
              <p className="text-text-muted text-sm text-center py-4">
                Nessun dato su ore lavorate o ferie disponibile nelle buste caricate.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ── DETTAGLIO ─────────────────────────────── */}
      {subTab === 'dettaglio' && (
        <div className="space-y-4">
          {/* TFR accumulato */}
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

          {/* Tabella comparativa completa */}
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
      )}
    </div>
  );
}
