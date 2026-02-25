import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import useEmailStore from '../../stores/emailStore';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import api from '../../lib/api';
import { formatNumber } from '../../lib/formatters';

export default function DeleteConfirm() {
  const { activeModal, modalData, closeModal, addToast, deselectAll } = useUiStore();
  const removeEmailsBySender = useEmailStore((s) => s.removeEmailsBySender);
  const [loading, setLoading] = useState(false);

  if (activeModal !== 'delete-confirm' || !modalData?.senders) return null;

  const { senders } = modalData;
  const totalEmails = senders.reduce((sum, s) => sum + s.count, 0);

  const handleDelete = async () => {
    setLoading(true);
    try {
      for (const sender of senders) {
        await api.post('/api/actions/delete', {
          messageIds: sender.messageIds,
        });
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
        message: `Errore: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

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

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} disabled={loading}>
            Annulla
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Elimina {formatNumber(totalEmails)} email
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
