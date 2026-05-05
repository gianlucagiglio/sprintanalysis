-- Inserimento TUTTE le versioni 1.7.x insieme
-- Esegui questo se vedi solo v1.7.0

-- Rimuovi eventuali duplicati
DELETE FROM changelog WHERE version IN ('1.7.0', '1.7.1', '1.7.2');

-- v1.7.0 - Personalizzazione colori sezioni
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.0',
  'minor',
  'Personalizzazione colori sezioni Timeline',
  '## Nuove funzionalità

- **Customizzazione colori sezioni**: Aggiunta possibilità di personalizzare i colori delle sezioni NRT, KTLO, Ferie & Assenze, e Riepilogo Capacità nella Timeline
- Nuovo modal "Impostazioni Colori" accessibile dalla sidebar con ColorPicker per ogni sezione
- Colori persistenti in database con tabella `settings` (singleton)
- Aggiornamento dinamico dei colori in tutte le viste senza refresh',
  '2025-04-26'
);

-- v1.7.1 - Ordinamento manuale features
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.1',
  'patch',
  'Ordinamento manuale features nella Timeline',
  '## Miglioramenti

- **Ordinamento features**: Aggiunto campo "Ordine Visualizzazione" nella creazione/modifica feature
- Le feature nella timeline vengono ora ordinate in base al numero d''ordine impostato
- Ordinamento predefinito in base alla data di creazione (cronologico)
- Possibilità di riordinare le feature impostando numeri diversi (0 = prima, valori più alti = dopo)',
  '2025-04-26'
);

-- v1.7.2 - Auto-incremento ordinamento features
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.2',
  'patch',
  'Auto-incremento ordinamento features',
  '## Miglioramenti

- **Auto-incremento intelligente**: Quando assegni un ordine già esistente a una feature, le altre vengono spostate automaticamente
- Nessuna sovrapposizione di ordini: il sistema gestisce automaticamente i conflitti
- Aggiornamento dall''alto verso il basso per evitare conflitti temporanei
- Tutte le feature successive vengono incrementate mantenendo ordini univoci',
  '2025-04-26'
);

-- Verifica inserimento
SELECT version, title, release_date
FROM changelog
WHERE version LIKE '1.7.%'
ORDER BY version DESC;
