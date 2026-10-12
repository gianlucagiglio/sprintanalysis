# 🛡️ Procedura Sicura per Chiudere una League

## ⚠️ PRIMA DI CHIUDERE - CHECKLIST OBBLIGATORIA

### 1. BACKUP DATABASE (CRITICO!)

**Opzione A - Via Supabase Dashboard (CONSIGLIATO):**
1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto RetroBoard
3. Settings → Database → Backups
4. Clicca **"Create Backup"** manualmente
5. Aspetta conferma backup completato

**Opzione B - Via Supabase CLI:**
```bash
# Se hai configurato Supabase CLI
supabase db dump -f backup_pre_league_close_$(date +%Y%m%d_%H%M%S).sql
```

**Opzione C - Export manuale:**
```bash
# Via pg_dump (richiede accesso diretto al DB)
pg_dump -h [DB_HOST] -U [DB_USER] -d [DB_NAME] > backup.sql
```

### 2. APPLICA LA MIGRATION DI SICUREZZA

La migration `022_improve_league_close_safety.sql` è stata creata per:
- ✅ Aggiungere funzione `preview_close_quiz_league` (dry-run sicuro)
- ✅ Migliorare `close_quiz_league` con validazioni extra
- ✅ Garantire rollback automatico in caso di errore

**Applicare la migration:**

```bash
# Opzione 1: Via Supabase CLI (se configurato)
cd supabase
supabase db push

# Opzione 2: Manualmente via Dashboard
# - Copia il contenuto di supabase/migrations/022_improve_league_close_safety.sql
# - Vai su Supabase Dashboard → SQL Editor
# - Incolla e esegui
```

**Verifica che la migration sia applicata:**
```sql
-- Esegui nel SQL Editor Supabase
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('preview_close_quiz_league', 'close_quiz_league')
AND routine_schema = 'public';

-- Dovresti vedere entrambe le funzioni
```

### 3. USA LA FUNZIONE PREVIEW (DRY-RUN)

**Nel pannello Admin della tua app:**

1. Vai alla sezione "Gestione League"
2. Clicca **"🔍 Preview Chiusura (sicuro)"**
3. Verifica i dati mostrati:
   - Nome league
   - Numero classifiche da salvare
   - Stato attuale

**Cosa controlla la Preview:**
- ✅ Quanti utenti hanno partecipato alla league
- ✅ Quante classifiche verranno salvate
- ✅ Che la league sia effettivamente attiva
- ❌ **NON MODIFICA NESSUN DATO** - è solo una verifica

### 4. CHIUDI LA LEAGUE (OPERAZIONE REALE)

Solo DOPO aver fatto backup e preview:

1. Clicca **"Procedi con Chiusura"**
2. Inserisci nome nuova league (es. "Stagione 2")
3. Opzionale: descrizione (es. "Q1 2025")
4. Clicca **"Conferma"**

**Cosa succede durante la chiusura:**
1. ✅ Crea snapshot classifica finale (salvata in `league_rankings`)
2. ✅ Chiude la league corrente (status → 'closed', end_date → now)
3. ✅ Crea nuova league attiva (se specificato nome)
4. ✅ **Rollback automatico** se qualcosa va storto

**Garanzie di sicurezza:**
- 🔒 Transazioni atomiche (tutto o niente)
- 🔒 Rollback automatico in caso di errore
- 🔒 Validazioni super admin
- 🔒 UPSERT sui rankings (safe retry)
- 🔒 Doppio check stato league

### 5. VERIFICA POST-CHIUSURA

Dopo aver chiuso, verifica:

```sql
-- 1. Controlla che la league sia chiusa
SELECT name, status, end_date
FROM quiz_leagues
WHERE status = 'closed'
ORDER BY end_date DESC
LIMIT 1;

-- 2. Verifica classifiche salvate
SELECT COUNT(*) as total_rankings
FROM league_rankings
WHERE league_id = '[ID_LEAGUE_CHIUSA]';

-- 3. Verifica nuova league attiva
SELECT name, status, start_date
FROM quiz_leagues
WHERE status = 'active';
```

**Vai anche nella pagina "Storico League" dell'app:**
- ✅ Dovresti vedere la league chiusa nella lista
- ✅ Dovresti poter aprire e vedere la classifica finale
- ✅ La nuova league dovrebbe essere attiva

## 🚨 PIANO DI ROLLBACK (se qualcosa va storto)

### Se la chiusura fallisce:
1. **NON PANICO** - La funzione ha rollback automatico
2. Controlla il messaggio di errore nell'app
3. Verifica stato league nel database
4. Se necessario, ripristina dal backup

### Ripristino da Backup:

**Via Supabase Dashboard:**
1. Settings → Database → Backups
2. Trova il backup pre-chiusura
3. Clicca "Restore"
4. ATTENZIONE: Questo sovrascriverà TUTTI i dati successivi!

**Via SQL (ripristino manuale):**
```bash
# Ripristina solo le tabelle specifiche (più sicuro)
psql -h [DB_HOST] -U [DB_USER] -d [DB_NAME] < backup.sql
```

## 📊 DATI CHE VENGONO SALVATI

Quando chiudi una league, vengono salvati in `league_rankings`:
- `user_id` - ID utente
- `total_points` - Punti totali nella league
- `games_played` - Numero partite giocate
- `rank` - Posizione finale classifica
- `snapshot_at` - Timestamp chiusura

**IMPORTANTE:**
- ✅ I punti personali (`user_points`) NON vengono toccati
- ✅ I badge NON vengono toccati
- ✅ Le risposte quiz (`quiz_answers`) NON vengono cancellate
- ⚠️ Solo le domande legate alla league chiusa non contribuiranno più ai nuovi punteggi

## 🎯 BEST PRACTICES

1. **Chiudi sempre a fine settimana** - Meno utenti attivi
2. **Avvisa gli utenti** - Comunicazione 1-2 giorni prima
3. **Backup multipli** - Fai 2 backup se possibile
4. **Preview sempre** - Usa SEMPRE il dry-run prima
5. **Verifica dopo** - Controlla che tutto sia ok
6. **Monitora errori** - Tieni d'occhio Supabase logs

## ❓ FAQ

**Q: Cosa succede ai punti degli utenti?**
A: I punti totali (`user_points`) rimangono invariati. Solo i punti quiz della league vengono "archiviati" nel ranking.

**Q: Gli utenti perderanno i loro progressi?**
A: No. Badge, livelli, punti totali rimangono. Solo la classifica quiz viene "congelata" nello storico.

**Q: Posso riaprire una league chiusa?**
A: No, è irreversibile. Per questo è fondamentale fare backup.

**Q: Cosa succede se la chiusura fallisce a metà?**
A: PostgreSQL garantisce rollback automatico - tutto torna come prima dell'operazione.

**Q: Quanto tempo ci vuole?**
A: Dipende dal numero di utenti. Tipicamente < 5 secondi per 100 utenti.

## 📞 SUPPORTO

In caso di problemi:
1. Controlla Supabase Dashboard → Logs
2. Verifica stato tabelle con SQL queries sopra
3. Se necessario, ripristina da backup
4. Contatta supporto con screenshot errore

---

**Ultimo aggiornamento:** 2026-10-12
**Versione app:** 1.14.27+
