-- v1.8.2 - Timeline Consistency Improvements
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.2',
  'patch',
  'Miglioramenti Coerenza Timeline',
  '## 🎯 Uniformità Visiva

### Feature Names Standardizzati

- **Rimosso Badge component** dai nomi feature
- Ora solo testo colorato come NRT/KTLO/Ferie
- Formato uniforme in tutta la timeline
- Chevron colorato per matching visivo

### Ordinamento Membri Coerente

Applicato stesso pattern di ordinamento (PA → PD → BE → FE → QA → QAA) a tutte le sezioni:

- ✅ **Capacity Recap**: membri ordinati per ruolo
- ✅ **Feature Groups**: membri ordinati per ruolo
- ✅ **NRT Section**: QA/QAA ordinati (QA prima di QAA)
- ✅ **KTLO Section**: membri ordinati per ruolo
- ✅ **Ferie Section** (Timeline): membri ordinati per ruolo
- ✅ **TimeOff View**: membri ordinati per ruolo

## 🎨 Benefici

- Coerenza visiva totale
- Navigazione intuitiva (stesso ordine ovunque)
- Prevedibilità per l''utente
- Design pulito e professionale

## 🔧 Dettagli Tecnici

- RoleOrder: `{ PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }`
- Sorting applicato a tutti i componenti timeline
- Feature header: text-sm font-bold con color inline
- Chevron con opacity-70 hover invece di color change',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.2';
