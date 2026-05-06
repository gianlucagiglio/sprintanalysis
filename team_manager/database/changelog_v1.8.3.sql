-- v1.8.3 - Timeline Section Labels Tooltips
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.3',
  'patch',
  'Descrizioni Sezioni come Tooltip',
  '## 🎨 Pulizia Visiva Timeline

### Descrizioni Convertite in Tooltip

Rimosse le descrizioni sempre visibili sotto i titoli delle sezioni, ora appaiono come tooltip on-hover:

- **Riepilogo Capacità**: "Totale allocazioni per settimana" → tooltip
- **NRT**: "Non-Regression Testing" → tooltip
- **KTLO**: "Keep The Lights On" → tooltip
- **Ferie & Assenze**: "Dettaglio per persona" → tooltip

### Benefici

- **Ridotto clutter visivo**: Meno testo sempre visibile
- **Interfaccia più pulita**: Header sezioni più compatti
- **Coerenza grafica**: Tutte le sezioni con stesso formato
- **UX migliorata**: Info disponibile on-demand via tooltip

### Dettagli Tecnici

- Aggiunto `title` attribute ai titoli sezioni
- Aggiunto `cursor-help` per indicare tooltip disponibile
- Rimossi div con `text-xs opacity-70`
- Tooltip nativi browser (no librerie esterne)',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.3';
