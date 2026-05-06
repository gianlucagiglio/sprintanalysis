-- v1.7.5 - Timeline Visual Enhancement Sprint
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.5',
  'minor',
  'Potenziamento Grafico Timeline',
  '## 🎨 Timeline Header Premium

- **Elevazione visiva**: Shadow e gradients per maggiore profondità
- **Sprint badges**: Badge colorati con bordo e shadow per i nomi sprint
- **Settimana corrente**: Indicatore pulse animato + bordi 3px + gradient background
- **Sticky header**: Shadow persistente per migliore separazione visiva

## 📊 Feature Groups Redesign

- **Depth & Contrast**: Gradients from-to su header feature + shadow dinamica
- **Tipo feature**: Emoji indicator (🎯 Strategica / 🔧 Small Change) con badge label
- **Totali colorati**: Badge con background matching il colore feature + bordo + shadow
- **Hover states**: Transizioni smooth su tutti gli elementi interattivi
- **Altezza aumentata**: Header 44px per migliore leggibilità

## 👥 Member Rows Enhanced

- **Bullet colorati**: Pallino colorato per ruolo con shadow ring animato
- **Group hover**: Transizioni coordinate su tutta la riga (background + bullet scale)
- **Celle premium**: Gradients su settimana corrente (from-to) + bordi 3px
- **Altezza celle**: 36px per maggiore comfort visivo

## ⚡ Allocation Cells Micro-Interactions

- **Editing mode**: Gradient animato + pulse + ring + border 2px
- **Over capacity**: Gradient red con bordo + shadow
- **Hover effects**: Scale 110% + font-bold + shadow + color accent
- **Empty state**: Indicator "+" opacity animato su hover
- **Saving state**: Spinner più grande e visibile

## 🔧 Sezioni Speciali (NRT, KTLO, Ferie)

- **Icone semantiche**: FlaskConical (NRT), Wrench (KTLO), Palmtree (Ferie)
- **Icon badges**: Background colorato + bordo + shadow per ogni icona
- **Separatori marcati**: Border-top 3px + box-shadow colorata
- **Gradients header**: Linear gradient 135deg per profondità
- **Spacing migliorato**: mt-4 tra sezioni per migliore respirabilità
- **Label badges**: Badge inline per info extra (~15% KTLO, QA/QAA NRT)

## 📈 Capacity Recap Premium

- **BarChart icon**: Icona dedicata con background + shadow
- **Overview badge**: Label "OVERVIEW" per distinguere sezione
- **Shadow aumentata**: Box-shadow 12px per maggiore prominenza
- **Border superiore**: 2px per evidenziare inizio sezione

## 🎯 Benefici UX

- Gerarchia visiva chiara e intuitiva
- Feedback visivo immediato su ogni interazione
- Profondità e dimensionalità attraverso shadow e gradients
- Animazioni fluide e naturali (150-200ms)
- Migliore distinguibilità tra sezioni e stati
- Accessibilità mantenuta con ARIA labels
- Design premium e professionale',
  '2026-04-26'
);

-- Verifica inserimento
SELECT version, title, release_date
FROM changelog
WHERE version = '1.7.5';
