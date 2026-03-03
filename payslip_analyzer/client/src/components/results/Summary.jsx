import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Card from '../ui/Card';

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-sm">{label}</span>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="font-mono text-2xl font-semibold" style={{ color }}>
        {formatCurrency(value)}
      </p>
    </Card>
  );
}

export default function Summary({ data }) {
  const totaleCompetenze = data.competenze?.totale_competenze;
  const totaleTrattenute = data.trattenute?.totale_trattenute;
  const netto = data.netto;

  return (
    <div className="space-y-4">
      {/* Info dipendente */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Periodo</span>
            <p className="font-medium mt-0.5">{data.periodo || '—'}</p>
          </div>
          <div>
            <span className="text-text-muted">Dipendente</span>
            <p className="font-medium mt-0.5">{data.dipendente || '—'}</p>
          </div>
          <div>
            <span className="text-text-muted">Azienda</span>
            <p className="font-medium mt-0.5">{data.azienda || '—'}</p>
          </div>
          <div>
            <span className="text-text-muted">Livello</span>
            <p className="font-medium mt-0.5">
              {data.qualifica ? `${data.qualifica} - ` : ''}{data.livello || '—'}
            </p>
          </div>
        </div>
        {(data.codice_fiscale || data.data_assunzione) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-border">
            {data.codice_fiscale && (
              <div>
                <span className="text-text-muted">Codice Fiscale</span>
                <p className="font-mono font-medium mt-0.5 text-xs">{data.codice_fiscale}</p>
              </div>
            )}
            {data.data_nascita && (
              <div>
                <span className="text-text-muted">Data nascita</span>
                <p className="font-medium mt-0.5">{data.data_nascita}</p>
              </div>
            )}
            {data.data_assunzione && (
              <div>
                <span className="text-text-muted">Data assunzione</span>
                <p className="font-medium mt-0.5">{data.data_assunzione}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 3 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Totale Competenze"
          value={totaleCompetenze}
          icon={TrendingUp}
          color="var(--color-lordo)"
        />
        <StatCard
          label="Totale Trattenute"
          value={totaleTrattenute}
          icon={TrendingDown}
          color="var(--color-trattenute)"
        />
        <StatCard
          label="Netto in Busta"
          value={netto}
          icon={Wallet}
          color="var(--color-netto)"
        />
      </div>
    </div>
  );
}
