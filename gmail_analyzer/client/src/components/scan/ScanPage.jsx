import { ScanSearch, RefreshCw, CheckCircle } from 'lucide-react';
import useEmailStore from '../../stores/emailStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ScanProgress from './ScanProgress';
import { formatNumber, timeAgo } from '../../lib/formatters';

export default function ScanPage() {
  const { emails, isScanning, scanProgress, lastScanDate, startScan, clearData } = useEmailStore();

  const hasCachedData = emails.length > 0 && !isScanning;
  const scanComplete = scanProgress?.phase === 'complete';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan Inbox</h1>
        <p className="text-text-muted text-sm mt-1">
          Analizza la tua inbox Gmail per identificare mittenti, newsletter e rumore.
        </p>
      </div>

      {/* Status / Action */}
      <Card className="text-center py-12">
        {!isScanning && !hasCachedData && !scanComplete && (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10">
              <ScanSearch size={40} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Pronto per la scansione</h2>
              <p className="text-text-muted text-sm mt-1 max-w-md mx-auto">
                Analizzeremo solo i metadati delle email (mittente, oggetto, data).
                Il contenuto non viene mai letto.
              </p>
            </div>
            <Button onClick={startScan} size="lg">
              <ScanSearch size={18} />
              Avvia Scan
            </Button>
          </div>
        )}

        {isScanning && <ScanProgress progress={scanProgress} />}

        {!isScanning && (hasCachedData || scanComplete) && (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/10">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Scan completata</h2>
              <p className="text-text-muted text-sm mt-1">
                <span className="font-mono text-text">{formatNumber(emails.length)}</span> email analizzate
                {lastScanDate && (
                  <span> &middot; {timeAgo(lastScanDate)}</span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => { clearData(); startScan(); }} variant="outline">
                <RefreshCw size={16} />
                Nuova scan
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Vai alla Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
