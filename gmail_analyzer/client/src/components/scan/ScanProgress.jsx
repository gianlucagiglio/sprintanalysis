import { Loader2 } from 'lucide-react';
import Progress from '../ui/Progress';
import { formatNumber } from '../../lib/formatters';

export default function ScanProgress({ progress }) {
  if (!progress) {
    return (
      <div className="flex items-center justify-center gap-3 text-text-muted">
        <Loader2 size={20} className="animate-spin" />
        <span>Inizializzando scan...</span>
      </div>
    );
  }

  const { phase, message, fetched, total, percent, collected } = progress;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-sm">{message}</span>
      </div>

      {phase === 'listing' && (
        <div className="text-center">
          <span className="font-mono text-2xl font-bold text-accent">
            {formatNumber(collected || 0)}
          </span>
          <p className="text-text-muted text-xs mt-1">messaggi trovati</p>
        </div>
      )}

      {phase === 'fetching' && (
        <>
          <Progress value={percent || 0} />
          <div className="flex justify-between text-xs text-text-muted">
            <span>
              <span className="font-mono text-text">{formatNumber(fetched || 0)}</span>
              {' / '}
              <span className="font-mono">{formatNumber(total || 0)}</span>
            </span>
            <span className="font-mono">{percent || 0}%</span>
          </div>
        </>
      )}
    </div>
  );
}
