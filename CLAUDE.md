# StockPulse - Portfolio Intelligence App

## Cosa è
App React per analisi azionaria, gestione portafoglio e simulazione scenari
di investimento. Target: investitore retail italiano (tassazione 26% capital gains).

## Stack
- React 18 + Vite
- Recharts per grafici
- Lucide React per icone
- Anthropic API con web_search per dati real-time
- Persistent storage via window.storage (ambiente Claude.ai) — da migrare

## Stato attuale
Prototipo funzionante come singolo componente monolitico (~550 righe).
Tutte le feature in un file, nessun backend, nessun routing.

## Priorità di refactor
1. Spacchettare in componenti modulari (un file per tab/feature)
2. Sostituire window.storage con persistenza reale (Supabase o localStorage + export JSON)
3. Sostituire Anthropic API inline con un backend (API route o serverless function) per proteggere le chiavi
4. Aggiungere API dati finanziari reale (Yahoo Finance, Alpha Vantage, o Financial Modeling Prep)
5. Routing con React Router
6. State management (Zustand o Context)
7. TypeScript migration

## Convenzioni
- Lingua UI: italiano
- Monospace per numeri finanziari (JetBrains Mono)
- Dark theme obbligatorio
- Valuta principale: EUR con conversione USD
- Tassazione italiana 26% su capital gains