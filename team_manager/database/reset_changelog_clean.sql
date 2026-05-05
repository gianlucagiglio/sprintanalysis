-- ============================================
-- RESET COMPLETO CHANGELOG
-- Cancella tutto e reinserisce le versioni pulite
-- ============================================

-- STEP 1: Cancella tutto
TRUNCATE TABLE changelog RESTART IDENTITY CASCADE;

-- STEP 2: Inserisci tutte le versioni in ordine

-- v1.0.0 - Release iniziale
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.0.0', 'major', 'Release iniziale Team Resource Manager',
'## Funzionalità principali

- Gestione team members con ruoli e capacità settimanale
- Creazione e gestione sprint
- Timeline settimanale con allocazioni per feature
- Gestione ferie e assenze (Time Off)
- Sistema KTLO (Keep The Lights On) con default 1.5 giorni
- Visualizzazione capacità con alert su sovraccarico

## Stack tecnologico

- React 18 + TypeScript + Vite
- Tailwind CSS per styling
- Supabase (PostgreSQL) per database
- Zustand per state management
- date-fns per gestione date',
'2025-01-15');

-- v1.1.0 - Feature members
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.1.0', 'minor', 'Assegnazione membri alle feature',
'## Nuove funzionalità

- Aggiunta tabella feature_members per assegnare membri specifici a ogni feature
- Nella timeline vengono mostrati solo i membri assegnati alla feature
- Assegnazione automatica di tutti i membri quando si crea una nuova feature',
'2025-02-01');

-- v1.2.0 - Feature types
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.2.0', 'minor', 'Tipologie feature: Strategica e Small Change',
'## Nuove funzionalità

- Aggiunto campo "type" alle feature (strategic / small_change)
- Filtri nella timeline per visualizzare solo feature strategiche o small change
- Badge visivi per distinguere le tipologie',
'2025-02-10');

-- v1.3.0 - Decimal precision
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.3.0', 'minor', 'Precisione decimale 0.01 per allocazioni',
'## Miglioramenti

- Aumentata precisione a 2 decimali (0.01) per tutte le allocazioni
- Possibile inserire valori come 0.11, 0.12, 0.13, ecc.
- Aggiornati tutti i campi: allocations, time_offs, ktlo_allocations, nrt_allocations',
'2025-02-15');

-- v1.4.0 - Current week highlight
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.4.0', 'minor', 'Evidenziazione settimana corrente',
'## Nuove funzionalità

- La settimana corrente viene evidenziata automaticamente in tutte le viste
- Bordi colorati e sfondo distintivo per identificare il "today"
- Funziona su Timeline, Gantt e tutte le viste settimanali',
'2025-02-20');

-- v1.5.0 - NRT section
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.5.0', 'minor', 'Sezione NRT per QA/QAA',
'## Nuove funzionalità

- Nuova sezione NRT (Non-Regression Testing) dedicata ai membri QA e QAA
- Default 2 giorni sulla prima settimana di ogni sprint
- Colore distintivo purple (#9333ea)
- Posizionata tra Feature e KTLO',
'2025-03-01');

-- v1.6.0 - Capacity recap & Gantt view
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.6.0', 'minor', 'Riepilogo Capacità e Vista Gantt',
'## Nuove funzionalità

- **Riepilogo Capacità**: Accordion in cima alla timeline con quick view allocazioni totali per persona
- Colori green (≤ capacità) e red (> capacità)
- Tooltip con breakdown dettagliato (Feature, KTLO, NRT, Ferie)
- **Vista Gantt**: Nuova pagina con visualizzazione gantt delle feature
- Intensità colore basata su allocazione (più scuro = più giorni)
- Breakdown per ruoli professionali',
'2025-04-01');

-- v1.7.0 - Personalizzazione colori
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.7.0', 'minor', 'Personalizzazione colori sezioni Timeline',
'## Nuove funzionalità

- **Customizzazione colori sezioni**: Aggiunta possibilità di personalizzare i colori delle sezioni NRT, KTLO, Ferie & Assenze, e Riepilogo Capacità nella Timeline
- Nuovo modal "Impostazioni Colori" accessibile dalla sidebar con ColorPicker per ogni sezione
- Colori persistenti in database con tabella `settings` (singleton)
- Aggiornamento dinamico dei colori in tutte le viste senza refresh

## Modifiche tecniche

- Creata tabella `settings` con campi: nrt_color, ktlo_color, timeoff_color, capacity_color
- Implementato hook `useSettings()` per fetch/update colori con fallback ai default
- Componente `SettingsModal` con gestione ColorPicker e reset valori default',
'2025-04-26');

-- v1.7.1 - Ordinamento features
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.7.1', 'patch', 'Ordinamento manuale features nella Timeline',
'## Miglioramenti

- **Ordinamento features**: Aggiunto campo "Ordine Visualizzazione" nella creazione/modifica feature
- Le feature nella timeline vengono ora ordinate in base al numero d''ordine impostato
- Ordinamento predefinito in base alla data di creazione (cronologico)
- Possibilità di riordinare le feature impostando numeri diversi (0 = prima, valori più alti = dopo)

## Modifiche tecniche

- Aggiunto campo `display_order` INTEGER nella tabella `features`
- Migrazione automatica che imposta ordine cronologico per le feature esistenti
- Aggiornato `FeatureForm` con input numerico per l''ordinamento
- Modificato `useSprints` per ordinare per `display_order` ASC, poi per `name` ASC',
'2025-04-26');

-- v1.7.2 - Auto-incremento ordinamento
INSERT INTO changelog (version, type, title, description, release_date) VALUES
('1.7.2', 'patch', 'Auto-incremento ordinamento features',
'## Miglioramenti

- **Auto-incremento intelligente**: Quando assegni un ordine già esistente a una feature, le altre vengono spostate automaticamente
- Nessuna sovrapposizione di ordini: il sistema gestisce automaticamente i conflitti
- Aggiornamento dall''alto verso il basso per evitare conflitti temporanei
- Tutte le feature successive vengono incrementate mantenendo ordini univoci

## Comportamento

**Esempio:**
- Feature A: order 2, Feature B: order 3, Feature C: order 4
- Inserisco Feature D con order 2
- Sistema aggiorna: C→5, B→4, A→3 (dall''alto verso il basso)
- Risultato: D=2, A=3, B=4, C=5 (tutti univoci)

## Modifiche tecniche

- Aggiunta funzione helper `shiftDisplayOrders` con ordinamento decrescente
- Modificato `createFeature` e `updateFeature` per spostare automaticamente le feature esistenti',
'2025-04-26');

-- Verifica finale
SELECT version, type, title, release_date
FROM changelog
ORDER BY
  CASE
    WHEN version ~ '^\d+\.\d+\.\d+$' THEN
      CAST(split_part(version, '.', 1) AS INTEGER) * 10000 +
      CAST(split_part(version, '.', 2) AS INTEGER) * 100 +
      CAST(split_part(version, '.', 3) AS INTEGER)
    ELSE 0
  END DESC;

-- ============================================
-- Fine reset - Changelog pulito!
-- ============================================
