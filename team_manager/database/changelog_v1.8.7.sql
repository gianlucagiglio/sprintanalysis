-- v1.8.7 - Full Row Hover Effect Fix
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.7',
  'patch',
  'Fix Hover Riga Completa con Group Hover',
  '## 🐛 Bug Fix - Hover Esteso a Tutta la Riga

### Problema

L''effetto hover sulla timeline non copriva tutta la riga:
- ✅ Funzionava sulla colonna sticky sinistra (nomi membri)
- ❌ NON funzionava sulle celle scrollabili a destra
- Quando scrollavi orizzontalmente, l''hover spariva

### Causa

Il `hover:bg-[var(--bg-hover)]` era applicato solo al wrapper flex esterno, ma non si propagava ai div figli (colonna sticky + celle).

### Soluzione

Implementato **Tailwind Group Hover** per propagare l''effetto:

```tsx
// Prima
<div className="flex hover:bg-[var(--bg-hover)]">
  <div className="timeline-sticky-col bg-[...]">Nome</div>
  <div className="flex">Celle</div>  {/* ❌ Nessun hover */}
</div>

// Dopo
<div className="group flex">
  <div className="timeline-sticky-col group-hover:bg-[var(--bg-hover)]">Nome</div>
  <div className="flex group-hover:bg-[var(--bg-hover)]">Celle</div>  {/* ✅ Hover propagato */}
</div>
```

### Componenti Aggiornati (10)

**Righe Membri (5):**
- ✅ `MemberRow.tsx` (allocazioni feature)
- ✅ `MemberNRTRow.tsx` (NRT per membro)
- ✅ `MemberKTLORow.tsx` (KTLO per membro)
- ✅ `MemberTimeOffRow.tsx` (Ferie per membro)
- ✅ `CapacityRecapRow.tsx` (Riepilogo per membro)

**Righe Header Sezioni (5):**
- ✅ `FeatureGroup.tsx` (header feature con nome/edit/delete)
- ✅ `NRTRow.tsx` (header sezione NRT con totale)
- ✅ `KTLORow.tsx` (header sezione KTLO con totale)
- ✅ `GlobalTimeOffRow.tsx` (header sezione Ferie con totale)
- ✅ `CapacityRecapRow.tsx` (header Riepilogo Capacità)

### Risultato

**Ora l''hover funziona su tutta la riga:**
- ✅ Colonna sticky (sinistra): hover attivo
- ✅ Celle scrollabili (destra): hover attivo
- ✅ Coerenza visiva anche dopo scroll orizzontale
- ✅ Transizione fluida su tutta la superficie

### Dettagli Tecnici

**Pattern Group Hover:**
1. Wrapper: `group flex` (definisce il gruppo)
2. Colonna sticky: `group-hover:bg-[var(--bg-hover)]` (reagisce all''hover del gruppo)
3. Celle: `group-hover:bg-[var(--bg-hover)]` (reagisce all''hover del gruppo)
4. Transition: `transition-colors` per animazione fluida

### Fix Tooltip Multipli

**Problema**: Con il group hover, tutti i tooltip di una riga si attivavano contemporaneamente.

**Causa**: Conflitto tra `group` della riga e `group` delle celle in CapacityRecapRow.

**Soluzione Doppia**:

1. **Isolamento eventi mouse** (MemberRow, NRT, KTLO, TimeOff):
```tsx
<div className="flex group-hover:bg-[...] pointer-events-none">
  <div className="border-r pointer-events-auto">
    <AllocationCell />  {/* Interattivo ✅ */}
    <CapacityTooltip /> {/* Si attiva solo su hover diretto ✅ */}
  </div>
</div>
```

2. **Named Groups Tailwind** (CapacityRecapRow):
```tsx
<div className="group/row flex">                    {/* Group riga */}
  <div className="group-hover/row:bg-[...]">       {/* Hover riga */}
    <div className="group/cell">                    {/* Group cella */}
      <div className="group-hover/cell:block">     {/* Tooltip cella ✅ */}
        Tooltip
      </div>
    </div>
  </div>
</div>
```

### Benefici UX

- 🎯 **Feedback visivo chiaro**: Hover uniforme su tutta la riga
- 🎯 **Consistenza**: Comportamento identico in tutte le sezioni
- 🎯 **Scroll-safe**: Effetto mantiene funzionalità anche scrollando orizzontalmente
- 🎯 **Tooltip precisi**: Solo il tooltip della cella hovere si attiva
- 🎯 **Accessibilità**: Indicatore visivo più evidente per utenti mouse',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.7';
