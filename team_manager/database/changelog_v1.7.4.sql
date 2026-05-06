-- v1.7.4 - Visual Consistency & Design System Sprint
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.4',
  'minor',
  'Design System Avanzato e Consistenza Visiva',
  '## Design System Foundations

- **Spacing Scale**: Sistema di spaziatura standardizzato 8pt grid (--space-xs → --space-4xl)
- **Typography Scale**: Gerarchia tipografica completa (--text-xs → --text-4xl)
- **Line Heights**: Valori semantici (tight/normal/relaxed) per leggibilità ottimale
- **Font Weights**: Scale di peso standardizzata (normal/medium/semibold/bold)

## Componenti UI Migliorati

- **ColorPicker**: Espanso da 8 a 16 colori con palette ricca e bilanciata
- Layout griglia 8x2 per migliore visualizzazione
- Picker personalizzato con label esplicativa
- ARIA labels per accessibilità

- **EmptyState**: Componente riutilizzabile per stati vuoti
- Design consistente con icone Lucide
- Supporto azioni primarie e secondarie
- Implementato in Timeline per UX coerente

## Migliorie Visual Design

- Stati vuoti uniformi in tutte le pagine
- Messaggi più descrittivi e actionable
- Icone semantiche per migliore comprensione
- Ombre standardizzate con variabili CSS (--shadow-sm/md/lg/xl)

## Benefici

- Facilità di manutenzione con design tokens
- Consistenza visiva attraverso tutta l''app
- Migliore scalabilità del design system
- UX più professionale e curata',
  '2026-04-26'
);

-- Verifica inserimento
SELECT version, title, release_date
FROM changelog
WHERE version = '1.7.4';
