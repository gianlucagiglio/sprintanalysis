-- v1.10.0 - Expand/Collapse All Controls for Timeline and Gantt
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.10.0',
  'minor',
  'Controlli Espandi/Collassa Tutto per Timeline e Gantt',
  '## 🎛️ Controllo Globale Espansione - UX Migliorata

### Funzionalità

Aggiunti pulsanti **"Espandi tutto"** e **"Collassa tutto"** sia nella **Timeline** che nel **Gantt** per controllare simultaneamente tutte le sezioni collassabili.

### Problema Precedente

L''utente doveva espandere/collassare manualmente ogni singola sezione:
- ❌ Click su ogni Feature (5-10+ feature)
- ❌ Click su NRT, KTLO, Ferie, Riepilogo Capacità
- ❌ Operazione ripetitiva e time-consuming
- ❌ Stato non persistente tra ricaricamenti

### Soluzione

**Pulsanti globali** che controllano tutte le sezioni con un solo click:
- ✅ **Espandi tutto**: Apre tutte le dropdown contemporaneamente
- ✅ **Collassa tutto**: Chiude tutte le dropdown
- ✅ **Stato centralizzato**: Zustand store globale
- ✅ **Persistenza**: Stato mantiene preferenze utente durante la sessione

### Implementazione

**1. Store Globale (Zustand)**

Nuovo stato UI in `src/store/useAppStore.ts`:

```typescript
// UI State
collapsedFeatures: Record<string, boolean>        // Timeline features
collapsedGanttFeatures: Record<string, boolean>   // Gantt features
nrtExpanded: boolean                               // NRT section
ktloExpanded: boolean                              // KTLO section
timeOffExpanded: boolean                           // Ferie section
capacityRecapExpanded: boolean                     // Riepilogo section

// Funzioni controllo globale
expandAllTimeline: () => void    // Espandi tutto Timeline
collapseAllTimeline: () => void  // Collassa tutto Timeline
expandAllGantt: () => void       // Espandi tutto Gantt
collapseAllGantt: () => void     // Collassa tutto Gantt
```

**2. Componente UI Riutilizzabile**

Nuovo componente `src/components/ui/ExpandCollapseButtons.tsx`:

```tsx
<ExpandCollapseButtons
  onExpandAll={expandAllTimeline}
  onCollapseAll={collapseAllTimeline}
/>
```

**3. Integrazione Timeline**

`src/pages/TimelineView.tsx`:
- Pulsanti nell''header accanto ai filtri
- Controllo di:
  - Tutte le Feature (via `collapsedFeatures`)
  - NRT (via `nrtExpanded`)
  - KTLO (via `ktloExpanded`)
  - Ferie (via `timeOffExpanded`)
  - Riepilogo Capacità (via `capacityRecapExpanded`)

**4. Integrazione Gantt**

`src/pages/GanttView.tsx`:
- Pulsanti nell''header accanto ai filtri
- Controllo di:
  - Tutte le Feature con breakdown ruoli (via `collapsedGanttFeatures`)

**5. Refactoring Componenti**

Componenti modificati per usare stato globale invece di locale:

- `CapacityRecapRow`: `isExpanded` da prop
- `NRTRow`: `isExpanded` da prop
- `KTLORow`: `isExpanded` da prop
- `GlobalTimeOffRow`: `isExpanded` da prop
- `GanttFeatureRow`: `collapsedGanttFeatures[feature.id]` da store

### Logica Espansione

**Timeline - Espandi Tutto:**
```typescript
expandAllTimeline: () => {
  // Tutte le feature → espanse (false = expanded)
  features.forEach(f => collapsedFeatures[f.id] = false)

  // Tutte le sezioni → espanse
  nrtExpanded = true
  ktloExpanded = true
  timeOffExpanded = true
  capacityRecapExpanded = true
}
```

**Timeline - Collassa Tutto:**
```typescript
collapseAllTimeline: () => {
  // Tutte le feature → collassate (true = collapsed)
  features.forEach(f => collapsedFeatures[f.id] = true)

  // Tutte le sezioni → collassate
  nrtExpanded = false
  ktloExpanded = false
  timeOffExpanded = false
  capacityRecapExpanded = false
}
```

**Gantt - Stessa logica** ma su `collapsedGanttFeatures`.

### UI Layout

**Timeline Header:**
```
┌─────────────────────────────────────────────────┐
│ Timeline                                        │
│                                                 │
│ [Espandi tutto] [Collassa tutto] [Filtri...] [+Nuova Feature] │
└─────────────────────────────────────────────────┘
```

**Gantt Header:**
```
┌─────────────────────────────────────────────────┐
│ Vista Gantt                                     │
│                                                 │
│ [Espandi tutto] [Collassa tutto] [Filtri...]   │
└─────────────────────────────────────────────────┘
```

### Stile Pulsanti

Design coerente con UI esistente:

```tsx
className="flex items-center gap-1.5 px-3 py-1.5
  text-xs font-medium
  text-[var(--text-secondary)]
  hover:text-[var(--text-primary)]
  hover:bg-[var(--bg-hover)]
  border border-[var(--border-primary)]
  rounded-lg transition-colors"
```

**Icone:**
- `ChevronsDown` (Espandi tutto)
- `ChevronsUp` (Collassa tutto)

### Sezioni Controllate

**Timeline (5 sezioni):**
1. **Feature** (dinamiche, 1-20+)
2. **NRT** (1 sezione + membri QA)
3. **KTLO** (1 sezione + tutti membri)
4. **Ferie** (1 sezione + tutti membri)
5. **Riepilogo Capacità** (1 sezione + breakdown membri)

**Gantt (1 tipo sezione):**
1. **Feature** con breakdown ruoli (dinamiche, 1-20+)

### Stato Default

**Default all''avvio:**
- ✅ NRT: Espanso
- ✅ KTLO: Espanso
- ✅ Ferie: Espanso
- ❌ Riepilogo Capacità: Collassato
- ❌ Feature Timeline: Espanse (se già visualizzate)
- ❌ Feature Gantt: Collassate (per performance)

### Benefici UX

- ⚡ **Velocità**: 1 click vs 10+ click per espandere tutto
- 🎯 **Controllo**: Vista panoramica istantanea
- 📊 **Navigazione**: Facile switch tra vista compatta/dettagliata
- 💾 **Persistenza**: Stato mantiene preferenze durante la sessione
- 🔄 **Consistenza**: Stesso pattern Timeline/Gantt
- ♿ **Accessibilità**: Pulsanti chiari con icone + testo

### Casi d''Uso

**Scenario 1: Vista Panoramica**
- User: *"Collassa tutto"*
- Risultato: Solo header visibili, vista compatta

**Scenario 2: Dettaglio Completo**
- User: *"Espandi tutto"*
- Risultato: Tutti i membri e breakdown visibili

**Scenario 3: Focus Selettivo**
- User: *"Collassa tutto"* → Espande solo sezione specifica manualmente
- Risultato: Focus su 1 sezione, altre nascoste

### File Modificati

**Store:**
- `src/types/index.ts` → Tipi AppStore espansi
- `src/store/useAppStore.ts` → Stato UI + funzioni controllo

**Componenti UI:**
- `src/components/ui/ExpandCollapseButtons.tsx` → Nuovo componente pulsanti

**Viste:**
- `src/pages/TimelineView.tsx` → Integrazione pulsanti + stato globale
- `src/pages/GanttView.tsx` → Integrazione pulsanti

**Componenti Timeline:**
- `src/components/timeline/CapacityRecapRow.tsx` → Props `isExpanded` + `onToggle`
- `src/components/timeline/NRTRow.tsx` → Props `isExpanded` + `onToggle`
- `src/components/timeline/KTLORow.tsx` → Props `isExpanded` + `onToggle`
- `src/components/timeline/GlobalTimeOffRow.tsx` → Props `isExpanded` + `onToggle`

**Componenti Gantt:**
- `src/components/gantt/GanttFeatureRow.tsx` → Usa `collapsedGanttFeatures` da store

### Bugfix Incluso

**Celle KTLO/NRT non editabili** (risolto):

**Problema:** Le celle KTLO e NRT non rispondevano ai click.

**Causa:**
- Mancava `pointer-events-auto` sulle celle
- Mancava `relative` positioning
- Background `bg-[var(--bg-primary)]` copriva il pulsante

**Soluzione:**
Rese celle KTLO/NRT identiche a celle Feature:
```tsx
// Prima (non cliccabili)
className={`border-r ${...} bg-[var(--bg-primary)]`}

// Dopo (cliccabili)
className={`border-r border-[var(--border-primary)] relative pointer-events-auto ${
  week.isCurrentWeek ? ''timeline-week-current'' : ''''
}`}
```

### Versioning

**v1.10.0** (MINOR) perché:
- ✅ Nuova funzionalità significativa
- ✅ Migliora UX senza breaking changes
- ✅ Retrocompatibile
- ✅ Aggiunge capacità non esistenti prima
- ✅ Include bugfix critico per celle editabili',
  '2026-05-06'
);

SELECT version, title FROM changelog WHERE version = '1.10.0';
