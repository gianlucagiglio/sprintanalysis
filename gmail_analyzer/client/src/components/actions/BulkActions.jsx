import { Trash2, MailCheck, Filter, X } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import Button from '../ui/Button';
import { formatNumber } from '../../lib/formatters';

export default function BulkActions({ senders }) {
  const { deselectAll, openModal } = useUiStore();

  const totalEmails = senders.reduce((sum, s) => sum + s.count, 0);
  const totalUnread = senders.reduce((sum, s) => sum + s.unread, 0);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20 backdrop-blur-sm">
      <span className="text-sm font-medium">
        {senders.length} mittenti selezionati
        <span className="text-text-muted ml-1">
          ({formatNumber(totalEmails)} email)
        </span>
      </span>

      <div className="flex-1" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => openModal('delete-confirm', { senders })}
      >
        <Trash2 size={14} />
        Elimina ({formatNumber(totalEmails)})
      </Button>

      {totalUnread > 0 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openModal('mark-read-confirm', { senders })}
        >
          <MailCheck size={14} />
          Segna lette ({formatNumber(totalUnread)})
        </Button>
      )}

      <button
        onClick={deselectAll}
        className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
