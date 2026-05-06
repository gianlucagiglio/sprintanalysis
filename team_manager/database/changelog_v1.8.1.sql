-- v1.8.1 - Features & TimeOff Visual Redesign
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.1',
  'minor',
  'Redesign Features e TimeOff - Coerenza Visiva',
  '## 🎨 Estensione Redesign Pulito

Applicato lo stesso design system pulito e professionale alle sezioni Features e TimeOff.

## Features View

- Header standardizzato (text-2xl, spacing ridotto)
- Bottone btn-primary con gap-2 e icona 18px
- EmptyState per stato vuoto
- Card feature con hover border-secondary
- Member badges minimal (bg-tertiary, text-xs)
- Icone bottoni 16px (da 18px)
- Type badge con bg-tertiary

## FeatureList

- Card con classe .card standard
- Hover sottile (border-secondary)
- Badge membri ridotti e puliti
- Bullet 1.5px per ruoli
- Spacing ottimizzato

## MemberAssignForm

- Checkbox 20x20px (w-5 h-5)
- Min-height 44px sui label
- Bottoni btn-primary/btn-secondary
- Layout pulito e leggibile

## TimeOffView

- Timeline header con classi riutilizzabili
- Settimana corrente con .timeline-week-current
- Bullet colorati per ruolo
- Celle 32px standard
- EmptyState per stati vuoti
- Grid con width calcolato dinamico

## TimeOffCell

- Stesso stile AllocationCell
- Editing mode con bg-warning subtle
- Hover pulito
- Transizioni essenziali

## Benefici

- Coerenza visiva tra tutte le sezioni
- Design system unificato
- Manutenibilità migliorata
- Performance ottimizzata',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.1';
