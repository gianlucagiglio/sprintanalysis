-- Inserimento Changelog v1.7.0 (VERSIONE CORRETTA)
-- Esegui questo su Supabase SQL Editor

-- Prima elimina se esiste già (per evitare duplicati)
DELETE FROM changelog WHERE version = '1.7.0';

-- Poi inserisci la versione corretta
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.0',
  'minor',
  'Personalizzazione colori sezioni Timeline',
  '## Nuove funzionalità

- **Customizzazione colori sezioni**: Aggiunta possibilità di personalizzare i colori delle sezioni NRT, KTLO, Ferie & Assenze, e Riepilogo Capacità nella Timeline
- Nuovo modal "Impostazioni Colori" accessibile dalla sidebar con ColorPicker per ogni sezione
- Colori persistenti in database con tabella `settings` (singleton)
- Aggiornamento dinamico dei colori in tutte le viste senza refresh

## Modifiche tecniche

- Creata tabella `settings` con campi: `nrt_color`, `ktlo_color`, `timeoff_color`, `capacity_color`
- Implementato hook `useSettings()` per fetch/update colori con fallback ai default
- Componente `SettingsModal` con gestione ColorPicker e reset valori default
- Aggiornati componenti timeline per usare colori dinamici da props invece di valori hardcoded:
  - `NRTRow` e `MemberNRTRow`
  - `KTLORow` e `MemberKTLORow`
  - `GlobalTimeOffRow` e `MemberTimeOffRow`
  - `CapacityRecapRow`
- Colori default: NRT (#9333ea purple), KTLO (#3b82f6 blue), Ferie (#f59e0b orange), Capacity (#3b82f6 blue)

## Database

- Migration `migration_add_settings.sql` con tabella settings e policies RLS
- Inserimento automatico riga default con colori standard
- Constraint singleton per garantire una sola riga di configurazione',
  '2025-04-26'
);

-- Verifica che sia stato inserito
SELECT * FROM changelog ORDER BY release_date DESC LIMIT 5;
