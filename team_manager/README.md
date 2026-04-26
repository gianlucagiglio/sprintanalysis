# Team Resource Manager

App web per la gestione delle risorse di un team di sviluppo su timeline settimanale con sprint.

## 🚀 Stack Tecnologico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Backend**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **State**: Zustand
- **Date handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## 📋 Prerequisiti

1. **Node.js** (v18+)
2. **Account Supabase** (gratuito su [supabase.com](https://supabase.com))

---

## 🔧 Setup Iniziale

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura Supabase

#### A. Crea un progetto su Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto
3. Aspetta che il database venga inizializzato (~2 minuti)

#### B. Esegui lo schema SQL

1. Vai alla sezione **SQL Editor** nel tuo progetto Supabase
2. Copia tutto il contenuto di `database/schema.sql`
3. Incollalo nell'editor e clicca **Run**
4. Verifica che le 6 tabelle siano state create nella sezione **Table Editor**

#### C. Ottieni le credenziali

1. Vai su **Settings** → **API**
2. Copia:
   - `Project URL` (es. `https://xxxxx.supabase.co`)
   - `anon` key (chiave pubblica)

#### D. Configura `.env.local`

1. Rinomina `.env.local.example` in `.env.local` (oppure crea il file)
2. Inserisci le tue credenziali:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **IMPORTANTE**: Non committare mai il file `.env.local` su Git!

---

## 🎯 Avvio

### Modalità Sviluppo

```bash
npm run dev
```

L'app sarà disponibile su [http://localhost:5173](http://localhost:5173)

### Build Produzione

```bash
npm run build
npm run preview
```

---

## 📖 Guida all'Uso

### 1. Setup Team (sezione Team)

1. **Crea Ruoli**:
   - Clicca "Nuovo Ruolo"
   - Inserisci nome (es. "Frontend Developer") e scegli un colore
   - Salva

2. **Aggiungi Membri**:
   - Clicca "Nuovo Membro"
   - Inserisci nome, seleziona ruolo, imposta capacità settimanale (es. 5 giorni)
   - Salva

### 2. Pianifica Sprint (sezione Sprint)

1. **Crea Sprint**:
   - Clicca "Nuovo Sprint"
   - Inserisci nome (es. "Sprint 1 - Auth") e date inizio/fine
   - Salva

2. **Aggiungi Feature**:
   - Espandi uno sprint e clicca "+ Feature"
   - Inserisci nome feature e scegli un colore
   - Salva

### 3. Alloca Risorse (sezione Timeline)

1. **Visualizza la Timeline**:
   - Vedrai gli sprint nella riga superiore
   - Le settimane nella seconda riga
   - Le feature raggruppate con i membri

2. **Modifica Allocazioni**:
   - Clicca su una cella (intersezione membro/settimana)
   - Inserisci i giorni allocati (0-5, step 0.5)
   - Premi `Enter` o `Tab` per salvare, `Esc` per annullare

3. **Gestisci Ferie**:
   - Clicca su "Ferie/Assenze (click per dettaglio)"
   - Espandi la sezione e modifica le ferie per membro/settimana
   - Le celle rosse indicano sovraccarico di capacità

4. **Alert Sovraccarico**:
   - Passa il mouse sull'icona ⚠️ nelle celle rosse
   - Vedi il breakdown dettagliato delle allocazioni e l'eccedenza

---

## 🗂️ Struttura del Progetto

```
team_manager/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout e sidebar
│   │   ├── ui/              # Componenti UI generici (Modal, Badge, ColorPicker)
│   │   ├── team/            # Componenti per gestione team
│   │   ├── sprints/         # Componenti per gestione sprint
│   │   └── timeline/        # Componenti timeline (griglia, celle editabili)
│   ├── hooks/               # Custom hooks (useTeam, useSprints, useAllocations)
│   ├── lib/                 # Utility (supabase client, capacity logic)
│   ├── pages/               # Pagine principali (Timeline, Team, Sprint)
│   ├── store/               # Zustand store globale
│   ├── types/               # TypeScript types
│   └── App.tsx              # Entry point + routing
├── database/
│   └── schema.sql           # Schema PostgreSQL per Supabase
└── .env.local               # Credenziali (NON committare!)
```

---

## 🎨 Features

✅ **Gestione Team**:
- CRUD completo per ruoli e membri
- Badge colorati per i ruoli
- Capacità settimanale configurabile

✅ **Gestione Sprint**:
- CRUD completo per sprint e feature
- Visualizzazione gerarchica sprint → feature
- Date inizio/fine con validazione

✅ **Timeline Interattiva**:
- Griglia settimanale con sticky header e colonna
- Editing inline delle allocazioni (click, edit, save)
- Calcolo automatico capacità residua
- Alert visivi per sovraccarico
- Tooltip dettagliato su celle rosse

✅ **Ferie/Assenze**:
- Gestione ferie per membro/settimana
- Vista aggregata e dettaglio espandibile
- Sincronizzazione automatica con calcolo capacità

✅ **UX**:
- Dark theme nativo
- Toast per feedback operazioni
- Empty states informativi
- Responsive (ottimizzato per desktop)

---

## 🔐 Sicurezza & Produzione

> ⚠️ **Nota**: Questa è una v1 senza autenticazione. Per la produzione:

1. **Abilita autenticazione Supabase**:
   - Configura Auth in Supabase Dashboard
   - Aggiungi login/signup nel frontend
   - Aggiorna le RLS policies per filtrare per utente

2. **Aggiorna Row Level Security (RLS)**:
   - Rimuovi le policy "Allow all for development"
   - Crea policy basate su `auth.uid()`
   - Esempio:
     ```sql
     CREATE POLICY "Users can only see their own data"
     ON team_members FOR SELECT
     USING (auth.uid() = user_id);
     ```

3. **Deploy**:
   - Frontend: Vercel, Netlify, o Cloudflare Pages
   - Backend: Supabase è già hostato

---

## 📚 Risorse

- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [date-fns](https://date-fns.org/)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- Verifica che `.env.local` esista e contenga `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Riavvia il dev server dopo aver creato/modificato `.env.local`

### "Error fetching data from Supabase"

- Verifica che lo schema SQL sia stato eseguito correttamente
- Controlla che le RLS policies siano attive (per ora dovrebbero essere "allow all")
- Verifica le credenziali in `.env.local`

### Le celle non si editano

- Verifica che i dati siano stati caricati correttamente (controlla la console)
- Ricarica la pagina
- Controlla che Supabase sia online

---

## 📝 Licenza

MIT

---

**Buon lavoro! 🚀**
