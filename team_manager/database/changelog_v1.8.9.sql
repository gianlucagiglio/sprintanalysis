-- v1.8.9 - Add Totals to Capacity Recap Header
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.9',
  'patch',
  'Totali Settimanali su Header Riepilogo Capacità',
  '## 📊 Completamento Riepilogo - Totali Header

### Problema

La riga header di "Riepilogo Capacità" non mostrava i totali per settimana, a differenza delle altre sezioni (Feature, NRT, KTLO, Ferie).

### Soluzione

Aggiunto calcolo e visualizzazione dei totali settimanali nella riga header.

### Implementazione

**Nuova funzione `getWeekTotal`:**
```typescript
const getWeekTotal = (weekStart: string): number => {
  return sortedMembers.reduce((sum, member) => {
    const breakdown = getWeekBreakdown(member, weekStart)
    return sum + breakdown.total
  }, 0)
}
```

**Visualizzazione header:**
```tsx
{weeks.map((week) => {
  const total = getWeekTotal(week.weekStart)
  return (
    <div className="... flex items-center justify-center">
      {total > 0 && (
        <span className="text-sm font-mono font-semibold">
          {total.toFixed(2)}
        </span>
      )}
    </div>
  )
})}
```

### Cosa Calcola

Il totale per settimana include la **somma di tutti i membri**:
- Feature (allocazioni)
- KTLO (default 1.5 per membro)
- NRT (QA/QAA, 2 giorni su prima settimana sprint)
- Ferie/Assenze

### Risultato

```
Riepilogo Capacità
│ Sett 1 │ Sett 2 │ Sett 3 │
│ 42.50  │ 38.00  │ 45.25  │  ← Totali ora visibili ✅
└────────┴────────┴────────┘
  Mario     ...     ...        ← Breakdown per membro
  Luigi     ...     ...
```

### Coerenza

Ora **tutte** le sezioni header mostrano totali:
- ✅ Feature - somma allocazioni
- ✅ NRT - somma giorni NRT
- ✅ KTLO - somma giorni KTLO
- ✅ Ferie - somma giorni ferie
- ✅ **Riepilogo Capacità** - somma totale generale ← Fix

### Benefici

- 📊 **Vista immediata**: Capacità totale team per settimana
- 📊 **Coerenza**: Tutte le sezioni hanno stesso formato
- 📊 **Planning**: Facile identificare settimane sovraccariche
- 📊 **Precision**: Formato `.toFixed(2)` per decimali accurati',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.9';
