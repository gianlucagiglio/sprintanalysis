-- Changelog Entry: v1.7.2 - Auto-incremento ordinamento features
-- Data rilascio: 2025-04-26

DELETE FROM changelog WHERE version = '1.7.2';

INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.2',
  'patch',
  'Auto-incremento ordinamento features',
  '## Miglioramenti

- **Auto-incremento intelligente**: Quando assegni un ordine già esistente a una feature, le altre vengono spostate automaticamente
- Nessuna sovrapposizione di ordini: il sistema gestisce automaticamente i conflitti
- Esempio: se assegni ordine 2 a una feature, quella che aveva 2 diventa 3, quella con 3 diventa 4, ecc.

## Modifiche tecniche

- Aggiunta funzione helper `shiftDisplayOrders` in `useSprints`
- Modificato `createFeature` per spostare automaticamente le feature esistenti prima di inserire
- Modificato `updateFeature` per spostare automaticamente le feature esistenti prima di aggiornare
- Incremento automatico di tutte le feature con `display_order >= valore_target`

## Comportamento

**Scenario 1 - Nuova feature:**
- Feature A: order 1
- Feature B: order 2
- Feature C: order 3
- **Creo Feature D con order 2**
- Risultato: A=1, D=2, B=3, C=4

**Scenario 2 - Modifica feature:**
- Feature A: order 1
- Feature B: order 2
- Feature C: order 3
- **Modifico C da 3 a 1**
- Risultato: C=1, A=2, B=3',
  '2025-04-26'
);

SELECT * FROM changelog ORDER BY release_date DESC, version DESC LIMIT 3;
