import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import {
  Sparkles,
  Zap,
  Shield,
  Palette,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  Target,
  CheckCircle2
} from 'lucide-react'

interface ChangelogEntry {
  version: string
  date: string
  type: 'feature' | 'improvement' | 'bugfix' | 'breaking'
  changes: {
    category: string
    icon: typeof Sparkles
    items: string[]
  }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.14.0',
    date: '2026-07-03',
    type: 'feature',
    changes: [
      {
        category: 'Team Mood Collaboration',
        icon: Users,
        items: [
          'Nuova fase mood collaborazione team dopo mood personale',
          '4 livelli: Ottima 🤝💚, Buona 🤝💙, Sufficiente 🤝⚠️, Scarsa 🤝❌',
          'Tabella team_mood_votes con RLS policies',
          'Navigazione sotto-fasi in SessionWizard (come retro_phase)',
          'Grafico a torta TeamMoodTrend per visualizzazione dati',
          'Visualizzazione in ClosedSessionView e supporto trend storici',
        ],
      },
      {
        category: 'Actions Management',
        icon: Target,
        items: [
          'Modifica assegnatari azioni esistenti in fase Brainstorming',
          'Click su azioni per aprire modal di edit completo',
          'Visualizzazione azioni sotto ogni commento con icona edit',
          'Permessi: organizzatore + assegnatari possono modificare',
          'Fix caricamento partecipanti in Actions Page',
          'Dropdown "Aggiungi assegnatario" ora funziona correttamente',
        ],
      },
      {
        category: 'UI/UX Improvements',
        icon: Palette,
        items: [
          'Fix conteggio badge in profilo (ora mostra numero reale)',
          'Rimosso badge duplicato nella pagina temi quiz',
          'Messaggi chiari per gestione assegnatari (vuoto/tutti assegnati)',
          'Azioni in box arancione cliccabili in Brainstorming',
        ],
      },
    ],
  },
  {
    version: '1.12.0',
    date: '2025-05-11',
    type: 'feature',
    changes: [
      {
        category: 'Super Admin',
        icon: Shield,
        items: [
          'Funzionalità completa amministratore con pieni poteri',
          'Visualizzazione di tutte le retrospettive nel sistema',
          'Controlli host su qualsiasi board (chiudi, modifica, timer, step)',
          'Badge dorato distintivo nella navbar',
          'Email super admin: gianluca.giglio@gmail.com',
        ],
      },
      {
        category: 'Password Recovery',
        icon: Users,
        items: [
          'Pagina "Password dimenticata" con invio email',
          'Pagina reset password con validazione sicura',
          'Link di reset temporaneo e sicuro',
          'Validazione password (minimo 6 caratteri)',
        ],
      },
      {
        category: 'Actions Enhancement',
        icon: Target,
        items: [
          'Campo Note multi-riga per dettagli e aggiornamenti azioni',
          'Campo Resolution per documentare come è stata risolta',
          'UI migliorata con textarea in modal modifica azione',
          'Salvataggio automatico note e risoluzione',
        ],
      },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-04-15',
    type: 'feature',
    changes: [
      {
        category: 'Timer Fase',
        icon: Clock,
        items: [
          'Countdown flottante grande e stiloso al centro in alto',
          'Supporto input minuti e secondi (es. 1:30)',
          'Animazioni fluide con colori dinamici (verde → arancione → rosso)',
          'Barra di progresso animata in tempo reale',
          'Notifica "Tempo scaduto" non invasiva in alto a destra',
          'Ridimensionamento automatico del 20% per migliore usabilità',
        ],
      },
      {
        category: 'Gestione Commenti',
        icon: MessageSquare,
        items: [
          'Modifica inline dei propri commenti con Invio/Escape',
          'Cancellazione dei propri commenti con icona trash',
          'Icone edit/delete visibili solo al passaggio del mouse',
          'Sganciamento automatico dei commenti figli quando si elimina un parent',
          'Policy RLS DELETE per sicurezza database',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-04-12',
    type: 'feature',
    changes: [
      {
        category: 'Action Management',
        icon: Target,
        items: [
          'Multi-owner: possibilità di assegnare più responsabili per azione',
          'UI migliorata con avatar stack per visualizzare tutti gli assegnatari',
          'Filtri avanzati per azioni (per owner, stato, priorità)',
          'Tabella azioni con ordinamento e ricerca',
        ],
      },
      {
        category: 'Quiz',
        icon: Zap,
        items: [
          'Correzione bug visualizzazione risposte multiple',
          'Scoring lato server per evitare cheating',
          'Countdown per ogni domanda',
          'Classifica in tempo reale',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-04-08',
    type: 'feature',
    changes: [
      {
        category: 'Retrospettiva',
        icon: MessageSquare,
        items: [
          'Inversione ordine fasi: Raggruppamento → Votazione (UX migliorata)',
          'Sentiment automatico per commenti (positivo/negativo/neutro)',
          'Visualizzazione nomi votanti al passaggio del mouse',
          'Anonimato commenti fino alla rivelazione',
          'Limite massimo voti configurabile per sessione',
        ],
      },
      {
        category: 'Brainstorming',
        icon: Sparkles,
        items: [
          'Fase dedicata per discussione commenti raggruppati',
          'Stati discussione: da discutere → in discussione → discusso',
          'Action plan integrato con creazione azioni direttamente dai commenti',
          'Markdown support per azioni',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-04-01',
    type: 'improvement',
    changes: [
      {
        category: 'Team & Visibility',
        icon: Users,
        items: [
          'Sistema team completo con membri e ruoli',
          'Sessioni visibili solo ai membri del team',
          'RLS migliorato per evitare ricorsioni',
          'Dashboard team con metriche aggregate',
        ],
      },
      {
        category: 'Metriche',
        icon: BarChart3,
        items: [
          'Grafici mood trend nel tempo',
          'Statistiche partecipazione per utente',
          'Export dati sessione in CSV',
          'Leaderboard globale e per team',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-15',
    type: 'feature',
    changes: [
      {
        category: 'Core Platform',
        icon: Sparkles,
        items: [
          'Wizard sessione multi-step (Mood → Quiz → Retro → Kanban)',
          'Autenticazione con Supabase Auth',
          'Realtime sync con Supabase Realtime',
          'Step indicator con navigazione fasi',
          'Progress tracking partecipanti',
        ],
      },
      {
        category: 'UI/UX',
        icon: Palette,
        items: [
          'Design system retro-inspired',
          'Dark mode completo',
          'Animazioni con Framer Motion',
          'Responsive layout per mobile/desktop',
          'Toast notifications',
        ],
      },
      {
        category: 'Security',
        icon: Shield,
        items: [
          'Row Level Security (RLS) completo',
          'Policy granulari per organizer/participant',
          'Validazione input lato client e server',
          'HTTPS obbligatorio',
        ],
      },
    ],
  },
]

const typeColors: Record<ChangelogEntry['type'], { bg: string; text: string; label: string }> = {
  feature: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Nuova Feature' },
  improvement: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Miglioramento' },
  bugfix: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Bug Fix' },
  breaking: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Breaking Change' },
}

export function ChangelogPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-retro-primary">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-bold text-retro-text">Changelog</h1>
          <p className="text-retro-text-secondary">
            Tutte le modifiche e miglioramenti alla piattaforma
          </p>
        </div>

        {/* Changelog entries */}
        <div className="space-y-6">
          {changelog.map((entry, idx) => {
            const typeStyle = typeColors[entry.type]
            return (
              <Card key={idx} className="!p-6 !rounded-2xl">
                {/* Version header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-retro-border">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-retro-text">
                        v{entry.version}
                      </h2>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeStyle.bg} ${typeStyle.text}`}>
                        {typeStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-retro-text-secondary">
                      {new Date(entry.date).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Changes by category */}
                <div className="space-y-6">
                  {entry.changes.map((change, changeIdx) => {
                    const Icon = change.icon
                    return (
                      <div key={changeIdx}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-retro-primary-light text-retro-primary">
                            <Icon size={16} />
                          </div>
                          <h3 className="font-semibold text-retro-text">
                            {change.category}
                          </h3>
                        </div>
                        <ul className="space-y-2 ml-9">
                          {change.items.map((item, itemIdx) => (
                            <li
                              key={itemIdx}
                              className="flex items-start gap-2 text-sm text-retro-text-secondary"
                            >
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500 shrink-0 mt-0.5"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <Card className="!p-6 !rounded-2xl text-center">
          <p className="text-sm text-retro-text-secondary">
            Per segnalare bug o richiedere nuove funzionalità, contatta il team di sviluppo.
          </p>
        </Card>
      </div>
    </AppLayout>
  )
}
