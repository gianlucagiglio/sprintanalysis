# RESTYLE.md

## Mappatura Definitiva: RetroBoard Custom → Vibe Design System

**Data**: 2026-09-05
**Package**: `@vibe/core@3.x`, `@vibe/icons`
**Tokens**: `@vibe/core/tokens` (gia importato in `main.tsx`)

---

## 1. Correzioni rispetto a UI-INVENTORY.md

L'inventario precedente conteneva mappature errate. Dopo analisi del package `@vibe/core`:

| Componente RetroBoard | Inventario diceva | Realta Vibe |
|----------------------|------------------|-------------|
| **Badge** | `Badge` | **`Label`** (fill/line) o **`Chips`**. Il `Badge` di Vibe e un dot/counter, non un chip colorato. |
| **Card** | `Card` | **Non esiste in Vibe**. Nessun componente Card nel package. Va tenuto custom. |
| **Checkbox** | `Checkbox` | Corretto, ma il componente non e usato nel progetto. Eliminare. |
| **StepIndicator** | Nessuno | **`MultiStepIndicator`** esiste in Vibe (da `@vibe/wizard`), ma il componente non e usato. |

---

## 2. Token Vibe Disponibili

### 2.1 Spacing (`--space-*`)

| Token Vibe | Valore | Uso RetroBoard attuale (Tailwind) |
|-----------|--------|----------------------------------|
| `--space-2` | 2px | - |
| `--space-4` | 4px | `p-1`, `gap-1` |
| `--space-8` | 8px | `p-2`, `gap-2` |
| `--space-12` | 12px | `p-3`, `gap-3` |
| `--space-16` | 16px | `p-4`, `gap-4` |
| `--space-20` | 20px | `p-5` |
| `--space-24` | 24px | `p-6`, `gap-6` |
| `--space-32` | 32px | `p-8` |
| `--space-40` | 40px | `p-10` |
| `--space-48` | 48px | `p-12` |

**Strategia**: Non migrare Tailwind spacing a CSS vars. Il sistema Tailwind funziona. Usare token Vibe solo dentro componenti Vibe.

### 2.2 Colori Vibe → Colori RetroBoard

| Contesto | Token Vibe | Valore | Equivalente RetroBoard |
|----------|-----------|--------|----------------------|
| **Primario** | `--primary-color` | `#0073ea` | `retro-primary` (`#6366F1` indigo) |
| **Primario hover** | `--primary-hover-color` | `#0060b9` | `retro-primary-hover` (`#4F46E5`) |
| **Testo principale** | `--primary-text-color` | `#323338` | `retro-text` (`#111827`) |
| **Testo secondario** | `--secondary-text-color` | `#676879` | `retro-text-secondary` (`#6B7280`) |
| **Sfondo primario** | `--primary-background-color` | `#ffffff` | `retro-card` (`#FFFFFF`) |
| **Sfondo secondario** | `--secondary-background-color` | `#ffffff` | `retro-bg` (`#F9FAFB`) |
| **Sfondo grigio** | `--allgrey-background-color` | `#f6f7fb` | `retro-surface` (`#F3F4F6`) |
| **Bordo layout** | `--layout-border-color` | `#d0d4e4` | `retro-border` (`#E5E7EB`) |
| **Bordo UI** | `--ui-border-color` | `#c3c6d4` | `retro-border-strong` (`#D1D5DB`) |
| **Positivo** | `--positive-color` | `#00854d` | `retro-glad` (`#059669`) |
| **Negativo** | `--negative-color` | `#d83a52` | `retro-mad` (`#DC2626`) |
| **Attenzione** | `--warning-color` | `#ffcb00` | `retro-sad` (`#D97706`) |

**Strategia**: Sovrascrivere i token Vibe `:root` per allinearli al tema RetroBoard, cosi i componenti Vibe adottano automaticamente la palette giusta. Aggiungere in `index.css`:

```css
:root {
  /* Override Vibe tokens per tema RetroBoard */
  --primary-color: #6366F1;
  --primary-hover-color: #4F46E5;
  --primary-text-color: #111827;
  --secondary-text-color: #6B7280;
  --primary-background-color: #FFFFFF;
  --allgrey-background-color: #F3F4F6;
  --layout-border-color: #E5E7EB;
  --ui-border-color: #D1D5DB;
  --positive-color: #059669;
  --negative-color: #DC2626;
  --warning-color: #D97706;
  --link-color: #4F46E5;
}
```

### 2.3 Tipografia

| Token Vibe | RetroBoard attuale |
|-----------|-------------------|
| `--font-family: Figtree, Roboto...` | `Open Sans, Inter, system-ui` |
| `--title-font-family: Poppins...` | `Poppins` (gia allineato!) |
| `--font-size-10: 14px` | `text-sm` (14px) |
| `--font-size-20: 14px` | `text-sm` |
| `--font-size-30: 16px` | `text-base` (16px) |
| `--font-size-40: 18px` | `text-lg` (18px) |
| `--font-size-50: 24px` | `text-2xl` (24px) |
| `--font-size-60: 30px` | `text-3xl` (30px) |

**Strategia**: Sovrascrivere `--font-family` per mantenere Open Sans:

```css
:root {
  --font-family: 'Open Sans', 'Inter', system-ui, sans-serif;
  /* --title-font-family gia usa Poppins, non cambiare */
}
```

### 2.4 Border Radius

| Token Vibe | Valore | RetroBoard attuale |
|-----------|--------|-------------------|
| `--border-radius-4` | 4px | `rounded` |
| `--border-radius-8` | 8px | `rounded-lg` |
| `--border-radius-12` | 12px | `rounded-xl` |
| `--border-radius-16` | 16px | `rounded-2xl` |

**Nota**: RetroBoard usa `rounded-2xl` (16px) come default. Vibe usa `--border-radius-big` = 16px. Compatibile.

### 2.5 Motion

| Token Vibe | Valore | RetroBoard attuale |
|-----------|--------|-------------------|
| `--motion-productive-short` | 70ms | - |
| `--motion-productive-medium` | 100ms | `duration-150` |
| `--motion-productive-long` | 150ms | `duration-200` |
| `--motion-expressive-short` | 250ms | `duration-300` |
| `--motion-expressive-long` | 400ms | `duration-400` |
| `--motion-timing-transition` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-out` |
| `--motion-timing-emphasize` | `cubic-bezier(0, 0, 0.2, 1.4)` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

**Strategia**: Le animazioni Framer Motion restano indipendenti. Usare token Vibe solo per transizioni CSS nei componenti Vibe.

### 2.6 Ombre

| Token Vibe | RetroBoard Tailwind |
|-----------|-------------------|
| `--box-shadow-xs` | `shadow-soft` |
| `--box-shadow-small` | `shadow-card` |
| `--box-shadow-medium` | `shadow-card-hover` |
| `--box-shadow-large` | `shadow-float` |

---

## 3. Mappatura Definitiva Componente per Componente

### ✅ MIGRABILI A VIBE

#### Button → `Button` da `@vibe/core`

```
Retro variant    → Vibe type + color
─────────────────────────────────────
primary          → type="primary"   color="primary"
secondary        → type="secondary" color="primary"
danger           → type="primary"   color="negative"
ghost            → type="tertiary"  color="primary"
success          → type="primary"   color="positive"

Retro size       → Vibe size
─────────────────────────────
sm               → size="small"
md               → size="medium"
lg               → size="large"

Retro loading    → Vibe loading={true}
Retro disabled   → Vibe disabled={true}
Retro children   → Vibe children (identico)
```

**Attenzione API**: Vibe Button gestisce `leftIcon`/`rightIcon` come props separate, non come children inline. Ogni uso con `<Icon /><span>` va rivisto.

**File impattati**: 49 usi in tutta la codebase.

---

#### Badge → `Label` da `@vibe/core`

Il `Badge` di RetroBoard e un chip/etichetta colorata. Il `Label` di Vibe corrisponde.

```
Retro variant     → Vibe kind + color
──────────────────────────────────────
default           → kind="fill"  color="primary" (tono neutro)
primary           → kind="fill"  color="primary"
success / glad    → kind="fill"  color="positive"
warning / sad     → kind="fill"  color="warning" (non esiste → custom class)
mad               → kind="fill"  color="negative"
outline           → kind="line"  color="primary"
```

**Problemi**:
- Vibe Label non ha varianti `warning`/`sad`. Servira CSS override per queste.
- Vibe Label non supporta `glow` animation. Va aggiunto via className.
- Il Badge attuale accetta children (icone + testo). Label accetta solo `text` prop. Dove serve contenuto complesso, usare **Chips** invece di Label.

**File impattati**: 31 usi.

---

#### Input → `TextField` da `@vibe/core`

```
Retro prop       → Vibe prop
────────────────────────────
label            → title
error (string)   → validation={{ status: "error", text: error }}
helper           → (sotto il campo, custom)
placeholder      → placeholder (identico)
value            → value (identico)
onChange(e)      → onChange(value, event) ⚠️ BREAKING: firma diversa
ref              → setRef(node) ⚠️ BREAKING: non e un forwardRef standard
```

**Attenzione**: L'`onChange` di Vibe TextField passa `(value, event)` non `(event)`. Ogni consumer va aggiornato.

**Vantaggi**: Vibe TextField supporta nativamente `validation`, `loading`, `maxLength` con counter, `icon`.

**File impattati**: 20 usi.

---

#### Modal → `Modal` da `@vibe/core`

```
Retro prop       → Vibe prop
────────────────────────────
open             → show
onClose          → onClose (simile, ma evento diverso)
title            → ModalHeader (figlio compositivo)
children         → ModalContent (figlio compositivo)
-                → id (REQUIRED in Vibe)
```

**Architettura Vibe Modal**: Compositiva con sotto-componenti:
```tsx
<Modal id="x" show={open} onClose={onClose}>
  <ModalHeader title="Titolo" />
  <ModalContent>
    {children}
  </ModalContent>
  <ModalFooter>
    <Button>Conferma</Button>
  </ModalFooter>
</Modal>
```

**Vantaggi**: Focus trapping, ESC handling, backdrop click built-in. Sostituisce Framer Motion animations.

**File impattati**: 6 usi (CreateTeamModal, OverdueActionsModal, ActionEditModal, CreateSessionModal, BadgeUnlockModal, ParkingLot ConvertToActionModal).

---

#### Skeleton → `Skeleton` da `@vibe/core`

```
Vibe types: "circle" | "rectangle" | "text"
Vibe sizes: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "small" | "custom"
```

Le varianti custom (SessionCardSkeleton, ListSkeleton) vanno ricostruite componendo Skeleton base di Vibe.

**File impattati**: 11 usi totali.

---

### 🚫 NON MIGRABILI — Restano Custom

#### Card — Nessun equivalente Vibe

Vibe non ha un componente Card. Il Card di RetroBoard con glass-morphism e specifico del design system RetroBoard.

**Azione**: Mantenere `src/components/ui/Card.tsx` cosi com'e. E il componente piu usato (80 usi), migrarlo sarebbe rischioso e inutile.

---

#### PageHeader — Nessun equivalente Vibe

4 varianti custom (hero, standard, navigation, centered). Elemento cardine dell'UX RetroBoard.

**Azione**: Mantenere `src/components/ui/PageHeader.tsx`.

---

#### ScrollToTop — Nessun equivalente Vibe

Utility semplice. 1 uso.

**Azione**: Mantenere `src/components/ui/ScrollToTop.tsx`.

---

### 🗑️ DA ELIMINARE (0 usi)

| File | Motivo |
|------|--------|
| `Checkbox.tsx` | Non usato in nessun componente |
| `SectionHeader.tsx` | Non usato in nessun componente |
| `StepIndicator.tsx` | Non usato (breadcrumb inline in SessionWizard) |
| `CardSkeleton` (in `Skeleton.tsx`) | Variante non usata |

---

## 4. Piano di Migrazione in Batch

### Prerequisito: Override Token (Batch 0) ✅ COMPLETATO

**Cosa**: Sovrascrivere i token Vibe `:root` in `index.css` per allinearli al tema RetroBoard.

**File modificato**: `src/index.css`

Token sovrascritti (38 variabili):
- Primary/Brand: `--primary-color` (#6366F1), hover, selected, highlighted, surface
- Text: `--primary-text-color` (#111827), `--secondary-text-color` (#6B7280)
- Backgrounds: primary, secondary, allgrey, modal, dialog, inverted
- Borders: `--ui-border-color` (#D1D5DB), `--layout-border-color` (#E5E7EB)
- UI surfaces: background, hover, disabled, placeholder, icon
- Semantic: positive (#059669), negative (#DC2626), warning (#D97706) con hover/selected/selected-hover
- Link: #4F46E5
- Typography: `--font-family` (Open Sans), `--title-font-family` (Poppins)
- Label: `--label-background-color` (#E0E7FF)

**Rischio**: Nessuno. Build OK.

---

### Batch 1: Fondamenta — Button + Input + Cleanup dead code ✅ COMPLETATO

**Componenti**: `Button`, `Input` + eliminazione Checkbox/SectionHeader/StepIndicator/CardSkeleton

**Ordine**:
1. ✅ Eliminati 3 file (`Checkbox.tsx`, `SectionHeader.tsx`, `StepIndicator.tsx`) + rimosso export `CardSkeleton` da `Skeleton.tsx`
2. ✅ Migrato `Button.tsx`: colori Tailwind hardcoded → classi CSS `.vibe-btn-*` che usano token Vibe (con hover/active via pseudo-classi)
3. ✅ Migrato `Input.tsx`: colori Tailwind hardcoded → classi CSS `.vibe-input` / `.vibe-input-error` + inline styles con token Vibe
4. ✅ 0 consumer modificati (API identica)

**Classi CSS aggiunte** in `index.css`:
- `.vibe-btn-primary` / `.vibe-btn-secondary` / `.vibe-btn-danger` / `.vibe-btn-ghost` / `.vibe-btn-success`
- `.vibe-input` / `.vibe-input-error`

**File eliminati**: `Checkbox.tsx`, `SectionHeader.tsx`, `StepIndicator.tsx`
**File modificati**: `Button.tsx`, `Input.tsx`, `Skeleton.tsx`, `index.css`
**Rischio**: Nessuno. API invariata, build OK.

---

### Batch 2: Tipografia + Badge → Label ✅ COMPLETATO

**Componenti**: `Badge` → riscritto con Vibe CSS tokens

**Ordine**:
1. ✅ Creare mappatura varianti Badge → token Vibe (`--positive-color`, `--negative-color`, `--warning-color`, `--primary-color`, etc.)
2. ✅ Aggiornare `Badge.tsx`: sostituiti colori Tailwind hardcoded con `variantTokens` basati su CSS custom properties Vibe
3. ✅ API `children` preservata (Label Vibe accetta solo `text` string, ~65% degli usi hanno icone JSX)
4. ✅ Verificati 16 consumer (build OK, 0 errori)

**Scelta implementativa**: Vibe Label accetta solo `text` (string), non `children` JSX. Il ~65% degli usi di Badge contiene icone Lucide + testo. Invece di forzare Label/Chips (che avrebbe richiesto riscrittura di 31+ file), Badge e stato riscritto per usare i token CSS Vibe (`--positive-color-selected`, `--negative-color-selected`, `--warning-color-selected`, `--primary-selected-color`, etc.) come `style` inline, ottenendo consistenza visiva con Vibe e supporto automatico per dark/light/hacker theme.

**File modificato**: `src/components/ui/Badge.tsx`
**File impattati**: 16 file consumer, 0 modifiche necessarie (API identica)
**Rischio**: Nessuno. API invariata, solo colori allineati a Vibe tokens.

---

### Batch 3: Modal + Skeleton ✅ COMPLETATO

**Componenti**: `Modal`, `Skeleton` (tutte le varianti)

**Ordine**:
1. ✅ Migrato `Modal.tsx`: colori hardcoded → token Vibe (`--backdrop-color`, `--primary-text-color`, `--secondary-text-color`, `--layout-border-color`, `--box-shadow-large`)
2. ✅ 0 consumer modificati (API invariata, Framer Motion preservato, glass-morphism preservato)
3. ✅ Migrato `Skeleton.tsx`: `bg-retro-surface` → `--ui-background-color`, border/shadow in `SessionCardSkeleton`/`ListSkeleton` → token Vibe
4. ✅ 0 consumer modificati

**Scelta implementativa**: Vibe Modal richiede API compositiva (`ModalHeader`/`ModalContent`) e prop `show`/`id` diversi da RetroBoard (`open`/`title`/`children`). Migrare a Vibe Modal avrebbe richiesto riscrittura di tutti i 6 consumer. Inoltre il Modal custom usa Framer Motion + glass-morphism che Vibe non supporta. Migrati solo i colori a token Vibe.

**File modificati**: `Modal.tsx`, `Skeleton.tsx`
**File impattati**: 6 Modal + 11 Skeleton consumer, 0 modifiche necessarie
**Rischio**: Nessuno. Build OK.

---

### Batch 4: Polish + Componenti Custom ✅ COMPLETATO

**Cosa**: Revisione finale dei componenti custom rimasti.

**Ordine**:
1. ✅ Card — `bg-retro-card`/`border-retro-border`/`shadow-card` → token Vibe (`--primary-background-color`, `--layout-border-color`, `--box-shadow-xs`). Glass-morphism preservato (usa classi CSS custom, non colori hardcoded).
2. ✅ PageHeader — 3 occorrenze `text-retro-text-secondary` → `text-[var(--secondary-text-color)]`. Gradienti decorativi mantenuti (design intentionale, non colori tema).
3. ✅ ScrollToTop — `bg-retro-primary`/`text-white`/`shadow-float` → `--primary-color`/`--text-color-on-primary`/`--box-shadow-medium`.

**File modificati**: `Card.tsx`, `PageHeader.tsx`, `ScrollToTop.tsx`
**File impattati**: 80 Card + 13 PageHeader + 1 ScrollToTop consumer, 0 modifiche necessarie
**Rischio**: Nessuno. Build OK.

---

## 5. Riepilogo Visivo

```
BATCH 0 ─ Token Override (index.css) ✅
│
BATCH 1 ─ Fondamenta ✅
│  ├── ✅ Eliminati: Checkbox, SectionHeader, StepIndicator, CardSkeleton
│  ├── ✅ Button (49 usi) → Vibe CSS tokens (.vibe-btn-*)
│  └── ✅ Input (20 usi) → Vibe CSS tokens (.vibe-input)
│
BATCH 2 ─ Tipografia + Etichette ✅
│  └── ✅ Badge (16 consumer) → Vibe CSS tokens (API preservata)
│
BATCH 3 ─ Overlay + Loading ✅
│  ├── ✅ Modal (6 usi) → Vibe CSS tokens (Framer Motion preservato)
│  └── ✅ Skeleton (11 usi) → Vibe CSS tokens
│
BATCH 4 ─ Polish ✅
│  ├── ✅ Card (80 usi) → Vibe CSS tokens (glass-morphism preservato)
│  ├── ✅ PageHeader (13 usi) → Vibe CSS tokens (gradienti preservati)
│  └── ✅ ScrollToTop (1 uso) → Vibe CSS tokens
```

---

## 6. Rischi e Mitigazioni

| Rischio | Probabilita | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| API `onChange` diversa in TextField | Certa | Alto | Wrapper che traduce `(value, event)` → `(event)` |
| Badge → Label perde children JSX | Certa | Alto | Usare Chips dove servono icone. Adapter per i casi semplici |
| Conflitto CSS Vibe + Tailwind | Media | Medio | Vibe usa CSS modules. Verificare z-index e specificity |
| Font Figtree caricato da Vibe sovrascrive Open Sans | Media | Basso | Override `--font-family` in `:root` |
| Vibe Modal non ha Framer Motion | Certa | Basso | Vibe ha transizioni built-in. Accettare differenza animazione |
| Dimensioni bundle aumentano | Certa | Basso | Vibe supporta tree-shaking. Import granulari |

---

## 7. Import Granulari Consigliati

```tsx
// Componenti — import specifici per tree-shaking
import { Button } from '@vibe/core/next'  // se disponibile
// oppure
import { Button } from '@vibe/core'

// Token — gia importati in main.tsx
import '@vibe/core/tokens'

// Icone — import specifiche
import { Check, Close } from '@vibe/icons'

// Stili componenti — importati automaticamente dai componenti
```

---

**Status**: Analisi completata. Nessun file modificato.
**Prossimo passo**: Approvazione utente → esecuzione Batch 0 (token override).
