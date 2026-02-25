import Card from '../ui/Card';

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function Row({ label, value, color, bold = false, sub = false }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${bold ? 'border-t border-border mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-text' : sub ? 'text-text-muted/60 pl-3' : 'text-text-muted'}`}>
        {label}
      </span>
      <span
        className={`font-mono text-sm ${bold ? 'font-semibold' : ''}`}
        style={color ? { color } : undefined}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export default function DeductionsBreakdown({ data }) {
  const { elementi_retribuzione, competenze, trattenute } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Competenze */}
      <Card>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Elementi Retribuzione
        </h3>
        <div className="space-y-0.5">
          {elementi_retribuzione?.voci?.map((v, i) => (
            <Row key={i} label={v.voce} value={v.importo} />
          ))}
          {elementi_retribuzione?.totale != null && (
            <Row label="Totale retribuzione" value={elementi_retribuzione.totale} color="var(--color-lordo)" bold />
          )}
        </div>

        {competenze?.voci?.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mt-5 mb-3">
              Competenze del mese
            </h3>
            <div className="space-y-0.5">
              {competenze.voci.map((v, i) => (
                <Row key={i} label={v.descrizione} value={v.importo} />
              ))}
              {competenze.totale_competenze != null && (
                <Row label="Totale Competenze" value={competenze.totale_competenze} color="var(--color-lordo)" bold />
              )}
            </div>
          </>
        )}
      </Card>

      {/* Trattenute */}
      <Card>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Trattenute
        </h3>
        <div className="space-y-0.5">
          {/* Contributi INPS */}
          {trattenute?.contributi_inps?.map((c, i) => (
            <div key={i}>
              <Row
                label={`${c.descrizione}${c.aliquota ? ` (${c.aliquota}%)` : ''}`}
                value={c.importo}
                color="var(--color-inps)"
              />
              {c.imponibile != null && (
                <Row label={`Imponibile`} value={c.imponibile} sub />
              )}
            </div>
          ))}

          {/* IRPEF */}
          {trattenute?.irpef_lorda != null && (
            <Row label="IRPEF lorda" value={trattenute.irpef_lorda} color="var(--color-irpef)" />
          )}
          {trattenute?.ritenute_irpef != null && trattenute.ritenute_irpef !== trattenute.irpef_lorda && (
            <Row label="Ritenute IRPEF" value={trattenute.ritenute_irpef} color="var(--color-irpef)" />
          )}

          {/* Addizionali */}
          {trattenute?.addizionale_regionale && (
            <Row
              label={`Add. regionale (${trattenute.addizionale_regionale.regione || ''})`}
              value={trattenute.addizionale_regionale.importo_mese}
              color="var(--color-addizionali)"
            />
          )}
          {trattenute?.addizionale_comunale && (
            <Row
              label={`Add. comunale (${trattenute.addizionale_comunale.comune || ''})`}
              value={trattenute.addizionale_comunale.importo_mese}
              color="var(--color-addizionali)"
            />
          )}
          {trattenute?.acconto_addizionale_comunale && (
            <Row
              label="Acconto add. comunale"
              value={trattenute.acconto_addizionale_comunale.importo_mese}
              color="var(--color-addizionali)"
            />
          )}

          {/* Altre trattenute */}
          {trattenute?.altre?.map((v, i) => (
            <Row key={i} label={v.voce} value={v.importo} />
          ))}

          {/* Totale */}
          {trattenute?.totale_trattenute != null && (
            <Row label="Totale Trattenute" value={trattenute.totale_trattenute} color="var(--color-trattenute)" bold />
          )}
        </div>
      </Card>
    </div>
  );
}
