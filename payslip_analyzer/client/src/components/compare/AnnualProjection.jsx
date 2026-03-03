import { Calculator } from 'lucide-react';
import Card from '../ui/Card';
import { SectionTitle } from './ChartParts';
import { fmt, avg } from './helpers';

export default function AnnualProjection({
  nettoMedio, lordoMedio, trattenuteMedie, tfrQuote,
  breakdownData, costoAziendaMedio, hasCostoAzienda, sortedLength,
}) {
  const proiezioneNettoAnnuo = nettoMedio * 12;
  const proiezione13esima = nettoMedio * 13;
  const proiezioneRAL = lordoMedio * 13;
  const tfrAnnuoStimato = avg(tfrQuote) * 12;

  return (
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
        * Stime basate sulla media dei {sortedLength} mesi analizzati. La 13esima e la RAL sono calcolate su 13 mensilita.
      </p>
    </Card>
  );
}
