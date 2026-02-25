import { useState } from 'react';
import { MailCheck, Loader2 } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import useEmailStore from '../../stores/emailStore';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import api from '../../lib/api';
import { formatNumber } from '../../lib/formatters';

const CHUNK_SIZE = 1000;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function MarkReadConfirm() {
  const { activeModal, modalData, closeModal, addToast, deselectAll } = useUiStore();
  const markReadBySender = useEmailStore((s) => s.markReadBySender);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  if (activeModal !== 'mark-read-confirm' || !modalData?.senders) return null;

  const { senders } = modalData;
  const totalUnread = senders.reduce((sum, s) => sum + s.unread, 0);
  const totalIds = senders.reduce((sum, s) => sum + s.messageIds.length, 0);

  const handleMarkRead = async () => {
    setLoading(true);
    setProgress({ done: 0, total: totalIds });
    let doneSoFar = 0;

    try {
      for (const sender of senders) {
        const chunks = chunkArray(sender.messageIds, CHUNK_SIZE);

        for (const chunk of chunks) {
          await api.post('/api/actions/mark-read', {
            messageIds: chunk,
          }, { timeout: 120000 });

          doneSoFar += chunk.length;
          setProgress({ done: doneSoFar, total: totalIds });
        }

        markReadBySender(sender.email);
      }

      addToast({
        type: 'success',
        message: `${formatNumber(totalUnread)} email segnate come lette`,
      });
      deselectAll();
      closeModal();
    } catch (err) {
      addToast({
        type: 'error',
        message: doneSoFar > 0
          ? `Errore dopo ${formatNumber(doneSoFar)}/${formatNumber(totalIds)} email: ${err.response?.data?.error || err.message}`
          : `Errore: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setLoading(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Dialog open title="Segna come lette" onClose={closeModal}>
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Stai per segnare come lette{' '}
          <span className="font-mono font-bold text-text">{formatNumber(totalUnread)}</span>{' '}
          email non lette da <span className="font-bold text-text">{senders.length}</span> mittenti.
        </p>

        {/* Progress bar */}
        {loading && progress.total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Operazione in corso...</span>
              <span className="font-mono">{formatNumber(progress.done)}/{formatNumber(progress.total)} ({percent}%)</span>
            </div>
            <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleMarkRead} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <MailCheck size={16} />}
            {loading ? `Operazione... ${percent}%` : 'Segna come lette'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
