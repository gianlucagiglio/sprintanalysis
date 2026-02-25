import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
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

export default function DeleteConfirm() {
  const { activeModal, modalData, closeModal, addToast, deselectAll } = useUiStore();
  const removeEmailsBySender = useEmailStore((s) => s.removeEmailsBySender);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ deleted: 0, total: 0 });

  if (activeModal !== 'delete-confirm' || !modalData?.senders) return null;

  const { senders } = modalData;
  const totalEmails = senders.reduce((sum, s) => sum + s.count, 0);

  const handleDelete = async () => {
    setLoading(true);
    setProgress({ deleted: 0, total: totalEmails });
    let deletedSoFar = 0;

    try {
      for (const sender of senders) {
        const chunks = chunkArray(sender.messageIds, CHUNK_SIZE);

        for (const chunk of chunks) {
          await api.post('/api/actions/delete', {
            messageIds: chunk,
          }, { timeout: 120000 });

          deletedSoFar += chunk.length;
          setProgress({ deleted: deletedSoFar, total: totalEmails });
        }

        removeEmailsBySender(sender.email);
      }

      addToast({
        type: 'success',
        message: `${formatNumber(totalEmails)} email eliminate da ${senders.length} mittenti`,
      });
      deselectAll();
      closeModal();
    } catch (err) {
      addToast({
        type: 'error',
        message: deletedSoFar > 0
          ? `Errore dopo ${formatNumber(deletedSoFar)}/${formatNumber(totalEmails)} email: ${err.response?.data?.error || err.message}`
          : `Errore: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setLoading(false);
      setProgress({ deleted: 0, total: 0 });
    }
  };

  const percent = progress.total > 0 ? Math.round((progress.deleted / progress.total) * 100) : 0;

  return (
    <Dialog open title="Conferma eliminazione" onClose={closeModal}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-danger">Attenzione: azione irreversibile</p>
            <p className="text-text-muted mt-1">
              Stai per eliminare permanentemente{' '}
              <span className="font-mono font-bold text-text">{formatNumber(totalEmails)}</span>{' '}
              email da <span className="font-bold text-text">{senders.length}</span> mittenti.
            </p>
          </div>
        </div>

        {/* Sender list preview */}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {senders.slice(0, 10).map((s) => (
            <div key={s.email} className="flex justify-between text-xs p-2 rounded bg-surface-hover">
              <span className="truncate">{s.name || s.email}</span>
              <span className="font-mono text-text-muted">{formatNumber(s.count)}</span>
            </div>
          ))}
          {senders.length > 10 && (
            <p className="text-xs text-text-muted text-center py-1">
              ...e altri {senders.length - 10} mittenti
            </p>
          )}
        </div>

        {/* Progress bar */}
        {loading && progress.total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Eliminazione in corso...</span>
              <span className="font-mono">{formatNumber(progress.deleted)}/{formatNumber(progress.total)} ({percent}%)</span>
            </div>
            <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
              <div
                className="h-full rounded-full bg-danger transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} disabled={loading}>
            Annulla
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {loading
              ? `Eliminazione... ${percent}%`
              : `Elimina ${formatNumber(totalEmails)} email`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
