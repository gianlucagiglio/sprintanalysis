-- v1.8.6 - Role Badge Alignment Right
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.6',
  'patch',
  'Allineamento Ruolo a Destra nella Timeline',
  '## 🎨 Miglioramento Layout Membri

### Problema

Nella colonna membri della timeline, il ruolo (badge) appariva subito dopo il nome, creando affollamento visivo.

### Soluzione

Allineato il badge ruolo a destra nella cella, separandolo dal nome:

```
Prima:  [●] Nome Membro [PA]
Dopo:   [●] Nome Membro                [PA]
         ↑ sinistra                   ↑ destra
```

### Componenti modificati

Applicato a **tutti** i MemberRow della timeline:
- ✅ `MemberRow.tsx` (allocazioni feature)
- ✅ `MemberNRTRow.tsx` (Non-Regression Testing)
- ✅ `MemberKTLORow.tsx` (Keep The Lights On)
- ✅ `MemberTimeOffRow.tsx` (Ferie & Assenze)

### Dettagli Tecnici

**Layout flex con justify-between:**
```tsx
// Prima
<div className="flex items-center gap-2.5">
  <div className="dot" />
  <span>{member.name}</span>
  <Badge label={role} />  {/* Subito dopo il nome */}
</div>

// Dopo
<div className="flex items-center justify-between gap-2.5">
  <div className="flex items-center gap-2.5">
    <div className="dot" />
    <span>{member.name}</span>
  </div>
  <Badge label={role} />  {/* Allineato a destra */}
</div>
```

### Benefici UX

- ✅ **Leggibilità migliorata**: Nome e ruolo visivamente separati
- ✅ **Scannabilità**: Colonna nomi più pulita e facile da scansionare
- ✅ **Gerarchia visiva**: Nome primario (sinistra), ruolo secondario (destra)
- ✅ **Respiro**: Più spazio bianco tra elementi, meno cramping
- ✅ **Coerenza**: Stesso pattern in tutte le sezioni (Feature, NRT, KTLO, Ferie)',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.6';
