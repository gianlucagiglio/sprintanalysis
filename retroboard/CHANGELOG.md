# Changelog

All notable changes to RetroBoard will be documented in this file.

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
