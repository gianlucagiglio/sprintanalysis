-- v1.8.0 - Timeline Visual Redesign (Clean & Professional)
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.0',
  'major',
  'Redesign Grafico Timeline - Clean & Professional',
  '## 🎨 Redesign Completo Timeline

Rework grafico completo della griglia timeline con focus su pulizia, professionalità e coerenza visiva.

## ✨ Principi del Redesign

- **Meno è meglio**: Rimossi gradients eccessivi, shadow pesanti, effetti sovrapposti
- **CSS-first**: Spostata logica styling da inline styles a classi CSS riutilizzabili
- **Coerenza**: Design system unificato per tutte le sezioni
- **Performance**: Ridotto DOM painting con meno proprietà animate

## 🔄 Modifiche Principali

### Header Timeline
- Shadow leggera e pulita
- Sprint badges con opacità 85%
- Settimana corrente con bordi 2px
- Rimossi gradients e animations

### Feature Groups
- Background flat invece di gradients
- Totali con badge minimal
- Altezza 36px standard

### Member Rows
- Bullet 1.5px delicato
- Celle 32px standard
- Hover pulito

### Allocation Cells
- Editing mode semplice
- Saving state text-only
- Rimossi animations

### Sezioni Speciali
- Design unificato
- Header 10% opacity
- Border-top 2px
- Icone senza decorazioni

## 📐 CSS Design Tokens

Classi riutilizzabili timeline-* aggiunte

## 🎯 Benefici

- Manutenibilità migliorata
- Performance ottimizzata
- Coerenza visiva
- Codice più pulito',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.0';
