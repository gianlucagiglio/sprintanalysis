# Database Schema e Migrazioni

## Setup Iniziale

Se stai creando il database da zero, esegui `schema.sql` nel SQL Editor di Supabase.

## Migrazione per Database Esistenti

Se hai già un database con feature associate agli sprint, devi eseguire la migrazione:

### Migrazione 001: Feature con Sprint Opzionale

**File**: `migration_001_features_optional_sprint.sql`

**Cosa fa**:
- Rende il campo `sprint_id` opzionale nelle feature
- Le feature esistenti mantengono il loro sprint_id
- Le nuove feature possono essere create senza sprint
- Le allocazioni vengono gestite direttamente sulla timeline

**Come eseguirla**:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona SQL nella sidebar)
4. Clicca **New Query**
5. Copia e incolla il contenuto di `migration_001_features_optional_sprint.sql`
6. Clicca **Run** o premi `Ctrl+Enter`
7. Verifica il messaggio di successo

**Verifiche post-migrazione**:

```sql
-- Verifica che sprint_id sia nullable
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'features' AND column_name = 'sprint_id';

-- Risultato atteso: is_nullable = 'YES'
```

## Note Importanti

- ⚠️ **Backup**: Prima di eseguire qualsiasi migrazione, esporta i dati come backup
- ✅ Le feature esistenti non verranno modificate
- ✅ Le nuove feature possono essere create senza specificare uno sprint
- ✅ Le allocazioni vengono gestite sulla timeline indipendentemente dallo sprint
