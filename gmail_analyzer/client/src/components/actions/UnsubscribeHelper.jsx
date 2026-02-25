import { ExternalLink } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';

export default function UnsubscribeHelper() {
  const { activeModal, modalData, closeModal } = useUiStore();

  if (activeModal !== 'unsubscribe' || !modalData?.sender) return null;

  const { sender } = modalData;
  const raw = sender.listUnsubscribe || '';

  // Parse List-Unsubscribe header: can contain <url> or <mailto:...>
  const links = [];
  const urlMatches = raw.match(/<(https?:\/\/[^>]+)>/gi);
  const mailtoMatches = raw.match(/<(mailto:[^>]+)>/gi);

  if (urlMatches) {
    for (const match of urlMatches) {
      links.push({ type: 'url', value: match.replace(/[<>]/g, '') });
    }
  }
  if (mailtoMatches) {
    for (const match of mailtoMatches) {
      links.push({ type: 'mailto', value: match.replace(/[<>]/g, '') });
    }
  }

  return (
    <Dialog open title="Disiscrizione" onClose={closeModal}>
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-surface-hover">
          <p className="text-xs text-text-muted">Mittente</p>
          <p className="text-sm font-medium">{sender.name}</p>
          <p className="text-xs text-text-muted">{sender.email}</p>
        </div>

        {links.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-text-muted">
              Link di disiscrizione trovati:
            </p>
            {links.map((link, i) => (
              <a
                key={i}
                href={link.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-surface-hover hover:bg-border text-sm text-accent transition-colors"
              >
                <ExternalLink size={14} />
                {link.type === 'url' ? 'Apri pagina disiscrizione' : 'Invia email disiscrizione'}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Nessun link di disiscrizione trovato nell'header. Prova a cercare
            "unsubscribe" nel contenuto delle email di questo mittente.
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" onClick={closeModal}>
            Chiudi
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
