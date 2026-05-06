-- v1.7.3 - Quick Wins UX/Accessibility Sprint
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.3',
  'patch',
  'Miglioramenti UX e Accessibilità (Quick Wins)',
  '## Miglioramenti Interazione

- **AllocationCell migliorata**: Aggiunto cursor-pointer e feedback visivo durante il salvataggio
- Spinner animato visibile durante il salvataggio delle allocazioni
- Stati hover più evidenti per maggiore chiarezza interattiva

## Miglioramenti Accessibilità

- **Touch targets ottimizzati**: Checkbox filtri aumentati da 16x16px a 20x20px con area cliccabile minima 44px (Apple HIG / Material Design)
- **ARIA labels**: Aggiunte etichette descrittive a tutti i checkbox e celle allocazioni per screen reader
- Form select standardizzati con classe form-select per consistenza visiva

## Miglioramenti UI

- **Sostituito confirm() nativo**: Dialog di conferma eliminazione feature ora usa ConfirmDialog personalizzato
- Messaggi di conferma più chiari e contestualizzati
- Esperienza utente più coerente con il design system

## Conformità

- Migliorate le conformità WCAG AA per accessibilità
- Touch target conformi a Apple HIG (44x44pt) e Material Design (48x48dp)
- Feedback visivo consistente su tutte le interazioni',
  '2026-04-26'
);

-- Verifica inserimento
SELECT version, title, release_date
FROM changelog
WHERE version = '1.7.3';
