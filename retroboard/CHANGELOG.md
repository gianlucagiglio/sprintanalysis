# Changelog

All notable changes to RetroBoard will be documented in this file.

## [1.16.0] - 2026-07-23

### 🐛 Bug Fixes - Critical Performance & Stability

**Memory Leaks & Resource Management**:
- **authStore**: Fix memory leak da event listeners mai rimossi
  - Aggiunto `resetAuthInitialization()` per cleanup subscription auth
  - Aggiunto cleanup per listener `visibilitychange` del document
  - Previene accumulo di listener multipli su reload/HMR

- **useQuizThemeUsage**: Fix channel Realtime zombie
  - Aggiunto `supabase.removeChannel(channel)` mancante
  - Previene accumulo di channel non chiusi

**Performance - Polling Ridondante Rimosso**:
- Rimosso polling ogni 3 secondi da 6 hooks (mantiene solo Realtime)
  - `useComments`: rimosso `setInterval(fetchComments, 3000)`
  - `useVotes`: rimosso polling ridondante
  - `useActions`: rimosso polling ridondante
  - `useMood`: rimosso polling ridondante
  - `useTeamMood`: rimosso polling ridondante
  - `useGlobalActions`: rimosso polling ridondante
- **Impatto**: Riduzione ~200+ query/minuto → 0 polling (solo Realtime push)

**Database Query Optimization**:
- **Dashboard**: Fix N+1 query pattern su participant counts
  - Prima: 1 query per sessione per contare partecipanti (1+N queries)
  - Dopo: 2 query totali indipendentemente dal numero di sessioni
  - Implementato batch fetch con `.in()` e count map
  - Fix applicato sia per super admin che utenti normali

**Realtime Subscriptions**:
- **useComments**: Fix infinite loop da `fetchComments` in dependency array
  - Rimosso `fetchComments` dalle deps del subscription useEffect
  - Aggiunto commento esplicativo + eslint-disable
  - Previene loop: sections change → fetchComments recreated → subscription recreated

**Race Conditions - Points Duplication Prevention**:
- **useVotes**: Fix doppi punti su doppio click voto
  - Aggiunto controllo race-safe: query fresca DB per count voti DOPO insert
  - Punti assegnati solo se count reale ≤ maxVotes dopo verifica DB

- **useMood**: Fix doppi punti su doppio click mood personale
  - Rimosso check su stato locale (race-prone)
  - Aggiunto check su `point_transactions` DOPO upsert
  - Punti assegnati solo se nessuna transazione esistente

- **useTeamMood**: Fix doppi punti su doppio click mood team
  - Stesso pattern di useMood per prevenire race conditions
  - Verifica `point_transactions` post-operazione invece di pre-operazione

### 🔒 Security Enhancements

- **RLS Policies Gamification**: Aggiunte policies mancanti su tabelle sensibili
  - Migration `017_rls_gamification.sql`
  - `user_points`: policies per visualizzazione propri punti + punti team
  - `point_transactions`: policy per visualizzazione proprie transazioni
  - `user_badges`: policies per visualizzazione propri badge + badge team
  - `badge_definitions`: policy read-only per tutti (già ok)
  - Tutte le tabelle ora protette da RLS (precedentemente esposte)

### 📚 Documentation

- **CLAUDE.md**: Aggiunto file di documentazione architetturale completo
  - Overview progetto e stack tecnologico
  - Comandi sviluppo e setup environment
  - Architettura backend (Supabase, RLS, Realtime)
  - State management patterns (Zustand)
  - Custom hooks patterns e best practices
  - Session workflow (steps 0-5, fasi)
  - Sistema gamification (punti, badge, leaderboard)
  - Patterns critici: race condition prevention, memory leaks, N+1 queries
  - Database migrations patterns
  - Troubleshooting guide

### 🔧 Technical Debt Reduction

- Eliminati ~200 query ridondanti al minuto (polling removal)
- Ridotte query dashboard da O(N) a O(1) rispetto al numero di sessioni
- Chiusi 7 task critici identificati da swarm analysis
- Implementato pattern race-safe per tutte le operazioni di point awarding

---

## [1.15.0] - 2026-07-22

### ✨ Added
- **Actions Page - Filtro Persona**: Nuova funzionalità filtro per assegnatario
  - Dropdown "Filtra per: Tutte le persone" nella vista Kanban
  - Filtra azioni in tempo reale per persona assegnata
  - Bottone "Rimuovi filtro" per reset rapido
  - Statistiche (Todo, In corso, Completate) aggiornate dinamicamente con filtro

### 🗑️ Removed
- **Actions Page - Vista Gantt**: Rimossa vista Gantt chart
  - Eliminato toggle Kanban/Gantt
  - Vista Kanban ora è l'unica modalità di visualizzazione
  - Focus su semplicità e usabilità

### 🐛 Fixed
- **Actions Page**: Fix bug campo `assigned_to_multi`
  - Corretto uso di `assigned_to_multi` invece di `assigned_to`
  - Risolto errore "forEach is not a function" nel filtro persone

- **Badge Tooltip**: Fix testi troncati nei tooltip badge bloccati
  - Larghezza massima aumentata da 150px a 320px
  - Testo può ora andare a capo per descrizioni lunghe
  - Padding aumentato per migliore leggibilità

### 🛠️ Database Scripts
- **Quiz Leaderboard Reset**: Script SQL per reset hall of fame quiz
  - `reset-quiz-leaderboard.sql`: Cancella tutte le risposte quiz
  - Mantiene le domande per riutilizzo futuro
  - Query di verifica post-reset incluse

---

## [1.14.0] - 2026-07-03

### ✨ Added
- **Team Mood Collaboration**: Nuova fase mood collaborazione team nello step 1
  - Sotto-fase "Team" dopo il mood personale
  - 4 opzioni: Ottima 🤝💚, Buona 🤝💙, Sufficiente 🤝⚠️, Scarsa 🤝❌
  - Tabella `team_mood_votes` con RLS policies
  - Colonna `mood_phase` su sessioni (`personal` | `team`)
  - Componente `TeamMoodVoting` con UI a griglia 2x2
  - Componente `TeamMoodTrend` con grafico a torta
  - Navigazione sotto-fasi in `SessionWizard` (come retro_phase)
  - Hook `useTeamMood` per gestione voti team
  - Visualizzazione dati team mood in `ClosedSessionView`
  - Supporto in `useGlobalMoods` per trend storici

- **Actions Management Enhancement**: Gestione assegnatari migliorata
  - Modifica assegnatari azioni esistenti in fase Brainstorming
  - Click su azioni per aprire modal di edit con `ActionEditModal`
  - Visualizzazione azioni sotto ogni commento con icona edit
  - Permessi: organizzatore + assegnatari possono modificare

### 🐛 Fixed
- **Actions Page**: Fix caricamento partecipanti per modifica assegnatari
  - Carica tutti i partecipanti della sessione (non solo assegnatari esistenti)
  - Dropdown "Aggiungi assegnatario..." ora funziona correttamente
  - useEffect che fetcha partecipanti quando si apre modal edit

- **Profile Page**: Fix conteggio badge in statistiche veloci
  - Usa `useBadges()` invece di valore hardcodato "0"
  - Mostra numero reale di badge sbloccati

- **Quiz Themes**: Rimosso badge duplicato con numero domande
  - Elimina ridondanza icona + numero nella card tema
  - Info domande mostrata una sola volta con icona BookOpen

- **TypeScript Build**: Fix errori compilazione
  - Rimosso import inutilizzato `Eye` da SessionWizard
  - Rimossa variabile inutilizzata `revealRetro`

### 🔧 Changed
- `ActionEditModal`: UI migliorata per gestione assegnatari
  - Messaggio "Nessun assegnatario selezionato" quando vuoto
  - Messaggio "Tutti i partecipanti sono già assegnati" se full
  - Dropdown sempre visibile quando `canEdit=true`

- `BrainstormingPhase`: Integrazione completa edit azioni
  - Import `ActionEditModal` e `useAuthStore`
  - Stato `editingAction` per modal
  - Funzioni `canEditAction` e `canDeleteAction`
  - Azioni mostrate in box arancione cliccabili

### 📊 Database Migrations
- `migration-team-mood.sql`: Tabella team_mood_votes + colonna mood_phase

---

## [1.12.0] - 2025-05-11

### ✨ Added
- **Super Admin**: Funzionalità completa amministratore con pieni poteri
  - Visualizzazione di tutte le retrospettive nel sistema
  - Controlli host su qualsiasi board (chiudi, modifica, gestisci timer, step)
  - Badge dorato distintivo nella navbar
  - Database: migrazione `015_super_admin.sql`
  - Email super admin: `gianluca.giglio@gmail.com`

- **Password Recovery**: Sistema completo recupero password
  - Pagina "Password dimenticata" (`/forgot-password`)
  - Pagina reset password (`/reset-password`)
  - Email automatica con link sicuro
  - Validazione password (min 6 caratteri)

- **Actions Enhancement**: Campi aggiuntivi azioni Kanban
  - **Note**: Campo note multi-riga per dettagli e aggiornamenti
  - **Resolution**: Campo risoluzione per documentare la soluzione
  - Database: migrazione `016_action_notes_resolution.sql`
  - UI migliorata con textarea in `ActionEditModal`

### 🔧 Changed
- Migliorata gestione permessi in `useSession.ts` (helper `canModerate()`)
- Dashboard mostra tutte le board per super admin
- SessionCard mostra pulsante elimina anche per super admin
- AuthStore: aggiunta funzione `isSuperAdmin()`

### 🗑️ Removed
- Sistema invio email automatiche (feature rollback completo)

---

## [1.11.0] - 2025-04-15

### ✨ Added
- **Traduzione completa in inglese**: Tutte le stringhe UI tradotte
- Supporto base per internazionalizzazione

---

## [1.10.0] - 2025-04-14

### 🐛 Fixed
- Fix celle KTLO/NRT non editabili

### ✨ Added
- Colonna "Match" in Gantt: Estimated vs Planned
- Percentuali nel calcolo risorse
- Selezione celle in Team Manager
- Toggle expand/collapse tabelle

---

## [Versioni precedenti]

### v0.2.17 - v1.9.0
- Fix export Excel
- Calcoli capacità migliorati
- Deploy ottimizzato
- Features Gantt avanzate

---

## 🗺️ Roadmap

### Prossime release
- [ ] Notifiche push real-time
- [ ] Export PDF retrospettive
- [ ] Analytics dashboard avanzata
- [ ] Integrazione Slack/Teams

### Future considerazioni
- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Gamification estesa
- [ ] Multi-tenant workspaces
