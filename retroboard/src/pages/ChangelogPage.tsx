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
    version: '1.14.3',
    date: '2026-07-22',
    type: 'improvement',
    changes: [
      {
        category: 'Badge Showcase - Premium Visual Experience',
        icon: Sparkles,
        items: [
          '🎨 Badge Sbloccati: Gradient vibrante indigo→purple→pink con border 3px',
          '🔄 Animazione 3D flip all\'ingresso (rotateY -180° → 0°)',
          '⚡ Spring physics per movimento naturale (stiffness: 200, damping: 15)',
          '✨ Wiggle effect sull\'hover (oscillazione -5° → +5°)',
          '💫 Glow effect luminoso dietro il badge con blur-xl',
          '✨ Shimmer animation che attraversa il badge (0.6s)',
          '🌟 8 sparkle particles dorate che esplodono sull\'hover',
          '📐 Badge emoji size aumentato a 4xl per maggiore impatto',
          '💬 Tooltip gradient con freccia triangolare',
          '🔍 Scale 1.15x sull\'hover con shadow-2xl',
          '🔒 Badge Bloccati: Grayscale filter + lock icon overlay',
          '❓ Mystery badges con emoji punto interrogativo',
          '📝 Tooltip completo con nome + descrizione dettagliata',
          '🎭 Gradient slate per differenziare badge bloccati',
          '⏱️ Stagger animation veloce (delay 0.03s)',
          '🤫 Tooltip separato per badge segreti',
        ],
      },
    ],
  },
  {
    version: '1.14.2',
    date: '2026-07-22',
    type: 'improvement',
    changes: [
      {
        category: 'SessionWizard UX - 12 Major Improvements',
        icon: Sparkles,
        items: [
          'Direction-based slide animations: slide da destra quando si avanza, da sinistra quando si torna indietro',
          'Toast "Tutti pronti" con 15 confetti particles quando tutti completano la fase',
          'Statistiche partecipanti (X/Y pronti) nel toast',
          'Messaggio helper "Usa i controlli in basso" per guidare organizer',
          'Glass effect controls bar con sticky bottom su mobile',
          'Border doppio white/40 sulla barra controlli',
          'Dynamic "Sei l\'ultimo!" button con gradient emerald→teal e pulse quando user è ultimo',
          'Emoji 🎯 e shadow-lg sul button ultimo partecipante',
          'Interactive sub-phase navigation con click per navigare (organizer only)',
          'Checkmarks animati sulle sotto-fasi completate',
          'Enhanced progress indicator con milestone dots (completato emerald, corrente pulse, futuro slate)',
          'Label "Fase X/4" per orientamento immediato',
          'Ring-2 su fase corrente per focus visivo',
          'Improved share button con animazione scale quando copiato',
          'Feedback emerald su copia link con transizioni smooth',
          'Avatar pulse animation quando partecipante completa',
          'Checkmark animato con rotate spring sugli avatar',
          'Colors dinamici: emerald per done, slate per pending',
        ],
      },
      {
        category: 'Celebration Enhancement',
        icon: Sparkles,
        items: [
          'ClosedSessionView con 30 confetti particles che cadono continuamente',
          'Colori random per confetti con animazioni Infinity',
          'Stagger animations sulle stats cards per effetto cascata',
          'Interactive applause system per ogni partecipante',
          'Counter applausi persistente salvato nel database',
          'Button applause con gradient amber→orange su hover',
        ],
      },
      {
        category: 'Quiz Layout Enhancement',
        icon: Zap,
        items: [
          'Confetti particles (20) quando risposta corretta',
          'Glass card sul timer con gradient indigo→purple→pink',
          'Timer pulsante quando < 3 secondi rimanenti',
          'Stagger animations sulle scelte (delay 0.08s)',
          'Glass effects con hover scale e shadow colorate',
          'Icone animate con rotate e scale spring',
          'Feedback celebrativo con emoji e spring animation',
          'Medaglie emoji (🥇🥈🥉) nel podio leaderboard',
          'Gradients vibranti per primo, secondo, terzo posto',
          'Pulse animation continua sul primo posto',
          'Start screen e finished screen con confetti infiniti',
        ],
      },
      {
        category: 'Header Reorganization',
        icon: Palette,
        items: [
          'Breadcrumb fasi principali (Mood → Icebreaker → Retro → Kanban)',
          'Layout compatto: titolo + bottoni prima riga, breadcrumb seconda',
          'Badge con checkmark su fasi completate',
          'Ring-2 sulla fase corrente per focus visivo',
          'Bottoni "Condividi link" e "Chiudi retro" allineati a destra',
          'Flex-wrap su breadcrumb per evitare scrollbar orizzontale',
        ],
      },
      {
        category: 'Phase Timer Enhancement',
        icon: Clock,
        items: [
          'Button "+5min extend" con gradient emerald→teal',
          'Estensione automatica di 5 minuti quando attivo',
          'Icon Clock + label "+5" per chiarezza immediata',
          'Posizionamento accanto a button stop',
        ],
      },
      {
        category: 'Comments Enhancement',
        icon: MessageSquare,
        items: [
          'Badge "NUOVO!" animato con Sparkles icon',
          'Appare per 60 secondi dopo creazione commento',
          'Animate-pulse per attirare attenzione',
          'Styling compact: text [9px], padding ridotto, rounded-md',
        ],
      },
      {
        category: 'Empty States',
        icon: Sparkles,
        items: [
          'RetroBoard empty states per ogni sezione (Went Well, To Improve, Action Items)',
          'Icon Lightbulb in cerchio white/80',
          'Messaggi "Ancora nessuna idea" personalizzati per sezione',
          'Call to action "Sii il primo!" per incentivare partecipazione',
          'VotingPhase empty state con icon Vote gradient rose→pink',
          'Heading "Nessun commento da votare" e suggerimento tornare a fase precedente',
        ],
      },
      {
        category: 'Navbar Enhancement',
        icon: Palette,
        items: [
          'Logo professionale: sostituito emoji 🔄 con icon RotateCcw in container gradient',
          'Container gradient indigo→purple→pink con shadow',
          'Testo gradient matching per coerenza visiva',
          'Hover effects: scale-105 + shadow-lg sul logo',
          'Icon bianca strokeWidth 2.5 per maggiore leggibilità',
          'Menu indicator rimosso: eliminato puntino dot sotto voci menu attive',
          'Cleanup visual per menu più pulito e minimalista',
        ],
      },
      {
        category: 'Bug Fixes',
        icon: CheckCircle2,
        items: [
          'Risolto errore parsing ClosedSessionView (motion.div chiusura)',
          'Rimossi import inutilizzati (Medal, podiumColors)',
          'Fix TypeScript warnings',
          'PointsWidget contrast fix completo: Risolto contrasto bianco su giallo - Titolo "Livello X": text-white → text-amber-900, Testo punti: text-white → text-amber-800, Bottone refresh: text-white → text-amber-900 + bg più opaco, Progress bar label: text-white → text-amber-900, Progress bar percentuale: text-white → text-amber-900, Progress bar fill: bg-white → gradient amber-400→yellow-400→amber-500, Progress bar container: bg-white/30 → bg-white/20, Contrasto WCAG AA compliant (≥4.5:1)',
        ],
      },
      {
        category: 'Removed',
        icon: Target,
        items: [
          'OnboardingTooltip disabilitato',
          'StepIndicator sostituito con breadcrumb più intuitivo',
          'Label descrittive sotto badge sotto-fasi (rimosse per layout compatto)',
          'Button "Avanza" rimosso da toast "Tutti pronti"',
          'Scrollbar orizzontale breadcrumbs (overflow-x-auto → flex-wrap)',
        ],
      },
    ],
  },
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
