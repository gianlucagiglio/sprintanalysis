# Changelog

All notable changes to RetroBoard will be documented in this file.

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
