-- v1.9.0 - Unified Badge Style for All Timeline Totals
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.9.0',
  'minor',
  'Stile Badge Unificato per Tutti i Totali Timeline',
  '## 🎨 Uniformità Visiva - Badge Totali

### Problema

Le righe header della timeline avevano **stili inconsistenti** per i totali settimanali:

- ✅ **Feature**: Badge con sfondo, bordo e colore
- ❌ **NRT**: Solo testo colorato semplice
- ❌ **KTLO**: Solo testo colorato semplice
- ❌ **Ferie**: Solo testo colorato semplice
- ❌ **Riepilogo Capacità**: Solo testo colorato semplice

Questa inconsistenza riduceva la **coerenza visiva** e la **professionalità** dell''interfaccia.

### Soluzione

Applicato lo **stile badge delle Feature** a tutte le sezioni header, creando uniformità completa.

### Implementazione

**Stile badge unificato:**
```tsx
{total > 0 && (
  <span
    className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold"
    style={{
      backgroundColor: `${color}20`,  // 20% opacity sfondo
      color: color,                    // Colore sezione
      border: `1px solid ${color}40`,  // 40% opacity bordo
    }}
  >
    {total}
  </span>
)}
```

**Componenti modificati:**

1. **NRTRow.tsx** (righe 69-80)
   - Prima: `text-sm font-mono font-semibold` semplice
   - Dopo: Badge con sfondo viola 20%, bordo viola 40%

2. **KTLORow.tsx** (righe 58-70)
   - Prima: `text-sm font-mono font-semibold` semplice
   - Dopo: Badge con sfondo arancio 20%, bordo arancio 40%
   - Extra: Decimali solo se necessari `{total % 1 === 0 ? total : total.toFixed(2)}`

3. **GlobalTimeOffRow.tsx** (righe 55-67)
   - Prima: `text-sm font-mono font-semibold` semplice
   - Dopo: Badge con sfondo blu 20%, bordo blu 40%

4. **CapacityRecapRow.tsx** (righe 147-159)
   - Prima: `text-sm font-mono font-semibold` semplice
   - Dopo: Badge con sfondo viola 20%, bordo viola 40%
   - Mantiene: `.toFixed(2)` per precisione decimali

### Caratteristiche Badge

**Design tokens applicati:**
- Padding: `px-1.5 py-0.5` (6px × 2px)
- Border radius: `rounded` (4px)
- Font: `text-xs font-mono font-bold` (12px monospace bold)
- Background: `${color}20` (20% opacity colore sezione)
- Border: `1px solid ${color}40` (40% opacity colore sezione)

**Varianti colore per sezione:**
- 🟦 Feature: Colore dinamico feature (es. blu, verde, rosso)
- 🟪 NRT: Viola (`#8b5cf6`)
- 🟧 KTLO: Arancio (`#f59e0b`)
- 🟦 Ferie: Blu (`#3b82f6`)
- 🟪 Riepilogo: Viola (`#8b5cf6`)

### Prima vs Dopo

**Prima (v1.8.9):**
```
Feature         │ 12 │ 15 │ 18 │  ← Badge colorato
NRT             │ 4  │ 2  │ 0  │  ← Solo testo
KTLO            │ 9  │ 9  │ 9  │  ← Solo testo
Ferie           │ 2  │ 5  │ 1  │  ← Solo testo
Riepilogo       │ 27 │ 31 │ 28 │  ← Solo testo
```

**Dopo (v1.9.0):**
```
Feature         │ [12] │ [15] │ [18] │  ← Badge colorato
NRT             │ [4]  │ [2]  │ [0]  │  ← Badge colorato ✅
KTLO            │ [9]  │ [9]  │ [9]  │  ← Badge colorato ✅
Ferie           │ [2]  │ [5]  │ [1]  │  ← Badge colorato ✅
Riepilogo       │ [27] │ [31] │ [28] │  ← Badge colorato ✅
```

*Nota: `[...]` rappresenta il badge con sfondo, bordo e colore*

### Benefici UX

- 🎨 **Coerenza visiva**: Tutte le sezioni hanno stesso stile
- 🎯 **Gerarchia chiara**: Badge evidenziano i totali importanti
- 📊 **Scannabilità**: Più facile individuare totali a colpo d''occhio
- 🏆 **Professionalità**: Interface più curata e raffinata
- ♿ **Accessibilità**: Migliore contrasto visivo con badge evidenziati
- 🎨 **Identità sezione**: Colore badge identifica sezione (viola NRT, arancio KTLO, etc.)

### Dettagli Tecnici

**Classi CSS unificate:**
```css
inline-block     /* Display inline con dimensioni controllate */
px-1.5 py-0.5    /* Padding 6px orizzontale, 2px verticale */
rounded          /* Border radius 4px */
text-xs          /* Font size 12px */
font-mono        /* Font monospaced (JetBrains Mono) */
font-bold        /* Font weight 700 */
```

**Stili inline dinamici:**
```javascript
backgroundColor: `${color}20`      // 20% opacity del colore sezione
color: color                        // Colore pieno sezione
border: `1px solid ${color}40`      // Bordo 40% opacity
```

### Impatto Visivo

**Accessibilità contrasto:**
- Sfondo 20% + testo 100% = contrasto WCAG AA ✅
- Bordo 40% delimita badge da sfondo bianco ✅

**Consistenza Material Design:**
- Elevation via bordo sottile (non shadow)
- Semantic color tokens per sezioni
- Tipografia monospace per dati numerici

### File Modificati

1. `src/components/timeline/NRTRow.tsx` → Badge viola NRT
2. `src/components/timeline/KTLORow.tsx` → Badge arancio KTLO
3. `src/components/timeline/GlobalTimeOffRow.tsx` → Badge blu Ferie
4. `src/components/timeline/CapacityRecapRow.tsx` → Badge viola Riepilogo

### Versioning

**v1.9.0** (MINOR) perché:
- ✅ Miglioramento visivo significativo
- ✅ Cambiamento estetico su tutti i componenti principali
- ✅ Migliora user experience senza breaking changes
- ✅ Retrocompatibile (nessuna modifica dati/API)',
  '2026-05-06'
);

SELECT version, title FROM changelog WHERE version = '1.9.0';
