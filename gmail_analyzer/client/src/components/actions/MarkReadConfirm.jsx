import { useState } from 'react';
import { MailCheck, Loader2 } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import useEmailStore from '../../stores/emailStore';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import api from '../../lib/api';
import { formatNumber } from '../../lib/formatters';

export default function MarkReadConfirm() {
  const { activeModal, modalData, closeModal, addToast, deselectAll } = useUiStore();
  const markReadBySender = useEmailStore((s) => s.markReadBySender);
  const [loading, setLoading] = useState(false);

  if (activeModal !== 'mark-read-confirm' || !modalData?.senders) return null;

  const { senders } = modalData;
  const totalUnread = senders.reduce((sum, s) => sum + s.unread, 0);

  const handleMarkRead = async () => {
    setLoading(true);
    try {
      for (const sender of senders) {
        const unreadIds = sender.messageIds; // We send all; server removes UNREAD label
        await api.post('/api/actions/mark-read', { messageIds: unreadIds });
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
        message: `Errore: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open title="Segna come lette" onClose={closeModal}>
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Stai per segnare come lette{' '}
          <span className="font-mono font-bold text-text">{formatNumber(totalUnread)}</span>{' '}
          email non lette da <span className="font-bold text-text">{senders.length}</span> mittenti.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleMarkRead} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <MailCheck size={16} />}
            Segna come lette
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
