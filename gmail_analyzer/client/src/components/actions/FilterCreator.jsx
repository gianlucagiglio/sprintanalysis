import { useState } from 'react';
import { Filter, Loader2 } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import api from '../../lib/api';

export default function FilterCreator() {
  const { activeModal, modalData, closeModal, addToast } = useUiStore();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState({
    archive: true,
    markRead: false,
    trash: false,
  });

  if (activeModal !== 'filter-creator' || !modalData?.sender) return null;

  const { sender } = modalData;

  const handleCreate = async () => {
    setLoading(true);
    try {
      await api.post('/api/actions/create-filter', {
        from: sender.email,
        action,
      });
      addToast({
        type: 'success',
        message: `Filtro creato per ${sender.email}`,
      });
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
    <Dialog open title="Crea filtro Gmail" onClose={closeModal}>
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-surface-hover">
          <p className="text-xs text-text-muted">Mittente</p>
          <p className="text-sm font-medium">{sender.name}</p>
          <p className="text-xs text-text-muted">{sender.email}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Azione per le future email:</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer">
              <input
                type="checkbox"
                checked={action.archive}
                onChange={(e) => setAction((a) => ({ ...a, archive: e.target.checked }))}
                className="rounded accent-accent"
              />
              <div>
                <p className="text-sm">Archivia automaticamente</p>
                <p className="text-xs text-text-muted">Salta la inbox</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer">
              <input
                type="checkbox"
                checked={action.markRead}
                onChange={(e) => setAction((a) => ({ ...a, markRead: e.target.checked }))}
                className="rounded accent-accent"
              />
              <div>
                <p className="text-sm">Segna come letta</p>
                <p className="text-xs text-text-muted">Non mostrare come non letta</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer">
              <input
                type="checkbox"
                checked={action.trash}
                onChange={(e) => setAction((a) => ({ ...a, trash: e.target.checked }))}
                className="rounded accent-accent"
              />
              <div>
                <p className="text-sm text-danger">Elimina automaticamente</p>
                <p className="text-xs text-text-muted">Manda nel cestino</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Filter size={16} />}
            Crea filtro
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
