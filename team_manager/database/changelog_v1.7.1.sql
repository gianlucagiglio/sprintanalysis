-- Changelog Entry: v1.7.1 - Ordinamento manuale features
-- Data rilascio: 2025-04-26

DELETE FROM changelog WHERE version = '1.7.1';

INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.1',
  'patch',
  'Ordinamento manuale features nella Timeline',
  '## Miglioramenti

- **Ordinamento features**: Aggiunto campo "Ordine Visualizzazione" nella creazione/modifica feature
- Le feature nella timeline vengono ora ordinate in base al numero d''ordine impostato
- Ordinamento predefinito in base alla data di creazione (cronologico)
- Possibilità di riordinare le feature impostando numeri diversi (0 = prima, valori più alti = dopo)

## Modifiche tecniche

- Aggiunto campo `display_order` INTEGER nella tabella `features`
- Migrazione automatica che imposta ordine cronologico per le feature esistenti
- Aggiornato `FeatureForm` con input numerico per l''ordinamento
- Modificato `useSprints` per ordinare per `display_order` ASC, poi per `name` ASC
- Creato indice `idx_features_display_order` per performance

## Database

- Migration `migration_add_feature_order.sql` con colonna display_order
- Popolazione automatica valori default in base a created_at
- Indice per ottimizzare query di ordinamento',
  '2025-04-26'
);

SELECT * FROM changelog ORDER BY release_date DESC, version DESC LIMIT 3;
