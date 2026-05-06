-- v1.8.8 - Remove Hover from Header Rows
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.8',
  'patch',
  'Hover Solo su Righe Membri, Non su Header',
  '## 🎨 Raffinamento UX - Hover Selettivo

### Modifica

Rimosso effetto hover dalle righe header/titolo, mantenendolo solo sulle righe membri interattive.

### Righe Senza Hover (5)

**Header che NON hanno più hover:**
- ✅ `FeatureGroup` - riga titolo feature (con edit/delete)
- ✅ `NRTRow` - riga header NRT con totale
- ✅ `KTLORow` - riga header KTLO con totale
- ✅ `GlobalTimeOffRow` - riga header Ferie con totale
- ✅ `CapacityRecapRow` - riga header Riepilogo Capacità

### Righe Con Hover (5)

**Righe membri che MANTENGONO hover:**
- ✅ `MemberRow` - righe membri sotto feature
- ✅ `MemberNRTRow` - righe QA sotto NRT
- ✅ `MemberKTLORow` - righe membri sotto KTLO
- ✅ `MemberTimeOffRow` - righe membri sotto Ferie
- ✅ `CapacityRecapRow` (membri) - righe breakdown sotto riepilogo

### Razionale

**Header sono statici e informazionali:**
- Non contengono celle editabili
- Mostrano solo totali aggregati
- Hover non aggiunge valore UX

**Righe membri sono interattive:**
- Contengono AllocationCell editabili
- Hanno tooltip con breakdown dettagliato
- Hover indica interattività

### Dettagli Tecnici

Rimosso da header:
```tsx
// Prima
<div className="group flex">
  <div className="group-hover:bg-[var(--bg-hover)]">
    Header content
  </div>
</div>

// Dopo
<div className="flex">
  <div className="bg-[var(--bg-secondary)]">
    Header content
  </div>
</div>
```

### Benefici UX

- 🎯 **Feedback mirato**: Hover solo dove è interattivo
- 🎯 **Chiarezza visiva**: Distinzione header vs contenuto
- 🎯 **Ridotto rumore**: Meno effetti visivi superflui
- 🎯 **Affordance corretta**: Indica cosa è cliccabile',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.8';
