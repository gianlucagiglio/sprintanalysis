# UI-INVENTORY.md

## Inventario Componenti UI Custom - RetroBoard

Mappatura completa dei componenti UI custom nel progetto RetroBoard con corrispondenza ai componenti Vibe.

**Data**: 2026-09-05
**Scope**: `src/components/ui/` + conteggio usi in tutta la codebase
**Totale Componenti**: 11

---

## Componenti per Utilizzo

### 🔥 Alta Priorità (>30 usi)

| Componente | File | Usi | Vibe Corrispondente | Note |
|-----------|------|-----|-------------------|------|
| **Card** | `Card.tsx` | **80** | `@vibe/core/components/Card` | Contenitore principale, ampiamente usato in layout, sezioni, pannelli. Supporta padding, hover effects, glass morphism. |
| **Button** | `Button.tsx` | **49** | `@vibe/core/components/Button` | 5 varianti (primary, secondary, danger, ghost, success). Supporta loading state. Usato in ogni pagina. |
| **Badge** | `Badge.tsx` | **31** | `@vibe/core/components/Badge` | 8 varianti di colore. Supporta glow animation. Usato per stati, tag, indicator. |

### 📊 Media Priorità (10-29 usi)

| Componente | File | Usi | Vibe Corrispondente | Note |
|-----------|------|-----|-------------------|------|
| **PageHeader** | `PageHeader.tsx` | **13** | - | **Custom RetroBoard**. 4 varianti: hero, standard, navigation, centered. Nessun equivalente Vibe. |
| **Input** | `Input.tsx` | **20** | `@vibe/core/components/Input` | Form input con label, error state, helper text. Validation icon. |

### 📈 Bassa Priorità (1-9 usi)

| Componente | File | Usi | Vibe Corrispondente | Note |
|-----------|------|-----|-------------------|------|
| **Modal** | `Modal.tsx` | **6** | `@vibe/core/components/Modal` | Dialog con backdrop blur, animazioni Framer Motion, close button. |
| **SessionCardSkeleton** | `Skeleton.tsx` | **6** | `@vibe/core/components/Skeleton` | Skeleton loader per session cards durante loading. Variante specifica. |
| **Skeleton** | `Skeleton.tsx` | **4** | `@vibe/core/components/Skeleton` | Base skeleton component per loading states. |
| **ListSkeleton** | `Skeleton.tsx` | **1** | `@vibe/core/components/Skeleton` | Skeleton loader per liste (variante). |
| **ScrollToTop** | `ScrollToTop.tsx` | **1** | - | **Custom RetroBoard**. Pulsante fisso bottom-right per scroll-to-top. |

### ❌ Non Utilizzati (0 usi)

| Componente | File | Usi | Vibe Corrispondente | Note |
|-----------|------|-----|-------------------|------|
| **Checkbox** | `Checkbox.tsx` | **0** | `@vibe/core/components/Checkbox` | Definito ma non usato in codebase. |
| **SectionHeader** | `SectionHeader.tsx` | **0** | - | **Custom RetroBoard**. Definito ma mai usato. Considerare rimozione. |
| **CardSkeleton** | `Skeleton.tsx` | **0** | `@vibe/core/components/Skeleton` | Variante skeleton per card. Non usato. |
| **StepIndicator** | `StepIndicator.tsx` | **0** | - | **Custom RetroBoard**. Indicatore progress per 4 step. Non usato (step breadcrumb in SessionWizard è inline). |

---

## Riepilogo per Categoria

### Componenti Standard (Candidati per sostituzione con Vibe)

Questi componenti hanno equivalenti diretti in Vibe e potrebbero essere migrati:

| Componente | Vibe Equivalente | Sforzo Migrazione | Note |
|-----------|------------------|-------------------|------|
| Button | `Button` | ⭐ Basso | 5 varianti personalizzate. Vibe ha configurazione simile. |
| Badge | `Badge` | ⭐ Basso | 8 varianti custom. Vibe supporta varianti. |
| Card | `Card` | ⭐ Basso | Styling glass morphism custom. Vibe ha composizione flessibile. |
| Input | `Input` | ⭐ Basso | Error state + helper text. Vibe supporta form validation. |
| Modal | `Modal` | ⭐ Basso | Animazioni Framer Motion. Vibe ha transizioni built-in. |
| Skeleton | `Skeleton` | ⭐⭐ Medio | 3 varianti specifiche (CardSkeleton, SessionCardSkeleton, ListSkeleton). Vibe ha base component. |
| Checkbox | `Checkbox` | ⭐⭐ Medio | Non usato. Potrebbe essere rimosso. |

### Componenti Custom RetroBoard (Non in Vibe)

Questi componenti sono specifici del design system RetroBoard e non hanno equivalenti Vibe:

| Componente | Usi | Note |
|-----------|-----|------|
| **PageHeader** | 13 | 4 varianti. Elemento cardine dell'UX. Potrebbe diventare tema Vibe. |
| **ScrollToTop** | 1 | Funzionalità semplice. Potrebbe essere abstratted in utilità. |
| **SectionHeader** | 0 | Non usato. Considerare rimozione. |
| **StepIndicator** | 0 | Non usato. La UI attuale usa Badge inline. |

---

## Statistiche Generali

```
Total UI Components Custom: 11
├─ Utilizzati: 7 (63%)
├─ Non utilizzati: 4 (37%)
│
├─ Con Vibe Equivalente: 7
├─ Custom RetroBoard: 4
│
Total Usage in Codebase: 205 istanze
├─ Card: 80 (39%)
├─ Button: 49 (24%)
├─ Badge: 31 (15%)
├─ Input: 20 (10%)
├─ PageHeader: 13 (6%)
├─ Modal: 6 (3%)
├─ Skeleton Variants: 11 (5%)
└─ Others: 5 (2%)
```

---

## Raccomandazioni per Integrazione Vibe

### Fase 1: Bassa Priorità (Semplice Sostituzione)
- ✅ Migrare `Button` → `@vibe/core/components/Button`
- ✅ Migrare `Badge` → `@vibe/core/components/Badge`
- ✅ Migrare `Card` → `@vibe/core/components/Card`
- ✅ Migrare `Input` → `@vibe/core/components/Input`

### Fase 2: Media Priorità (Con Customizzazione)
- ⚠️ Migrare `Modal` → `@vibe/core/components/Modal` (preservare animazioni)
- ⚠️ Migrare `Skeleton` → `@vibe/core/components/Skeleton` (varianti specifiche)

### Fase 3: Cleanup
- 🗑️ Rimuovere `Checkbox` (non usato)
- 🗑️ Rimuovere `SectionHeader` (non usato)
- 🗑️ Rimuovere `CardSkeleton` (non usato)
- 🗑️ Rimuovere `StepIndicator` (non usato)

### Fase 4: Componenti Custom
- 📌 Mantenere `PageHeader` (elemento iconico RetroBoard, customizzare in Vibe theme)
- 📌 Mantenere `ScrollToTop` (utility semplice)

---

## File Audit

### Componenti UI Definiti
```
src/components/ui/
├── Badge.tsx (8 varianti)
├── Button.tsx (5 varianti)
├── Card.tsx (base + hover effects)
├── Checkbox.tsx (non usato)
├── Input.tsx (error + helper)
├── Modal.tsx (Framer Motion)
├── PageHeader.tsx (4 varianti custom)
├── ScrollToTop.tsx (utility)
├── SectionHeader.tsx (non usato)
├── Skeleton.tsx (3 varianti)
└── StepIndicator.tsx (non usato)
```

### Import Freccia Utilizzati nei Componenti
- `@/components/ui/Button` - 49 import
- `@/components/ui/Card` - 80 import
- `@/components/ui/Badge` - 31 import
- `@/components/ui/Input` - 20 import
- `@/components/ui/PageHeader` - 13 import
- `@/components/ui/Modal` - 6 import
- `@/components/ui/Skeleton` - 11 import (tutte varianti)
- `@/components/ui/ScrollToTop` - 1 import

---

## Note Finali

1. **Nessuna modifica è stata apportata** durante questa analisi (read-only)
2. **Componenti Vibe** sono stati suggeriti per mappatura, non ancora integrati
3. **Usi conteggiati** escludono le definizioni nei file `.tsx` stessi
4. **Componenti inutilizzati** potrebbero essere rimossi in una futura refactoring
5. **PageHeader** è il componente custom più importante e dovrebbe essere preservato/customizzato

---

**Autore**: Claude Code Analyzer
**Generato**: 2026-09-05
**Status**: ✅ Read-Only Analysis Complete
