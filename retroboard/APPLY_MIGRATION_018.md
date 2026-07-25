# Applicare Migration 018 - Fix Team Delete

## Problema Risolto
La funzione "elimina team" non funzionava perché mancavano i constraint CASCADE sui foreign key.

## Soluzione
Migration 018 aggiunge:
- `ON DELETE CASCADE` per `team_members.team_id` → quando elimini un team, elimina anche tutti i membri
- `ON DELETE SET NULL` per `sessions.team_id` → quando elimini un team, le sessioni perdono il riferimento al team ma non vengono eliminate

## Come Applicare

### Opzione 1: Supabase Dashboard (Consigliata)
1. Vai su https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Vai su SQL Editor
3. Copia e incolla il contenuto di `supabase/migrations/018_fix_team_delete_cascade.sql`
4. Esegui la query

### Opzione 2: Supabase CLI
```bash
npx supabase db push
```

### Verifica
Dopo aver applicato la migration, prova a:
1. Creare un team di test
2. Aggiungere membri
3. Creare una sessione associata al team
4. Eliminare il team
5. Verificare che:
   - Team eliminato correttamente
   - Team members eliminati automaticamente
   - Sessioni rimangono ma con `team_id = NULL`

## Test Manual SQL (Opzionale)
Se vuoi testare manualmente prima di applicare:

```sql
-- 1. Crea un team di test
INSERT INTO teams (name, owner_id) VALUES ('Test Team', auth.uid())
RETURNING id;

-- 2. Aggiungi un membro
INSERT INTO team_members (team_id, user_id, role)
VALUES ('TEAM_ID_FROM_STEP_1', auth.uid(), 'owner');

-- 3. Prova a eliminare
DELETE FROM teams WHERE id = 'TEAM_ID_FROM_STEP_1';

-- Dovrebbe funzionare dopo la migration!
```

## Rollback (se necessario)
Se la migration causa problemi, puoi fare rollback rimuovendo i constraint:

```sql
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_team_id_fkey;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_team_id_fkey;

-- Ricrea constraint senza CASCADE (stato precedente)
ALTER TABLE team_members
    ADD CONSTRAINT team_members_team_id_fkey
    FOREIGN KEY (team_id)
    REFERENCES teams(id);

ALTER TABLE sessions
    ADD CONSTRAINT sessions_team_id_fkey
    FOREIGN KEY (team_id)
    REFERENCES teams(id);
```
