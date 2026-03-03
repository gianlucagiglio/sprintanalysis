/**
 * Genera 12 buste paga PDF di esempio nel formato Zucchetti.
 * I dati sono finti ma realistici per un impiegato metalmeccanico livello 5S.
 *
 * Uso: node scripts/generate-samples.js
 * Output: scripts/samples/busta_gennaio_2024.pdf ... busta_dicembre_2024.pdf
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'samples');

// ── Dati fissi dipendente ──────────────────────────

const DIPENDENTE = {
  nome: 'ROSSI MARCO',
  cf: 'RSSMRC85A15F205X',
  nascita: '15-01-1985',
  assunzione: '01-09-2020',
  qualifica: 'IMP',
  livello: '5S',
  azienda: 'TECHSOLUTIONS S.R.L.',
  indirizzo_azienda: 'VIA EMILIA 142, BOLOGNA',
  banca: 'INTESA SANPAOLO SPA',
  sede_banca: 'SEDE DI BOLOGNA',
  abi: '03069',
  cab: '02300',
  cc: '000001234567',
};

// ── Retribuzione base (fissa) ─────────────────────

const RETRIBUZIONE = [
  { voce: 'PAGA BASE', importo: 1916.45 },
  { voce: 'CONTINGENZA', importo: 524.22 },
  { voce: 'S.MINIMO', importo: 350.00 },
  { voce: 'E.D.R.', importo: 10.33 },
];
const TOTALE_RETRIBUZIONE = RETRIBUZIONE.reduce((s, v) => s + v.importo, 0); // 2801.00

// ── Parametri mensili variabili ────────────────────

const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

const ANNO = 2024;

// Ore per mese: [ordinarie, telelavoro, straordinario]
const ORE_MESE = [
  [88.00, 80.00, 0],     // Gen
  [80.00, 72.00, 4.50],  // Feb (più corto)
  [88.00, 80.00, 0],     // Mar
  [72.00, 72.00, 0],     // Apr (Pasqua, qualche ferie)
  [88.00, 80.00, 6.00],  // Mag
  [80.00, 80.00, 0],     // Giu
  [88.00, 80.00, 8.00],  // Lug (straordinari pre-ferie)
  [40.00, 24.00, 0],     // Ago (ferie)
  [88.00, 80.00, 0],     // Set
  [80.00, 80.00, 3.00],  // Ott
  [88.00, 72.00, 0],     // Nov
  [72.00, 64.00, 0],     // Dic (ferie natalizie)
];

// Ferie: [godute_mese, residue_fine_mese] — maturate 13.33/mese
// Partenza residue AP: 24 ore
const FERIE_MATURATE_MESE = 13.33;
let ferieResidue = 24.00; // residuo anno precedente
const FERIE = [];

const ferieGoduteMese = [0, 0, 0, 16, 0, 0, 0, 72, 0, 0, 0, 24];
let ferieGoduteCum = 0;
let ferieMaturateCum = 0;

for (let i = 0; i < 12; i++) {
  ferieMaturateCum += FERIE_MATURATE_MESE;
  ferieGoduteCum += ferieGoduteMese[i];
  ferieResidue = 24 + ferieMaturateCum - ferieGoduteCum;
  FERIE.push({
    godute: round(ferieGoduteCum),
    residue: round(ferieResidue),
    maturate: round(ferieMaturateCum), // usato solo a dicembre (3 valori)
  });
}

// Permessi PAR: maturati 7.33/mese, partenza residuo AP: 12
const PERMESSI_MATURATI_MESE = 7.33;
let permessiResidui = 12.00;
const PERMESSI = [];
const permessiGodutiMese = [0, 0, 4, 0, 0, 8, 0, 0, 4, 0, 0, 0];
let permGodutiCum = 0;
let permMaturatiCum = 0;

for (let i = 0; i < 12; i++) {
  permMaturatiCum += PERMESSI_MATURATI_MESE;
  permGodutiCum += permessiGodutiMese[i];
  permessiResidui = 12 + permMaturatiCum - permGodutiCum;
  PERMESSI.push({
    goduti: round(permGodutiCum),
    residui: round(permessiResidui),
  });
}

// Bonus occasionali
const BONUS = [
  null, null, null, null, null, null,
  null, null, null, null, null,
  { descrizione: 'Premio risultato', importo: 1200.00 }, // Dicembre
];

// Buono pasto elettronico: 8€/giorno, GG in sede (non in telelavoro)
const BUONI_PASTO_VALORE = 8.00;
const BUONI_PASTO_GG = [17, 15, 17, 14, 17, 15, 17, 5, 17, 15, 17, 12];

// Indennità trasferta Italia (€46.48/gg esente fino a €46.48) e Estero (€77.47/gg)
// Trasferte: [{ tipo, giorni, importo_giorno, rimborso_spese }] per mese
const TRASFERTE = [
  null,                                                                         // Gen
  [{ tipo: 'Italia', giorni: 2, importo_giorno: 46.48, luogo: 'Milano' }],     // Feb - trasferta cliente
  null,                                                                         // Mar
  null,                                                                         // Apr
  [                                                                             // Mag - fiera + cliente
    { tipo: 'Italia', giorni: 3, importo_giorno: 46.48, luogo: 'Roma' },
    { tipo: 'Italia', giorni: 1, importo_giorno: 46.48, luogo: 'Firenze' },
  ],
  null,                                                                         // Giu
  null,                                                                         // Lug
  null,                                                                         // Ago
  [{ tipo: 'Estero', giorni: 4, importo_giorno: 77.47, luogo: 'Monaco' }],     // Set - fiera estera
  [{ tipo: 'Italia', giorni: 2, importo_giorno: 46.48, luogo: 'Torino' }],     // Ott
  [{ tipo: 'Italia', giorni: 1, importo_giorno: 46.48, luogo: 'Padova' }],     // Nov
  null,                                                                         // Dic
];

// Rimborso spese anticipate (nota spese): voce unica in busta paga con importo totale
// In busta appare come "Rimborso spese anticipate" + importo totale
const RIMBORSI_SPESE = [
  null,       // Gen
  110.90,     // Feb — trasferta Milano (treno 86.40 + taxi 24.50)
  null,       // Mar
  null,       // Apr
  440.30,     // Mag — trasferte Roma+Firenze (volo 148 + hotel 240 + treno 52.30)
  null,       // Giu
  null,       // Lug
  null,       // Ago
  702.80,     // Set — trasferta Monaco (volo 215 + hotel 420 + trasporti 67.80)
  106.60,     // Ott — trasferta Torino (treno 74.60 + pranzo 32)
  28.40,      // Nov — trasferta Padova (autostrada)
  null,       // Dic
];

// ── Calcoli fiscali ────────────────────────────────

function round(v) { return Math.round(v * 100) / 100; }

// Aliquota INPS
const ALIQUOTA_INPS = 9.19;
const ALIQUOTA_INPS_CIG = 0.30;

// Addizionali annue (ripartite su 11 mesi, da gen a nov)
const ADDIZIONALE_REGIONALE_ANNUA = 404.11; // Emilia Romagna ~1.73%
const ADDIZIONALE_COMUNALE_ANNUA = 152.24;  // Bologna ~0.8%
const ACCONTO_COMUNALE_ANNUA = 91.34;

// IRPEF brackets 2024
function calcIrpefLorda(imponibile) {
  if (imponibile <= 28000) return round(imponibile * 0.23);
  if (imponibile <= 50000) return round(28000 * 0.23 + (imponibile - 28000) * 0.35);
  return round(28000 * 0.23 + 22000 * 0.35 + (imponibile - 50000) * 0.43);
}

// Detrazione lavoro dipendente 2024 (semplificata)
function calcDetrazioneLavoro(redditoAnnuo) {
  if (redditoAnnuo <= 15000) return 1955;
  if (redditoAnnuo <= 28000) return round(1910 + 1190 * ((28000 - redditoAnnuo) / 13000));
  if (redditoAnnuo <= 50000) return round(1910 * ((50000 - redditoAnnuo) / 22000));
  return 0;
}

// ── Costi C/Ditta ──────────────────────────────────

function calcCostoAzienda(imponibile) {
  return [
    { descrizione: 'Contrib. INPS C/Ditta', importo: round(imponibile * 0.2381) },
    { descrizione: 'INAIL', importo: round(imponibile * 0.0040) },
    { descrizione: 'F.do sicurezza metalm.-OPNC', importo: 0.50 },
    { descrizione: 'Contributo EBM Salute', importo: 5.00 },
  ];
}

// ── Formato numeri Zucchetti ───────────────────────

/** 1234.56 → "1.234,56" */
function fmtIt(v) {
  const parts = v.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return intPart + ',' + parts[1];
}

/** 1234.56 → "1.234,56000" (trailing zeros per retribuzione) */
function fmtZuc(v) {
  return fmtIt(v) + '000';
}

/** Per ferie: 56.00 → "56,00000" (5 decimali) */
function fmtFerie(v) {
  return v.toFixed(5).replace('.', ',');
}

/** Per aliquota+importo concatenati: "9,19000744,39" */
function fmtAliqImporto(aliq, importo) {
  const a = aliq.toFixed(2).replace('.', ',') + '000';
  return a + fmtIt(importo);
}

// ── Generazione testo busta paga ───────────────────

function generatePayslipText(meseIdx) {
  const mese = MESI[meseIdx];
  const [oreOrd, oreTel, oreStra] = ORE_MESE[meseIdx];
  const oreTotali = oreOrd + oreTel + oreStra;

  // Competenze
  const retribuzioneMese = round(TOTALE_RETRIBUZIONE * (oreTotali / 168));
  const straordinarioImporto = oreStra > 0 ? round(oreStra * (TOTALE_RETRIBUZIONE / 168) * 1.25) : 0;
  const buoniPastoGG = BUONI_PASTO_GG[meseIdx];
  const buoniPasto = round(buoniPastoGG * BUONI_PASTO_VALORE);
  const bonus = BONUS[meseIdx];
  const trasferte = TRASFERTE[meseIdx];
  const totaleRimborsi = RIMBORSI_SPESE[meseIdx] || 0;

  // Calcolo indennità trasferta
  let totaleTrasferte = 0;
  if (trasferte) {
    for (const t of trasferte) {
      totaleTrasferte += round(t.giorni * t.importo_giorno);
    }
  }

  // Totale competenze: retribuzione + straordinario + bonus + trasferte
  // (buoni pasto sono "in kind" e non entrano nel totale competenze tassabile)
  // (rimborsi spese sono esenti e non entrano nel totale competenze)
  let totaleCompetenze = retribuzioneMese + straordinarioImporto + totaleTrasferte;
  if (bonus) totaleCompetenze += bonus.importo;
  totaleCompetenze = round(totaleCompetenze);

  // Imponibile INPS: competenze tassabili (trasferta esente fino a soglia, ma per semplicità tassiamo tutto)
  // In realtà l'indennità trasferta Italia è esente fino a €46.48/gg — semplifichiamo
  const imponibileInps = round(retribuzioneMese + straordinarioImporto + (bonus ? bonus.importo : 0));

  // Contributi INPS
  const inpsIvs = round(imponibileInps * ALIQUOTA_INPS / 100);
  const inpsCig = round(imponibileInps * ALIQUOTA_INPS_CIG / 100);

  // Imponibile IRPEF = imponibile INPS - contributi INPS
  const imponibileIrpef = round(imponibileInps - inpsIvs - inpsCig);

  // IRPEF mensile (approx: calcoliamo su base annua e dividiamo)
  const redditoAnnuoStimato = imponibileIrpef * 12;
  const irpefLordaAnnua = calcIrpefLorda(redditoAnnuoStimato);
  const detrazioneAnnua = calcDetrazioneLavoro(redditoAnnuoStimato);
  const irpefNettaAnnua = Math.max(0, irpefLordaAnnua - detrazioneAnnua);
  const irpefMese = round(irpefNettaAnnua / 12);

  // Addizionali (gen-nov, rate mensili)
  const addRegMese = meseIdx < 11 ? round(ADDIZIONALE_REGIONALE_ANNUA / 11) : 0;
  const addComMese = meseIdx < 11 ? round(ADDIZIONALE_COMUNALE_ANNUA / 11) : 0;
  const accComMese = meseIdx < 11 ? round(ACCONTO_COMUNALE_ANNUA / 11) : 0;
  const addRegResiduo = round(ADDIZIONALE_REGIONALE_ANNUA - addRegMese * meseIdx);
  const addComResiduo = round(ADDIZIONALE_COMUNALE_ANNUA - addComMese * meseIdx);
  const accComResiduo = round(ACCONTO_COMUNALE_ANNUA - accComMese * meseIdx);

  // Totale trattenute
  const totaleTrattenute = round(inpsIvs + inpsCig + irpefMese + addRegMese + addComMese + accComMese);

  // Netto: competenze - trattenute + rimborsi spese (esenti)
  const netto = round(totaleCompetenze - totaleTrattenute + totaleRimborsi);

  // TFR
  const tfrQuota = round(totaleCompetenze / 13.5);

  // Ferie e permessi
  const ferie = FERIE[meseIdx];
  const permessi = PERMESSI[meseIdx];

  // Costo azienda
  const costoVoci = calcCostoAzienda(imponibileInps);

  // Progressivi (cumulativi)
  let progInps = 0, progIrpef = 0, progIrpefPagata = 0;
  for (let i = 0; i <= meseIdx; i++) {
    const [oO, oT, oS] = ORE_MESE[i];
    const oTot = oO + oT + oS;
    const ret = round(TOTALE_RETRIBUZIONE * (oTot / 168));
    const stra = oS > 0 ? round(oS * (TOTALE_RETRIBUZIONE / 168) * 1.25) : 0;
    let comp = ret + stra;
    if (BONUS[i]) comp += BONUS[i].importo;
    progInps += comp;
    const iIvs = round(comp * ALIQUOTA_INPS / 100);
    const iCig = round(comp * ALIQUOTA_INPS_CIG / 100);
    progIrpef += round(comp - iIvs - iCig);
    const rAnn = round(comp - iIvs - iCig) * 12;
    const irpLA = calcIrpefLorda(rAnn);
    const detA = calcDetrazioneLavoro(rAnn);
    progIrpefPagata += round(Math.max(0, irpLA - detA) / 12);
  }

  // ── Composizione testo ───────────────────────────

  const lines = [];
  const ln = (s = '') => lines.push(s);

  // Header
  ln('Zucchetti HR Software');
  ln(`${DIPENDENTE.azienda}`);
  ln(DIPENDENTE.indirizzo_azienda);
  ln('');
  ln(mese);
  ln(`${ANNO}`);
  ln('');

  // Dipendente
  ln(DIPENDENTE.nome);
  ln(DIPENDENTE.cf);
  ln(DIPENDENTE.nascita);
  ln(DIPENDENTE.assunzione);
  ln(`${DIPENDENTE.qualifica}Livello ${DIPENDENTE.livello}`);
  ln('');

  // Elementi retribuzione
  for (const r of RETRIBUZIONE) {
    ln(r.voce);
    ln(fmtZuc(r.importo));
  }
  ln('Centro di costo');
  ln('001 - Produzione');
  ln('');

  // Ore
  ln('Ore ordinarie');
  ln(`${fmtIt(oreOrd)}hm`);
  if (oreTel > 0) {
    ln('SmartWork./Telelav');
    ln(`${fmtIt(oreTel)}hm`);
  }
  if (oreStra > 0) {
    ln('Ore straordinarie');
    ln(`${fmtIt(oreStra)}hm`);
  }
  if (permessiGodutiMese[meseIdx] > 0) {
    ln('R.O.L./P.A.R.');
    ln(`${fmtIt(permessiGodutiMese[meseIdx])}hm`);
  }
  ln('');

  // Competenze (prefix **)
  ln(`**Z00001`);
  ln('Retribuzione');
  ln(fmtIt(retribuzioneMese));

  if (straordinarioImporto > 0) {
    ln('**Z00015');
    ln('Lavoro straordinario 25%');
    ln(fmtIt(straordinarioImporto));
  }

  if (bonus) {
    ln('**003069');
    ln(bonus.descrizione);
    ln(fmtIt(bonus.importo));
  }

  // Indennità trasferta
  if (trasferte) {
    for (const t of trasferte) {
      const importo = round(t.giorni * t.importo_giorno);
      ln(`**Z00030`);
      ln(`Ind. trasferta ${t.tipo} - ${t.luogo}`);
      ln(fmtIt(importo));
    }
  }

  // Buono pasto elettronico
  if (buoniPasto > 0) {
    ln('Buono pasto Elettronico');
    ln(`${fmtFerie(BUONI_PASTO_VALORE)}${fmtFerie(buoniPastoGG)}GG`);
    ln(`()${fmtIt(buoniPasto)}`);
  }

  // Rimborso spese anticipate (nota spese) — voce unica
  if (totaleRimborsi > 0) {
    ln(`**Z00050`);
    ln('Rimborso spese anticipate');
    ln(fmtIt(totaleRimborsi));
  }
  ln('');

  // Trattenute (prefix *)
  ln('*Z00000');
  ln('Contributo IVS');
  ln(fmtIt(imponibileInps));
  ln('%');
  ln(fmtAliqImporto(ALIQUOTA_INPS, inpsIvs));

  ln('*Z00010');
  ln('Contributo CIG');
  ln(fmtIt(imponibileInps));
  ln('%');
  ln(fmtAliqImporto(ALIQUOTA_INPS_CIG, inpsCig));

  ln('');
  ln('IRPEF lorda');
  ln(fmtIt(irpefMese));
  ln('Ritenute IRPEF');
  ln(fmtIt(irpefMese));
  ln('Imponibile IRPEF');
  ln(fmtIt(imponibileIrpef));
  ln('');

  // Addizionali
  if (addRegMese > 0) {
    ln('F09110');
    ln('Addizionale regionale');
    ln(`Residuo${fmtIt(addRegResiduo)}`);
    ln('EMILIA ROMAGNA');
    ln(fmtIt(addRegMese));
  }
  if (addComMese > 0) {
    ln('F09130');
    ln('Addizionale comunale');
    ln(`Residuo${fmtIt(addComResiduo)}`);
    ln('BOLOGNA');
    ln(fmtIt(addComMese));
  }
  if (accComMese > 0) {
    ln('F09140');
    ln('Acconto addiz. comunale');
    ln(`Residuo${fmtIt(accComResiduo)}`);
    ln('BOLOGNA');
    ln(fmtIt(accComMese));
  }
  ln('');

  // Totali (trattenute poi competenze, prima di "Goduto")
  ln(fmtIt(totaleTrattenute));
  ln(fmtIt(totaleCompetenze));
  ln('Goduto');
  ln('');

  // Ferie e permessi
  if (meseIdx === 11) {
    // Dicembre: 3 valori (maturato, goduto, residuo)
    ln('Ferie');
    ln(`${fmtFerie(ferie.maturate)}${fmtFerie(ferie.godute)}${fmtFerie(ferie.residue)}ORE`);
  } else {
    // Mesi normali: 2 valori (goduto, residuo)
    ln('Ferie');
    ln(`${fmtFerie(ferie.godute)}${fmtFerie(ferie.residue)}ORE`);
  }
  ln('Perm.P.A.R.');
  ln(`${fmtFerie(permessi.goduti)}${fmtFerie(permessi.residui)}ORE`);
  ln('');

  // TFR
  ln(`Retribuzione utile T.F.R.${fmtIt(totaleCompetenze)}`);
  ln(`Quota T.F.R.${fmtIt(tfrQuota)}`);
  ln('');

  // Costo azienda (C/Ditta)
  for (const v of costoVoci) {
    ln(`*003350`);
    ln(v.descrizione);
    ln('C/Ditta');
    ln(`()${fmtIt(v.importo)}`);
  }
  ln('');

  // Progressivi
  ln(`Imp. INPS`);
  ln(fmtIt(round(progInps)));
  ln(`Imp. IRPEF`);
  ln(fmtIt(round(progIrpef)));
  ln(`IRPEF pagata`);
  ln(fmtIt(round(progIrpefPagata)));
  ln('');

  // Netto
  ln(`${fmtIt(netto)}€`);
  ln('');

  // Banca
  ln(DIPENDENTE.banca);
  ln(DIPENDENTE.sede_banca);
  ln(`ABI${DIPENDENTE.abi}CAB${DIPENDENTE.cab}`);
  ln(`C/C${DIPENDENTE.cc}`);

  return lines.join('\n');
}

// ── Generazione PDF ────────────────────────────────

function createPdf(text, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Usa font monospace per mantenere il layout testuale
    doc.fontSize(8).font('Courier');

    // Scrivi il testo riga per riga
    const lines = text.split('\n');
    for (const line of lines) {
      doc.text(line, { lineBreak: true });
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

// ── Main ───────────────────────────────────────────

async function main() {
  // Crea directory output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Generazione 12 buste paga di esempio...\n');
  console.log(`Dipendente: ${DIPENDENTE.nome}`);
  console.log(`Azienda: ${DIPENDENTE.azienda}`);
  console.log(`Anno: ${ANNO}\n`);

  for (let i = 0; i < 12; i++) {
    const text = generatePayslipText(i);
    const fileName = `busta_${MESI[i].toLowerCase()}_${ANNO}.pdf`;
    const textFileName = `busta_${MESI[i].toLowerCase()}_${ANNO}.txt`;
    const outputPath = path.join(OUTPUT_DIR, fileName);
    const textOutputPath = path.join(OUTPUT_DIR, textFileName);

    await createPdf(text, outputPath);
    fs.writeFileSync(textOutputPath, text, 'utf-8');

    // Stampa un riepilogo
    const netto = text.match(/([\d.,]+)€/)?.[1] || '?';
    const trasfInfo = TRASFERTE[i] ? ` Trasf: ${TRASFERTE[i].map(t => t.luogo).join('+')}` : '';
    const rimbInfo = RIMBORSI_SPESE[i] ? ` Rimb: ${fmtIt(RIMBORSI_SPESE[i])}` : '';
    console.log(`  ${MESI[i].padEnd(10)} → ${fileName}  |  Netto: ${netto.padStart(10)}€  |  Ferie: ${String(FERIE[i].residue).padStart(6)}${trasfInfo}${rimbInfo}`);
  }

  console.log(`\n✓ 12 PDF generati in: ${OUTPUT_DIR}`);
}

main().catch(console.error);
