import Anthropic from '@anthropic-ai/sdk';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sei un esperto analista di buste paga italiane. Il tuo compito è estrarre tutti i dati dalla busta paga fornita e restituirli in formato JSON strutturato.

IMPORTANTE:
- Estrai TUTTI i valori numerici esattamente come appaiono nel documento
- Se un campo non è presente nella busta paga, usa null
- I valori monetari devono essere numeri (non stringhe), con 2 decimali
- Le ore devono essere numeri
- Le aliquote devono essere percentuali (es. 9.19 per 9,19%)
- Il campo "note" deve contenere osservazioni rilevanti (anomalie, voci particolari, etc.)

Rispondi SOLO con il JSON, senza markdown o testo aggiuntivo.`;

const USER_PROMPT = `Analizza questa busta paga e restituisci un JSON con questa struttura esatta:

{
  "periodo": "Mese Anno",
  "azienda": "Nome Azienda",
  "dipendente": "Nome Cognome",
  "qualifica": "Qualifica",
  "livello": "Livello - CCNL",
  "competenze": {
    "paga_base": 0.00,
    "contingenza": 0.00,
    "superminimo": 0.00,
    "straordinari": 0.00,
    "altri": [{"voce": "nome", "importo": 0.00}],
    "totale_lordo": 0.00
  },
  "ore": {
    "ordinarie": 0,
    "straordinario": 0,
    "ferie_maturate": 0,
    "ferie_godute": 0,
    "ferie_residue": 0,
    "permessi_residui": 0,
    "rol_residui": 0
  },
  "trattenute": {
    "inps_dipendente": {"imponibile": 0.00, "aliquota": 0.00, "importo": 0.00},
    "irpef_lorda": 0.00,
    "detrazioni_lavoro": 0.00,
    "irpef_netta": 0.00,
    "addizionale_regionale": 0.00,
    "addizionale_comunale": 0.00,
    "altre_trattenute": [{"voce": "nome", "importo": 0.00}],
    "totale_trattenute": 0.00
  },
  "netto": 0.00,
  "tfr": {
    "maturato_mese": 0.00,
    "accantonato_totale": 0.00
  },
  "inps_azienda": {
    "imponibile": 0.00,
    "aliquota": 0.00,
    "importo": 0.00
  },
  "note": []
}

Testo della busta paga:
---
`;

/**
 * Analizza il testo di una busta paga usando Claude.
 * @param {string} payslipText - Il testo estratto dal PDF
 * @returns {Promise<object>} I dati strutturati della busta paga
 */
export async function analyzePayslip(payslipText) {
  logger.info('Invio testo a Claude per analisi...');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: USER_PROMPT + payslipText,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const responseText = message.content[0].text;

  // Parse JSON dalla risposta (gestisce eventuali backtick markdown)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude non ha restituito un JSON valido');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  logger.info({ periodo: parsed.periodo, netto: parsed.netto }, 'Analisi completata');
  return parsed;
}
