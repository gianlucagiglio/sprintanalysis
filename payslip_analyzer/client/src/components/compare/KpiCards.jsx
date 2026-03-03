import Card from '../ui/Card';
import { StatMini } from './ChartParts';
import { fmt, fmtPct, shortPeriodo } from './helpers';

export default function KpiCards({
  nettoMedio, nettoTotale, lordoMedio,
  pressioneFiscaleMedia, meseMigliore,
  variazionePct, mesePeggiore,
  sorted,
}) {
  return (
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
  );
}
