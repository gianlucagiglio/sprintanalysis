import Anthropic from '@anthropic-ai/sdk';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sei un esperto analista di buste paga italiane. Estrai TUTTI i dati dalla busta paga e restituiscili in JSON strutturato.

REGOLE:
- Estrai i valori numerici esattamente come appaiono
- Se un campo non è presente, usa null
- Valori monetari: numeri con 2 decimali (non stringhe)
- Ore: numeri decimali
- Aliquote: percentuali (es. 9.19 per 9,19%)
- Il campo "note" contiene osservazioni (anomalie, voci particolari, trasferte, rimborsi, etc.)
- Rispondi SOLO con il JSON, senza markdown, senza backtick, senza testo prima o dopo`;

const USER_PROMPT = `Analizza questa busta paga e restituisci un JSON con ESATTAMENTE questa struttura.
Rispetta i nomi dei campi — il frontend dipende da questi nomi esatti.

{
  "periodo": "Mese Anno",
  "azienda": "Nome Azienda",
  "dipendente": "Nome Cognome",
  "codice_fiscale": "CODICE FISCALE o null",
  "qualifica": "Impiegato/Operaio/Dirigente/Quadro o null",
  "livello": "es. 5S, 3A, etc. o null",
  "data_nascita": "dd-mm-yyyy o null",
  "data_assunzione": "dd-mm-yyyy o null",
  "elementi_retribuzione": {
    "voci": [{"voce": "Paga base", "importo": 0.00}],
    "totale": 0.00
  },
  "competenze": {
    "voci": [{"descrizione": "Retribuzione", "importo": 0.00}],
    "totale_competenze": 0.00
  },
  "ore": {
    "ordinarie": null,
    "straordinario": null,
    "telelavoro": null,
    "rol_par": null
  },
  "trattenute": {
    "contributi_inps": [
      {"descrizione": "Contributo IVS", "imponibile": 0.00, "aliquota": 9.19, "importo": 0.00}
    ],
    "irpef_lorda": null,
    "ritenute_irpef": null,
    "addizionale_regionale": {"residuo": null, "regione": "nome", "importo_mese": 0.00},
    "addizionale_comunale": {"residuo": null, "comune": "nome", "importo_mese": 0.00},
    "acconto_addizionale_comunale": {"residuo": null, "comune": "nome", "importo_mese": null},
    "altre": [{"voce": "nome", "importo": 0.00}],
    "totale_trattenute": 0.00
  },
  "netto": 0.00,
  "lordo_ral": 0.00,
  "netto_ral": 0.00,
  "tfr": {
    "retribuzione_utile": null,
    "quota_mese": null
  },
  "ferie_permessi": {
    "ferie": {"godute": null, "residue": null, "godute_ap": null, "residue_ap": null},
    "permessi_par": {"goduti": null, "residui": null, "goduti_ap": null, "residui_ap": null}
  },
  "progressivi": {
    "imponibile_inps": null,
    "imponibile_irpef": null,
    "irpef_pagata": null
  },
  "costo_azienda": {
    "voci": [{"descrizione": "nome", "importo": 0.00}],
    "totale": 0.00
  },
  "banca": {
    "nome": null,
    "abi": null,
    "cab": null
  },
  "note": ["osservazione 1", "osservazione 2"]
}

NOTE IMPORTANTI:
- "competenze.totale_competenze" è il totale lordo del mese (somma di tutte le competenze)
- "trattenute.contributi_inps" è un ARRAY (possono esserci più contributi: IVS, CIG, etc.)
- "addizionale_regionale/comunale" sono OGGETTI con importo_mese, non numeri semplici
- Se trovi indennità trasferta, rimborsi spese o buoni pasto, aggiungili alle voci competenze
- IMPORTANTE: Qualsiasi voce di RIMBORSO (Rimborsi 730, Rimborso spese, Rimborso spese anticipate, etc.) NON fa parte della RAL.
  Aggiungili alle voci competenze ma con il flag "escludi_da_ral": true.
  Calcola anche "lordo_ral" (totale_competenze meno queste voci) e "netto_ral" (netto meno queste voci).
- Se non trovi un sottooggetto (es. addizionale_regionale), metti null per l'intero campo
- Il campo "note" deve includere eventuali anomalie, trasferte, rimborsi e voci particolari
- FERIE E PERMESSI: la busta paga ha 4 colonne: Goduto, Residuo, Goduto AP, Residuo AP.
  "residue"/"residui" è il residuo dell'anno corrente, "residue_ap"/"residui_ap" è il residuo dell'anno precedente.
  Estrai entrambi i valori separatamente. Il saldo disponibile = residuo + residuo_ap.

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
  logger.info({ periodo: parsed.periodo, netto: parsed.netto }, 'Analisi Claude completata');
  return parsed;
}
