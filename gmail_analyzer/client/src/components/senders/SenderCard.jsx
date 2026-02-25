import { Trash2, MailCheck, Filter, ExternalLink } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import Badge from '../ui/Badge';
import { formatNumber, formatBytes, formatDate } from '../../lib/formatters';
import { cn } from '../ui/cn';

export default function SenderCard({ cluster }) {
  const { selectedSenders, toggleSender, openModal } = useUiStore();
  const isSelected = selectedSenders.has(cluster.email);

  const initial = (cluster.name || cluster.email)[0]?.toUpperCase() || '?';

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-colors',
        isSelected
          ? 'border-accent/40 bg-accent/5'
          : 'border-border bg-surface hover:bg-surface-hover'
      )}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSender(cluster.email)}
        className="rounded accent-accent cursor-pointer shrink-0"
      />

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{cluster.name}</span>
          <Badge category={cluster.category} />
        </div>
        <p className="text-xs text-text-muted truncate">{cluster.email}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
          <span>Ultima: {formatDate(cluster.lastDate)}</span>
          {cluster.subjects[0] && (
            <span className="truncate max-w-[200px]">"{cluster.subjects[0]}"</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="font-mono text-sm font-bold">{formatNumber(cluster.count)}</p>
          <p className="text-[10px] text-text-muted">email</p>
        </div>
        {cluster.unread > 0 && (
          <div className="text-right">
            <p className="font-mono text-sm font-bold text-warning">{formatNumber(cluster.unread)}</p>
            <p className="text-[10px] text-text-muted">non lette</p>
          </div>
        )}
        <div className="text-right">
          <p className="font-mono text-xs">{formatBytes(cluster.totalSize)}</p>
          <p className="text-[10px] text-text-muted">spazio</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => openModal('delete-confirm', { senders: [cluster] })}
          className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
          title="Elimina tutte"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={() => openModal('filter-creator', { sender: cluster })}
          className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer"
          title="Crea filtro"
        >
          <Filter size={16} />
        </button>
        {cluster.listUnsubscribe && (
          <button
            onClick={() => openModal('unsubscribe', { sender: cluster })}
            className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-accent transition-colors cursor-pointer"
            title="Disiscrivi"
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
