# 🚀 Istruzioni Setup Rapido

## Passi da completare per far funzionare l'app:

### ✅ Step 1: Installazione dipendenze (FATTO)
```bash
npm install
```

### 🔧 Step 2: Configura Supabase (DA FARE)

#### A. Crea progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Registrati/Login
3. Crea un nuovo progetto
   - Organization: scegli o creane una nuova
   - Name: `team-resource-manager` (o a tuo piacimento)
   - Database Password: genera una password sicura (salvala!)
   - Region: scegli quella più vicina (es. Europe West)
4. Aspetta ~2 minuti per l'inizializzazione

#### B. Esegui lo schema SQL

1. Nel tuo progetto Supabase, vai su **SQL Editor** (icona nella sidebar sinistra)
2. Apri il file `database/schema.sql` di questo progetto
3. Copia TUTTO il contenuto
4. Incollalo nell'editor SQL di Supabase
5. Clicca **Run** (o `Ctrl+Enter`)
6. Dovresti vedere il messaggio "Success. No rows returned"
7. Vai su **Table Editor** e verifica che ci siano 6 tabelle:
   - ✅ roles
   - ✅ team_members
   - ✅ sprints
   - ✅ features
   - ✅ allocations
   - ✅ time_offs

#### C. Ottieni le credenziali API

1. Vai su **Settings** → **API** (nel menu laterale)
2. Nella sezione **Project API keys**, trovi:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon/public key**: una stringa lunga che inizia con `eyJ...`
3. Copia entrambe

#### D. Crea il file `.env.local`

1. Nella root del progetto, crea un nuovo file chiamato `.env.local`
2. Incolla questo contenuto (sostituendo con i tuoi valori):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Usa i TUOI valori, non quelli dell'esempio!

### 🎬 Step 3: Avvia l'app

```bash
npm run dev
```

L'app sarà disponibile su [http://localhost:5173](http://localhost:5173)

---

## 📝 Primo utilizzo

### 1. Vai alla sezione **Team**
- Crea almeno 1 ruolo (es. "Frontend Developer", colore blu)
- Aggiungi almeno 1 membro (es. "Mario Rossi", capacità 5 giorni/settimana)

### 2. Vai alla sezione **Sprint**
- Crea almeno 1 sprint (es. "Sprint 1", dal 2025-05-01 al 2025-05-14)
- Espandi lo sprint e aggiungi almeno 1 feature (es. "User Authentication")

### 3. Vai alla sezione **Timeline**
- Dovresti vedere la griglia con:
  - Sprint in alto
  - Settimane sotto
  - Feature espandibili con i membri
- **Clicca su una cella** per allocare giorni (0-5, step 0.5)
- Le celle diventeranno **rosse** se superi la capacità
- Hover sull'icona ⚠️ per vedere il dettaglio

### 4. Gestisci le ferie
- Nella timeline, clicca su "Ferie/Assenze (click per dettaglio)"
- Si espande una sezione con tutti i membri
- Clicca sulle celle per inserire giorni di ferie

---

## 🎯 Tutto pronto!

Ora puoi:
- ✅ Gestire il team e i ruoli
- ✅ Pianificare sprint e feature
- ✅ Allocare risorse su timeline settimanale
- ✅ Monitorare sovraccarichi di capacità
- ✅ Gestire ferie e assenze

---

## 🐛 Problemi?

### L'app non parte / Errore "Missing Supabase environment variables"

- Verifica che il file `.env.local` esista nella root del progetto
- Verifica che contenga `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Riavvia il server dev (`Ctrl+C` poi `npm run dev`)

### "Error fetching data" o dati non si caricano

- Vai su Supabase Dashboard → SQL Editor
- Verifica che le tabelle esistano (vedi Step 2B)
- Controlla le credenziali in `.env.local`
- Prova a ricaricare la pagina (`Ctrl+R`)

### Le celle non si editano

- Verifica che ci siano dati (almeno 1 ruolo, 1 membro, 1 sprint, 1 feature)
- Controlla la console del browser (`F12`) per eventuali errori
- Verifica che Supabase sia online (Dashboard dovrebbe essere accessibile)

---

**Buon lavoro! Se hai problemi, leggi il README.md per maggiori dettagli.**
