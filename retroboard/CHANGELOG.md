# Changelog

All notable changes to RetroBoard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-05-11

### Added
- **Super Admin**: Funzionalità completa super admin
  - Visualizzazione di tutte le retrospettive nel sistema
  - Pieni poteri su qualsiasi board (chiudere, modificare, gestire)
  - Badge dorato distintivo nella navbar
  - Migrazione database `015_super_admin.sql`
- **Password Recovery**: Sistema completo di recupero password
  - Pagina "Password dimenticata" con invio email
  - Pagina reset password con validazione
  - Integrazione con Resend per invio email
  - Configurazione variabile d'ambiente `VITE_APP_URL`
- **Actions Enhancement**: Nuovi campi per azioni Kanban
  - Campo **Note**: Aggiungi note e dettagli alle azioni
  - Campo **Resolution**: Documenta come è stata risolta l'azione
  - Migrazione database `016_action_notes_resolution.sql`
  - UI migliorata in `ActionEditModal` con textarea

### Changed
- Migliorata gestione permessi organizer/super admin in `useSession.ts`
- Dashboard ora mostra tutte le board per super admin
- SessionCard mostra pulsante elimina anche per super admin

### Fixed
- Rimossi log di debug per super admin
- Rollback completo sistema invio email (feature rimossa)

## [1.11.0] - 2025-04-15

### Added
- **Traduzione completa in inglese**: Tutte le stringhe dell'interfaccia tradotte
- Supporto multilingua preparato per future espansioni

## [1.10.0] - 2025-04-14

### Fixed
- **Fix celle KTLO/NRT**: Risolto problema celle non editabili
- Migliorata gestione capacità e numeri

### Added
- Nuova colonna "Match" nel Gantt: Estimated vs Planned
- Percentuali nel calcolo delle risorse
- Selezione celle migliorata in Team Manager
- Toggle expand/collapse per tabelle

## [0.2.17] - 2025-04-13

### Fixed
- Fix esportazione Excel
- Migliorati calcoli capacità

### Changed
- Review numeri capacità
- Deploy ottimizzato

---

## Roadmap

### Prossime feature
- [ ] Notifiche real-time
- [ ] Export PDF retrospettive
- [ ] Analytics avanzate
- [ ] Integrazione Slack/Teams

### In considerazione
- [ ] Mobile app nativa
- [ ] AI-powered insights
- [ ] Gamification avanzata
- [ ] Workspace multi-tenant
