-- v1.8.4 - Timeline Sticky Column Width + Feature Name Truncate
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.8.4',
  'patch',
  'Larghezza Colonna Timeline + Truncate Feature',
  '## 🎨 Ottimizzazione Layout Timeline

### Colonna Sticky Più Ampia

Aumentata larghezza della colonna sticky da 220px a 300px per migliore leggibilità:

- **Prima**: 220px (stringente per nomi lunghi)
- **Dopo**: 300px (più spazio per contenuti)
- **Beneficio**: Riduzione cramping visivo, più respiro grafico

### Truncate Intelligente per Feature

Implementato truncate con ellipsis per nomi feature lunghi:

- **Overflow gestito**: `text-overflow: ellipsis`
- **No word wrap**: `white-space: nowrap`
- **Tooltip on-hover**: Nome completo visibile con `title` attribute
- **Cursor help**: Indicatore visivo `cursor: help`

### Benefici UX

- **Coerenza grafica**: Layout uniforme anche con nomi di lunghezza variabile
- **Leggibilità**: Più spazio disponibile per tutti i contenuti della colonna
- **Informazione accessibile**: Nome completo sempre disponibile on-hover
- **Layout stabile**: Nessun breaking visivo con nomi lunghi

### Dettagli Tecnici

```css
.timeline-sticky-col {
  width: 300px;
  min-width: 300px;
  max-width: 300px;
}

.timeline-text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}
```

```tsx
<div className="text-sm font-bold timeline-text-truncate"
     style={{ color: feature.color }}
     title={feature.name}>
  {feature.name}
</div>
```',
  '2026-04-26'
);

SELECT version, title FROM changelog WHERE version = '1.8.4';
