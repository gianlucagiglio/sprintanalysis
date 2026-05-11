# Send Retro Recap - Edge Function

Funzione serverless per inviare email di recap quando una retrospettiva viene chiusa.

## 📧 Destinatario

Email inviata a: **POS_Team@qubicaamf.com**

## 🔧 Setup

### 1. Crea account Resend (gratuito)

1. Vai su https://resend.com/signup
2. Crea un account gratuito (3000 email/mese)
3. Vai su **API Keys** e crea una nuova chiave
4. Copia l'API key (inizia con `re_...`)

### 2. Verifica dominio email (importante!)

⚠️ **IMPORTANTE**: Prima di poter inviare email, devi verificare il dominio.

**Opzione A - Usa dominio Resend (testing/sviluppo)**:
- Puoi usare `onboarding@resend.dev` come mittente per test
- Modifica il campo `from` nella funzione se necessario

**Opzione B - Verifica tuo dominio (produzione)**:
1. Vai su Resend Dashboard > **Domains**
2. Aggiungi il tuo dominio (es. `qubicaamf.com`)
3. Copia i record DNS (SPF, DKIM, DMARC)
4. Aggiungili nel pannello DNS del tuo provider
5. Attendi verifica (può richiedere 24-48h)
6. Modifica il campo `from` nella funzione con il tuo dominio

### 3. Configura variabili d'ambiente Supabase

1. Vai su **Supabase Dashboard** > **Project Settings** > **Edge Functions**
2. Aggiungi queste variabili:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

(SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili di default)

### 4. Deploy della funzione

**Opzione A - Dashboard (più semplice)**:
1. Vai su **Supabase Dashboard** > **Edge Functions**
2. Clicca **Deploy a new function**
3. Nome: `send-retro-recap`
4. Copia il contenuto di `index.ts` nell'editor
5. Clicca **Deploy**

**Opzione B - CLI (avanzato)**:
```bash
# Installa Supabase CLI con Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Oppure scarica binary da: https://github.com/supabase/cli/releases

# Login
supabase login

# Link al progetto
supabase link --project-ref <your-project-ref>

# Deploy
supabase functions deploy send-retro-recap
```

### 5. Modifica mittente email (opzionale)

Se hai verificato il tuo dominio, modifica questa riga in `index.ts`:

```typescript
from: 'RetroBoard <noreply@qubicaamf.com>', // Cambia con il tuo dominio verificato
```

## 🧪 Test

Dopo il deploy, testa chiudendo una retrospettiva:
1. Crea una retro di test
2. Aggiungi qualche commento e azione
3. Chiudi la retro
4. Verifica che l'email arrivi a `POS_Team@qubicaamf.com`

## 📊 Contenuto Email

L'email include:
- ✅ Header con titolo sessione e data
- ✅ Recap di tutte le sezioni con commenti
- ✅ Tabella azioni con stato, deadline e assegnati
- ✅ Design responsive e professionale

## 🐛 Troubleshooting

**Email non arriva?**
1. Controlla log in Supabase Dashboard > Edge Functions > Logs
2. Verifica che il dominio sia verificato in Resend
3. Controlla spam/junk folder
4. Verifica RESEND_API_KEY in Supabase settings

**Errore 403 da Resend?**
- Il dominio non è verificato, usa `onboarding@resend.dev` per test

**Funzione non si invoca?**
- Verifica che sia deployata correttamente
- Controlla console browser per errori
- Verifica permissions RLS su Supabase
