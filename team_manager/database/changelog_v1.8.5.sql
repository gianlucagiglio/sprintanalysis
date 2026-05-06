-- v1.8.5 - Layout Consistency: Gantt & Ferie
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.5',
  'patch',
  'Coerenza Layout tra Timeline, Gantt e Ferie',
  '## 🎨 Uniformità Grafica Cross-Section

### Obiettivo

Applicare le migliorie di layout della v1.8.4 (colonna 300px + truncate) anche alle sezioni Gantt e Ferie per consistenza grafica totale.

### Modifiche Gantt

**Colonna sticky unificata:**
- Prima: `w-[280px]` hardcoded
- Dopo: `timeline-sticky-col` (300px globale)
- File: `GanttHeader.tsx`, `GanttFeatureRow.tsx`

**Nome feature con truncate:**
- Rimosso: Componente `Badge` con maxWidth fisso
- Aggiunto: Truncate diretto con `timeline-text-truncate`
- Tooltip: Nome completo su hover via `title` attribute
- Stesso comportamento della Timeline

### Modifiche Ferie

**Layout consistente:**
- TimeOffView già usa `timeline-sticky-col` ✅

**Bug fix scroll orizzontale:**
- Prima: `overflow-hidden` bloccava scroll
- Dopo: `overflow-x-auto` abilita scroll
- Fix: Ora scrollabile come Timeline e Gantt ✅

### Benefici

- ✅ **Coerenza visiva**: Stessa larghezza colonna (300px) in tutte le sezioni
- ✅ **UX uniforme**: Truncate + tooltip funziona uguale ovunque
- ✅ **Manutenibilità**: Unica classe CSS globale, non valori hardcoded
- ✅ **Ridotto cognitive load**: Layout prevedibile tra sezioni diverse

### Dettagli Tecnici

```tsx
// Prima (Gantt)
<div className="w-[280px] min-w-[280px]">
  <Badge label={feature.name} color={feature.color} maxWidth="150px" />
</div>

// Dopo (Gantt)
<div className="timeline-sticky-col">
  <div className="text-sm font-bold timeline-text-truncate"
       style={{ color: feature.color }}
       title={feature.name}>
    {feature.name}
  </div>
</div>
```

### Testing

Verificato su:
- ✅ Timeline: colonna 300px + truncate OK
- ✅ Gantt: colonna 300px + truncate OK
- ✅ Ferie: colonna 300px OK (già presente)

### Breaking Changes

Nessuno - solo modifiche visive, nessun cambiamento funzionale.',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.5';
