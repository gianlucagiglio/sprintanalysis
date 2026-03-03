/**
 * Parser per buste paga italiane — formato Zucchetti.
 *
 * Il testo estratto da pdf-parse ha un layout specifico:
 * - Valori con trailing zeros: "2.684,27000" → 2684.27
 * - Valori concatenati: "9,19000744,39" → aliquota 9.19, importo 744.39
 * - Ferie/permessi: "56,0000066,00000ORE" → goduto 56, residuo 66
 * - Netto con simbolo: "4.669,00€"
 * - Voci competenze con prefisso ** e trattenute con *
 */

// --- Helpers ---

function parseNum(str) {
  if (!str) return null;
  str = str.trim().replace(/€/g, '');
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  const num = parseFloat(str);
  return isNaN(num) ? null : Math.round(num * 100) / 100;
}

/** Cerca la prima occorrenza di un pattern e ritorna il match */
function find(text, regex) {
  const m = text.match(regex);
  return m || null;
}

// --- Main parser ---

export function parsePayslip(rawText) {
  const text = rawText.replace(/\r\n/g, '\n');
  const lines = text.split('\n');

  const result = {
    periodo: extractPeriodo(text),
    azienda: extractAzienda(text, lines),
    dipendente: extractDipendente(text, lines),
    codice_fiscale: extractCodiceFiscale(text),
    qualifica: extractQualifica(text),
    livello: extractLivello(text),
    data_nascita: extractData(text, 'nascita'),
    data_assunzione: extractData(text, 'assunzione'),
    elementi_retribuzione: extractElementiRetribuzione(text, lines),
    competenze: extractCompetenze(text, lines),
    ore: extractOre(text, lines),
    trattenute: extractTrattenute(text, lines),
    netto: extractNetto(text),
    tfr: extractTfr(text),
    ferie_permessi: extractFeriePermessi(text, lines),
    progressivi: extractProgressivi(text),
    costo_azienda: extractCostoAzienda(text, lines),
    banca: extractBanca(text, lines),
    note: [],
  };

  // Totale lordo = totale competenze se trovato, altrimenti somma elementi
  if (!result.competenze.totale_competenze && result.elementi_retribuzione.totale) {
    result.competenze.totale_competenze = result.elementi_retribuzione.totale;
  }

  // Note automatiche
  if (result.ore.telelavoro && result.ore.telelavoro > 0) {
    result.note.push(`${result.ore.telelavoro} ore in smart working/telelavoro`);
  }
  if (result.competenze.voci.some(v => v.descrizione.toLowerCase().includes('bonus'))) {
    result.note.push('Presenza di bonus nel mese');
  }
  const rimborsoVoce = result.competenze.voci.find(v => v.descrizione.toLowerCase().includes('rimborso spese'));
  if (rimborsoVoce) {
    result.note.push(`Rimborso spese anticipate: €${rimborsoVoce.importo.toFixed(2)}`);
  }

  return result;
}

// --- Extractors ---

function extractPeriodo(text) {
  const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  for (const mese of mesi) {
    const regex = new RegExp(`(${mese})\\s*(20\\d{2})`, 'i');
    const m = text.match(regex);
    if (m) return `${mese} ${m[2]}`;
  }

  // Formato "Mese\nAnno" (su righe separate come nel Zucchetti)
  for (const mese of mesi) {
    const regex = new RegExp(`(${mese})\\n\\s*(20\\d{2})`, 'i');
    const m = text.match(regex);
    if (m) return `${mese} ${m[2]}`;
  }

  return null;
}

function extractAzienda(text, lines) {
  // Zucchetti: il nome azienda appare dopo le intestazioni, prima dell'indirizzo
  // Cerchiamo la seconda occorrenza (la prima è nell'header del template)
  // Pattern: nome azienda seguito da VIA/PIAZZA/VIALE (indirizzo)
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Cerca righe che sembrano nomi di azienda (maiuscole, con SPA/SRL/SRLS)
    if (line.match(/\b(S\.?P\.?A\.?|S\.?R\.?L\.?S?|S\.?N\.?C\.?|S\.?A\.?S\.?)\b/i) &&
        !line.includes('Zucchetti') && !line.includes('Harvard') &&
        !line.includes('FINECOBANK') && line.length < 80) {
      matches.push(line);
    }
  }
  // Prendi la prima occorrenza valida
  return matches.length > 0 ? matches[0] : null;
}

function extractDipendente(text, lines) {
  // Cerca il codice fiscale persona (16 chars) e il nome sulla riga prima
  const cfRegex = /([A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z])/g;
  let match;
  const cfPositions = [];
  while ((match = cfRegex.exec(text)) !== null) {
    cfPositions.push(match.index);
  }

  if (cfPositions.length === 0) return null;

  // Per ogni CF, cerca il nome nella riga precedente
  for (const pos of cfPositions) {
    const before = text.substring(Math.max(0, pos - 200), pos);
    const beforeLines = before.split('\n').filter(l => l.trim());
    if (beforeLines.length > 0) {
      const nameLine = beforeLines[beforeLines.length - 1].trim();
      // Il nome è tipo "GIGLIO GIANLUCA" — solo lettere e spazi, tutto maiuscolo
      if (nameLine.match(/^[A-ZÀÈÉÌÒÙ\s]+$/) && nameLine.length > 4 && nameLine.length < 50 &&
          !nameLine.includes('AZIENDA') && !nameLine.includes('COGNOME') &&
          !nameLine.includes('CODICE') && !nameLine.includes('PERIODO')) {
        return nameLine;
      }
    }
  }

  return null;
}

function extractCodiceFiscale(text) {
  const m = text.match(/([A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z])/);
  return m ? m[1] : null;
}

function extractQualifica(text) {
  // Zucchetti: "IMP" = Impiegato, "OPE" = Operaio, "DIR" = Dirigente, "QUA" = Quadro
  const m = text.match(/\b(IMP|OPE|DIR|QUA)\s*(?:Livello|Liv\.?)?/);
  if (m) {
    const map = { IMP: 'Impiegato', OPE: 'Operaio', DIR: 'Dirigente', QUA: 'Quadro' };
    return map[m[1]] || m[1];
  }
  return null;
}

function extractLivello(text) {
  // Zucchetti: "IMPLivello 8Q" o "Livello 5S"
  const m = text.match(/(?:IMP|OPE|DIR|QUA)?Livello\s*(\w+)/i);
  return m ? m[1] : null;
}

function extractData(text, tipo) {
  // Zucchetti: le date nascita e assunzione sono vicine a "IMPLivello"
  // Pattern: "GGLGLC82T08I862Z\n08-12-1982\n03-06-2024\nIMPLivello"
  const cfPattern = /[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\n(\d{2}-\d{2}-\d{4})\n(\d{2}-\d{2}-\d{4})\n/;
  const m = text.match(cfPattern);
  // Cerchiamo il secondo match (il primo CF potrebbe essere nell'header)
  const allMatches = [...text.matchAll(new RegExp(cfPattern, 'g'))];

  for (const match of allMatches) {
    const date1 = match[1];
    const date2 = match[2];
    // Verifica che siano date plausibili (anno > 1950 per nascita)
    const year1 = parseInt(date1.split('-')[2]);
    const year2 = parseInt(date2.split('-')[2]);
    if (year1 > 1950 && year1 < 2010 && year2 > 2000) {
      if (tipo === 'nascita') return date1;
      if (tipo === 'assunzione') return date2;
    }
  }

  return null;
}

function extractElementiRetribuzione(text, lines) {
  // Zucchetti: blocco con voci retribuzione base, ognuna su riga con importo
  // PAGA BASE\n2.684,27000\nELEM.RETR\n59,39000\n...
  const elementi = [];
  const voceMap = {
    'PAGA BASE': 'Paga base',
    'ELEM.RETR': 'Elemento retributivo',
    'IND.FUNZ.': 'Indennità di funzione',
    'S.MINIMO': 'Superminimo',
    'IND.MENSA': 'Indennità di mensa',
    'NO LIM.OR': 'Non limitazione orario',
    'CONTINGENZA': 'Contingenza',
    'SCATTI ANZ': 'Scatti anzianità',
    'E.D.R.': 'Elemento distinto retribuzione',
    'TERZO ELEM': 'Terzo elemento',
  };

  let totale = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    for (const [pattern, label] of Object.entries(voceMap)) {
      if (line === pattern || line.startsWith(pattern)) {
        // L'importo è sulla riga successiva, formato "2.684,27000"
        if (i + 1 < lines.length) {
          const valLine = lines[i + 1].trim();
          const valMatch = valLine.match(/^([\d.,]+?)0{2,}$/); // trailing zeros
          if (valMatch) {
            const importo = parseNum(valMatch[1]);
            if (importo != null) {
              elementi.push({ voce: label, importo });
            }
          }
        }
      }
    }

    // Totale retribuzione: riga con solo un numero grande prima delle voci variabili
    // Pattern: "5.538,46000" come ultima voce del blocco
    if (line.match(/^[\d.,]+0{3}$/) && !lines[i - 1]?.trim().match(/^[A-Z]/) && i > 5) {
      const val = parseNum(line.replace(/0{3}$/, ''));
      if (val && val > 1000 && !totale) {
        // Potrebbe essere il totale retribuzione
      }
    }
  }

  // Cerca il totale retribuzione come l'ultima riga numerica prima di "Centro di costo"
  const centroIdx = text.indexOf('Centro di costo');
  if (centroIdx > 0) {
    const before = text.substring(0, centroIdx);
    const numMatches = [...before.matchAll(/([\d.]+,\d{2})000\n/g)];
    if (numMatches.length > 0) {
      const lastVal = numMatches[numMatches.length - 1][1];
      totale = parseNum(lastVal);
    }
  }

  return { voci: elementi, totale };
}

function extractCompetenze(text, lines) {
  const voci = [];

  // Zucchetti competenze: righe con prefisso ** e codice
  // **Z00001\nRetribuzione\n32,01422169,00000ORE\n5.410,40
  // **003069\nBonus\n2.562,00
  const competenzeRegex = /\*\*\w+\n(.+?)\n(?:[\d.,]+(?:ORE|GG)\n)?([\d.,]+)\n/g;
  let m;
  while ((m = competenzeRegex.exec(text)) !== null) {
    const desc = m[1].trim();
    // Gestisci il caso "32,01422169,00000ORE" — skip se è un rate+quantity
    let importoStr = m[2];
    const importo = parseNum(importoStr);
    if (importo != null && !desc.includes('C/Ditta')) {
      voci.push({ descrizione: desc, importo });
    }
  }

  // Buono pasto: "Buono pasto Elettronico\n6,0000015,00000GG\n()90,00"
  // Il () indica che è un beneficio in kind, il valore è dopo ()
  const buonoPasto = text.match(/Buono\s*pasto[^\n]*\n[^\n]*\n\(\)([\d.,]+)/);
  if (buonoPasto) {
    const importo = parseNum(buonoPasto[1]);
    if (importo) voci.push({ descrizione: 'Buono pasto', importo, in_kind: true });
  }

  // Rimborso spese anticipate — cerca con o senza prefisso **, vari formati
  const hasRimborso = voci.some(v => v.descrizione.toLowerCase().includes('rimborso spese'));
  if (!hasRimborso) {
    const rimborsoPatterns = [
      // "Rimborso spese anticipate\n110,90"
      /[Rr]imborso\s+spese\s+anticipat[ei]?\n([\d.,]+)/,
      // "Rimb. spese anticipate\n110,90"
      /[Rr]imb\.?\s+spese\s+anticipat[ei]?\n([\d.,]+)/,
      // "Rimborso spese\n110,90"
      /[Rr]imborso\s+spese\n([\d.,]+)/,
      // "RIMBORSO SPESE ANTICIPATE\n110,90" (tutto maiuscolo)
      /RIMBORSO\s+SPESE[^\n]*\n([\d.,]+)/,
      // "Rimborso spese anticipate 110,90" (stessa riga)
      /[Rr]imborso\s+spese\s+anticipat[ei]?\s+([\d.,]+)/,
      // "Rimb.spese ant.\n110,90" (abbreviato senza spazi)
      /[Rr]imb\.?\s*spese\s*ant[.\w]*\n([\d.,]+)/,
    ];
    for (const rx of rimborsoPatterns) {
      const rm = text.match(rx);
      if (rm) {
        const importo = parseNum(rm[1]);
        if (importo != null) {
          voci.push({ descrizione: 'Rimborso spese anticipate', importo });
          break;
        }
      }
    }
  }

  // Arrotondamento
  const arrotMatch = text.match(/Arrotond.*?\n([\d.,]+)/);
  if (arrotMatch) {
    const importo = parseNum(arrotMatch[1]);
    if (importo) voci.push({ descrizione: 'Arrotondamento mese precedente', importo });
  }

  // Totale competenze e totale trattenute
  // Nel Zucchetti appaiono come due numeri su righe vicine prima dei progressivi
  // Pattern: "3.432,09\n8.100,46" dove il primo è trattenute e il secondo competenze
  let totale_competenze = null;
  let totale_trattenute_raw = null;

  // Cerchiamo il pattern dei totali: due numeri > 1000 su righe consecutive
  // vicino a "Goduto" o "Imp. INPS"
  const totalsMatch = text.match(/([\d.]+,\d{2})\n([\d.]+,\d{2})\nGoduto/);
  if (totalsMatch) {
    totale_trattenute_raw = parseNum(totalsMatch[1]);
    totale_competenze = parseNum(totalsMatch[2]);
  }

  return {
    voci,
    totale_competenze,
    _totale_trattenute_raw: totale_trattenute_raw,
  };
}

function extractOre(text, lines) {
  const result = {
    ordinarie: null,
    straordinario: null,
    telelavoro: null,
    rol_par: null,
  };

  // Zucchetti: "Ore ordinarie\n80,30hm"
  const ordMatch = text.match(/[Oo]re\s*ordinarie\n([\d.,]+)hm/);
  if (ordMatch) result.ordinarie = parseNum(ordMatch[1]);

  // Ore straordinarie
  const straMatch = text.match(/[Oo]re\s*straordinarie?\n([\d.,]+)hm/);
  if (straMatch) result.straordinario = parseNum(straMatch[1]);

  // Telelavoro/SmartWork: "SmartWork./Telelav\n75,30hm"
  const telMatch = text.match(/(?:SmartWork|Telelav)[.\w/]*\n([\d.,]+)hm/);
  if (telMatch) result.telelavoro = parseNum(telMatch[1]);

  // ROL/PAR: "R.O.L./P.A.R.\n4,00hm"
  const rolMatch = text.match(/R\.O\.L\.\/?P\.A\.R\.?\n([\d.,]+)hm/);
  if (rolMatch) result.rol_par = parseNum(rolMatch[1]);

  // Ore dal blocco INPS: "4262620156,0030"
  // Formato: ?? ore ?? giorni 156,00 ore ordinarie 30 giorni settimane
  const inpsOreMatch = text.match(/(\d+),00(\d{2})\nPAGA BASE/);
  if (inpsOreMatch && !result.ordinarie) {
    result.ordinarie = parseNum(inpsOreMatch[1]);
  }

  return result;
}

function extractTrattenute(text, lines) {
  const trattenute = {
    contributi_inps: [],
    irpef_lorda: null,
    ritenute_irpef: null,
    addizionale_regionale: null,
    addizionale_comunale: null,
    acconto_addizionale_comunale: null,
    altre: [],
    totale_trattenute: null,
  };

  // Contributo IVS (INPS principale): "*Z00000\nContributo IVS\n8.100,00\n%\n9,19000744,39"
  // Il formato concatenato è: aliquota con trailing zeros + importo: "9,19000744,39"
  const ivsRegex = /\*Z?\d+\n(Contributo\s+\w[\w\s.]*?)\n([\d.,]+)\n%\n([^\n]+)\n/g;
  let m;
  while ((m = ivsRegex.exec(text)) !== null) {
    const descrizione = m[1].trim();
    const imponibile = parseNum(m[2]);
    const combined = m[3]; // es: "9,19000744,39"

    const aliqImporto = splitAliquotaImporto(combined);

    trattenute.contributi_inps.push({
      descrizione,
      imponibile,
      aliquota: aliqImporto.aliquota,
      importo: aliqImporto.importo,
    });
  }

  // IRPEF lorda: "F02010\nIRPEF lorda\n2.526,52"
  const irpefLordaMatch = text.match(/IRPEF\s*lorda\n([\d.,]+)/);
  if (irpefLordaMatch) trattenute.irpef_lorda = parseNum(irpefLordaMatch[1]);

  // Ritenute IRPEF: "F03020\nRitenute IRPEF\n2.526,52"
  const ritenuteMatch = text.match(/Ritenute\s*IRPEF\n([\d.,]+)/);
  if (ritenuteMatch) trattenute.ritenute_irpef = parseNum(ritenuteMatch[1]);

  // Addizionale regionale: "F09110\nAddizionale regionale\nResiduo404,11\nEMILIA ROMAGNA\n67,35"
  const addRegMatch = text.match(/Addizionale\s*regionale\nResiduo([\d.,]+)\n(.+?)\n([\d.,]+)/);
  if (addRegMatch) {
    trattenute.addizionale_regionale = {
      residuo: parseNum(addRegMatch[1]),
      regione: addRegMatch[2].trim(),
      importo_mese: parseNum(addRegMatch[3]),
    };
  }

  // Addizionale comunale: "F09130\nAddizionale comunale\nResiduo152,24\nCASTEL MAGGIORE\n25,37"
  const addComMatch = text.match(/F09130\nAddizionale\s*comunale\nResiduo([\d.,]+)\n(.+?)\n([\d.,]+)/);
  if (addComMatch) {
    trattenute.addizionale_comunale = {
      residuo: parseNum(addComMatch[1]),
      comune: addComMatch[2].trim(),
      importo_mese: parseNum(addComMatch[3]),
    };
  }

  // Acconto addizionale comunale
  const accontoMatch = text.match(/Acconto\s*addiz\.\s*comunale\nResiduo([\d.,]+)\n(.+?)\n([\d.,]+)/);
  if (accontoMatch) {
    trattenute.acconto_addizionale_comunale = {
      residuo: parseNum(accontoMatch[1]),
      comune: accontoMatch[2].trim(),
      importo_mese: parseNum(accontoMatch[3]),
    };
  }

  // Imponibile IRPEF
  const impIrpefMatch = text.match(/Imponibile\s*IRPEF\n([\d.,]+)/);
  if (impIrpefMatch) trattenute.imponibile_irpef = parseNum(impIrpefMatch[1]);

  // Totale trattenute — dal blocco totali
  const competenzeObj = extractCompetenze(text, lines);
  if (competenzeObj._totale_trattenute_raw) {
    trattenute.totale_trattenute = competenzeObj._totale_trattenute_raw;
  }

  // Fallback: calcola totale trattenute
  if (!trattenute.totale_trattenute) {
    let sum = 0;
    for (const c of trattenute.contributi_inps) sum += c.importo || 0;
    sum += trattenute.ritenute_irpef || trattenute.irpef_lorda || 0;
    sum += trattenute.addizionale_regionale?.importo_mese || 0;
    sum += trattenute.addizionale_comunale?.importo_mese || 0;
    sum += trattenute.acconto_addizionale_comunale?.importo_mese || 0;
    if (sum > 0) trattenute.totale_trattenute = Math.round(sum * 100) / 100;
  }

  return trattenute;
}

/**
 * Splitta stringa concatenata aliquota+importo.
 * "9,19000744,39" → { aliquota: 9.19, importo: 744.39 }
 * "1,0000034,79" → { aliquota: 1.00, importo: 34.79 }
 * "0,3000024,30" → { aliquota: 0.30, importo: 24.30 }
 *
 * Pattern: l'aliquota ha 3+ trailing zeros prima dell'importo.
 */
function splitAliquotaImporto(combined) {
  // Cerca: numero con virgola + almeno 3 zeri + poi un altro numero con virgola
  const m = combined.match(/^(\d+,\d+?)0{3,}(\d[\d.,]*)$/);
  if (m) {
    return {
      aliquota: parseNum(m[1]),
      importo: parseNum(m[2]),
    };
  }

  // Fallback: prova split più semplice
  // "0,3000024,30" → aliq "0,30" + "000" + importo "24,30"
  const m2 = combined.match(/^(\d+,\d{2})0{3,}(\d[\d.,]*)$/);
  if (m2) {
    return {
      aliquota: parseNum(m2[1]),
      importo: parseNum(m2[2]),
    };
  }

  return { aliquota: parseNum(combined), importo: null };
}

function extractNetto(text) {
  // Zucchetti: "4.669,00€" o numero prima di €
  const euroMatch = text.match(/([\d.,]+)\s*€/);
  if (euroMatch) return parseNum(euroMatch[1]);

  // Fallback: "NETTO DEL MESE" label in Zucchetti template
  const nettoMatch = text.match(/NETTO\s*(?:DEL\s*)?MESE[:\s]*([\d.,]+)/i);
  if (nettoMatch) return parseNum(nettoMatch[1]);

  return null;
}

function extractTfr(text) {
  // "Retribuzione utile T.F.R.5.538,46\nQuota T.F.R.369,76"
  const retUtileMatch = text.match(/Retribuzione\s*utile\s*T\.?F\.?R\.?\s*([\d.,]+)/);
  const quotaMatch = text.match(/Quota\s*T\.?F\.?R\.?\s*([\d.,]+)/);

  return {
    retribuzione_utile: retUtileMatch ? parseNum(retUtileMatch[1]) : null,
    quota_mese: quotaMatch ? parseNum(quotaMatch[1]) : null,
  };
}

function extractFeriePermessi(text, lines) {
  const result = {
    ferie: { godute: null, residue: null, godute_ap: null, residue_ap: null },
    permessi_par: { goduti: null, residui: null, goduti_ap: null, residui_ap: null },
  };

  // Zucchetti layout colonne: Goduto | Residuo | Goduto AP | Residuo AP
  // I valori sono concatenati con 5 decimali: "56,0000013,3000072,00000106,00000ORE"
  const ferieFullMatch = text.match(/\nFerie\n(.+?)ORE/);
  if (ferieFullMatch) {
    const nums = extractConcatenatedNumbers(ferieFullMatch[1]);
    if (nums.length >= 4) {
      // 4 colonne: Goduto, Residuo, Goduto AP, Residuo AP
      result.ferie.godute = nums[0];
      result.ferie.residue = nums[1];
      result.ferie.godute_ap = nums[2];
      result.ferie.residue_ap = nums[3];
    } else if (nums.length === 3) {
      result.ferie.godute = nums[0];
      result.ferie.residue = nums[1];
      result.ferie.residue_ap = nums[2];
    } else if (nums.length === 2) {
      result.ferie.godute = nums[0];
      result.ferie.residue = nums[1];
    } else if (nums.length === 1) {
      result.ferie.residue = nums[0];
    }
  }

  // Permessi P.A.R: stessa logica 4 colonne
  const permFullMatch = text.match(/Perm\.?\s*P\.?A\.?R\.?\n(.+?)ORE/);
  if (permFullMatch) {
    const nums = extractConcatenatedNumbers(permFullMatch[1]);
    if (nums.length >= 4) {
      result.permessi_par.goduti = nums[0];
      result.permessi_par.residui = nums[1];
      result.permessi_par.goduti_ap = nums[2];
      result.permessi_par.residui_ap = nums[3];
    } else if (nums.length === 3) {
      result.permessi_par.goduti = nums[0];
      result.permessi_par.residui = nums[1];
      result.permessi_par.residui_ap = nums[2];
    } else if (nums.length === 2) {
      result.permessi_par.goduti = nums[0];
      result.permessi_par.residui = nums[1];
    } else if (nums.length === 1) {
      result.permessi_par.residui = nums[0];
    }
  }

  return result;
}

/** Estrae numeri concatenati con trailing zeros: "34,666666,0000046,66666" → [34.67, 6.00, 46.67] */
function extractConcatenatedNumbers(str) {
  // I numeri Zucchetti hanno 5 cifre decimali: "34,66666" "6,00000" "46,66666"
  const nums = [];
  const regex = /(\d+,\d{5})/g;
  let m;
  while ((m = regex.exec(str)) !== null) {
    const val = parseNum(m[1]);
    if (val != null) nums.push(val);
  }
  return nums;
}

function extractProgressivi(text) {
  const result = {};

  const patterns = [
    { key: 'imponibile_inps', regex: /Imp\.\s*INPS\n([\d.,]+)/ },
    { key: 'imponibile_inail', regex: /Imp\.\s*INAIL\n([\d.,]+)/ },
    { key: 'imponibile_irpef', regex: /Imp\.\s*IRPEF\n([\d.,]+)/ },
    { key: 'irpef_pagata', regex: /IRPEF\s*pagata\n([\d.,]+)/ },
  ];

  for (const { key, regex } of patterns) {
    const m = text.match(regex);
    if (m) result[key] = parseNum(m[1]);
  }

  return result;
}

function extractCostoAzienda(text, lines) {
  const voci = [];

  // Voci C/Ditta: "*003350\nF.do sicurezza metalm.-OPNC\nC/Ditta\n()0,50"
  const dittaRegex = /\*\w+\n(.+?)\nC\/Ditta\n\(\)([\d.,]+)/g;
  let m;
  while ((m = dittaRegex.exec(text)) !== null) {
    const importo = parseNum(m[2]);
    if (importo != null) {
      voci.push({ descrizione: m[1].trim(), importo });
    }
  }

  // Contributo EBM Salute e simili senza asterisco
  const ebmRegex = /Z\d+\n(.+?)\nC\/Ditta\n\(\)([\d.,]+)/g;
  while ((m = ebmRegex.exec(text)) !== null) {
    const importo = parseNum(m[2]);
    if (importo != null) {
      voci.push({ descrizione: m[1].trim(), importo });
    }
  }

  const totale = voci.reduce((sum, v) => sum + v.importo, 0);

  return { voci, totale: Math.round(totale * 100) / 100 };
}

function extractBanca(text, lines) {
  // "FINECOBANK SPA\nSEDE DI ROMA\nABI03015CAB03200\nC/C000002825748"
  const abiMatch = text.match(/ABI(\d+)CAB(\d+)/);
  const ccMatch = text.match(/C\/C(\d+)/);

  // Nome banca: riga prima di "SEDE DI"
  let nome = null;
  const sedeIdx = text.indexOf('SEDE DI');
  if (sedeIdx > 0) {
    const before = text.substring(Math.max(0, sedeIdx - 100), sedeIdx);
    const beforeLines = before.split('\n').filter(l => l.trim());
    if (beforeLines.length > 0) {
      nome = beforeLines[beforeLines.length - 1].trim();
    }
  }

  if (!abiMatch && !nome) return null;

  return {
    nome,
    abi: abiMatch ? abiMatch[1] : null,
    cab: abiMatch ? abiMatch[2] : null,
    conto: ccMatch ? ccMatch[1] : null,
  };
}
