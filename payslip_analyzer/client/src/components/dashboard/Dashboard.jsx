import { useMemo } from 'react';
import { Receipt, CalendarDays, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';
import { StatMini } from '../compare/ChartParts';
import KpiCards from '../compare/KpiCards';
import MonthlyBarChart from '../compare/MonthlyBarChart';
import AnnualProjection from '../compare/AnnualProjection';
import {
  parsePeriodo, shortPeriodo, fmt, safe,
  avg, sum, stdDev, sumInps, getIrpef, sumAddizionali,
} from '../compare/helpers';

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

function isRimborso(desc) {
  if (!desc) return false;
  const d = desc.toLowerCase();
  return /rimborso|rimborsi|rimborse|rimb\./.test(d)
    || d.includes('nota spese') || d.includes('note spese');
}

export default function Dashboard({ payslips }) {
  const completed = useMemo(() =>
    payslips.filter(ps => ps.data && !ps.loading && !ps.error),
    [payslips]
  );

  const sorted = useMemo(() =>
    completed.map(ps => ps.data).sort((a, b) => parsePeriodo(a.periodo) - parsePeriodo(b.periodo)),
    [completed]
  );

  // Raccogli tutte le voci escluse da RAL (rimborsi di qualsiasi tipo, 730, etc.)
  const vociEscluseRal = useMemo(() =>
    completed.flatMap(ps => {
      const voci = ps.data.competenze?.voci?.filter(v =>
        v.escludi_da_ral || isRimborso(v.descrizione) || v.descrizione?.toLowerCase().includes('730')
      ) || [];
      return voci.map(v => ({ periodo: ps.data.periodo, descrizione: v.descrizione, importo: v.importo }));
    }),
    [completed]
  );

  // Single payslip view
  if (sorted.length === 1) {
    const d = sorted[0];
    const lordo = safe(d.competenze?.totale_competenze);
    const trattenute = safe(d.trattenute?.totale_trattenute);
    const netto = safe(d.netto);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="!p-4">
            <StatMini label="Totale competenze" value={fmt(lordo)} color="text-lordo" />
          </Card>
          <Card className="!p-4">
            <StatMini label="Totale trattenute" value={fmt(trattenute)} color="text-trattenute" />
          </Card>
          <Card className="!p-4">
            <StatMini label="Netto in busta" value={fmt(netto)} color="text-netto" />
          </Card>
        </div>

        <VociEscluseRalCard voci={vociEscluseRal} />

        <Card>
          <p className="text-text-muted text-sm text-center py-4">
            Carica altre buste paga per vedere l'analisi comparativa e i trend.
          </p>
        </Card>
      </div>
    );
  }

  // Multi-payslip view (2+)
  if (sorted.length < 2) {
    return (
      <Card>
        <p className="text-text-muted text-sm text-center py-4">
          Carica almeno una busta paga per visualizzare la dashboard.
        </p>
      </Card>
    );
  }

  const netti = sorted.map(d => safe(d.netto));
  const lordi = sorted.map(d => safe(d.competenze?.totale_competenze));
  const trattenuteArr = sorted.map(d => safe(d.trattenute?.totale_trattenute));
  // Valori depurati da rimborsi 730 e rimborso spese (per calcolo RAL)
  const nettiRal = sorted.map(d => safe(d.netto_ral ?? d.netto));
  const lordiRal = sorted.map(d => safe(d.lordo_ral ?? d.competenze?.totale_competenze));

  const nettoMedio = avg(netti);
  const nettoTotale = sum(netti);
  const lordoMedio = avg(lordi);
  const trattenuteMedie = avg(trattenuteArr);
  // Medie depurate per proiezione RAL
  const nettoMedioRal = avg(nettiRal);
  const lordoMedioRal = avg(lordiRal);

  const meseMigliore = sorted.reduce((best, d) => safe(d.netto) > safe(best.netto) ? d : best);
  const mesePeggiore = sorted.reduce((worst, d) => safe(d.netto) < safe(worst.netto) ? d : worst);

  const primoNetto = sorted[0]?.netto;
  const ultimoNetto = sorted[sorted.length - 1]?.netto;
  const variazionePct = primoNetto && ultimoNetto
    ? ((ultimoNetto - primoNetto) / Math.abs(primoNetto)) * 100
    : null;

  const pressioneFiscaleArr = sorted.map(d => {
    const lordo = safe(d.competenze?.totale_competenze);
    const tratt = safe(d.trattenute?.totale_trattenute);
    return lordo > 0 ? (tratt / lordo) * 100 : 0;
  });
  const pressioneFiscaleMedia = avg(pressioneFiscaleArr);

  const tfrQuote = sorted.map(d => safe(d.tfr?.quota_mese ?? d.tfr?.maturato_mese));

  const mainChartData = sorted.map(d => ({
    name: shortPeriodo(d.periodo),
    Lordo: safe(d.competenze?.totale_competenze),
    Netto: safe(d.netto),
    Trattenute: safe(d.trattenute?.totale_trattenute),
  }));

  const breakdownData = sorted.map(d => ({
    name: shortPeriodo(d.periodo),
    INPS: Math.round(sumInps(d) * 100) / 100,
    IRPEF: Math.round(getIrpef(d) * 100) / 100,
    Addizionali: Math.round(sumAddizionali(d) * 100) / 100,
    Altro: Math.round(Math.max(0, safe(d.trattenute?.totale_trattenute) - sumInps(d) - getIrpef(d) - sumAddizionali(d)) * 100) / 100,
  }));

  const costoAziendaArr = sorted.map(d => safe(d.costo_azienda?.totale));
  const hasCostoAzienda = costoAziendaArr.some(v => v > 0);
  const costoAziendaMedio = hasCostoAzienda ? avg(costoAziendaArr.filter(v => v > 0)) : 0;

  return (
    <div className="space-y-4">
      <KpiCards
        nettoMedio={nettoMedio}
        nettoTotale={nettoTotale}
        lordoMedio={lordoMedio}
        pressioneFiscaleMedia={pressioneFiscaleMedia}
        meseMigliore={meseMigliore}
        variazionePct={variazionePct}
        mesePeggiore={mesePeggiore}
        sorted={sorted}
      />

      <VociEscluseRalCard voci={vociEscluseRal} />

      <MonthlyBarChart data={mainChartData} />

      <AnnualProjection
        nettoMedio={nettoMedioRal}
        lordoMedio={lordoMedioRal}
        trattenuteMedie={trattenuteMedie}
        tfrQuote={tfrQuote}
        breakdownData={breakdownData}
        costoAziendaMedio={costoAziendaMedio}
        hasCostoAzienda={hasCostoAzienda}
        sortedLength={sorted.length}
      />
    </div>
  );
}

function VociEscluseRalCard({ voci }) {
  if (!voci.length) return null;
  const totale = voci.reduce((s, v) => s + v.importo, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Voci escluse dalla RAL
        </h3>
        <div className="text-right">
          <span className="text-text-muted text-xs">Totale escluso </span>
          <span className="font-mono text-lg font-semibold text-netto">{formatCurrency(totale)}</span>
        </div>
      </div>
      <p className="text-text-muted text-xs mb-3 italic">Rimborsi e sostituto d'imposta 730 non concorrono al calcolo della RAL</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {voci.map((v, i) => (
          <div key={i} className="bg-bg rounded-lg px-3 py-2.5 border border-border/50">
            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
              <CalendarDays className="w-3 h-3" />
              {v.periodo}
            </div>
            <p className="text-text-muted text-xs">{v.descrizione}</p>
            <p className="font-mono font-semibold text-sm">{formatCurrency(v.importo)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
