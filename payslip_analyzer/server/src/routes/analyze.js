import { Router } from 'express';
import multer from 'multer';
import { extractText } from '../services/pdfParser.js';
import { parsePayslip } from '../services/payslipParser.js';
import { analyzePayslip } from '../services/claudeAnalyzer.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo file PDF sono accettati'));
    }
  },
});

/**
 * Verifica se il risultato del parser regex ha i campi essenziali.
 * Se mancano, il PDF probabilmente ha un layout diverso da Zucchetti.
 */
function isParseComplete(result) {
  // Campi minimi: periodo, netto, e almeno uno tra competenze/trattenute
  if (!result.periodo) return false;
  if (result.netto == null) return false;
  if (result.competenze?.totale_competenze == null && result.trattenute?.totale_trattenute == null) return false;
  return true;
}

// POST /api/analyze - Upload PDF e analizza
router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file PDF caricato' });
  }

  try {
    logger.info({ filename: req.file.originalname, size: req.file.size }, 'PDF ricevuto');

    // 1. Estrai testo dal PDF
    const text = await extractText(req.file.buffer);

    if (!text || text.trim().length < 50) {
      return res.status(422).json({
        error: 'Il PDF non contiene testo sufficiente. Potrebbe essere un PDF scansionato (immagine).',
      });
    }

    logger.info({ textLength: text.length }, 'Testo estratto dal PDF');

    // Debug: mostra contesto intorno a "rimborso" nel testo estratto
    const rimborsoIdx = text.toLowerCase().indexOf('rimborso');
    if (rimborsoIdx >= 0) {
      const ctx = text.substring(Math.max(0, rimborsoIdx - 50), rimborsoIdx + 100);
      logger.info({ rimborso_context: ctx }, 'Testo intorno a "rimborso"');
    } else {
      logger.info('Nessuna occorrenza di "rimborso" nel testo estratto');
    }

    // 2. Prova parser regex (veloce, gratis, specifico per Zucchetti)
    const regexResult = parsePayslip(text);
    logger.info({ regexResult }, 'Risultato parser regex');

    if (isParseComplete(regexResult)) {
      logger.info('Parser regex OK — uso risultato regex');
      return res.json({ success: true, data: regexResult, source: 'regex' });
    }

    // 3. Fallback: usa Claude AI (gestisce qualsiasi layout)
    logger.info('Parser regex incompleto — fallback su Claude AI');

    if (!env.ANTHROPIC_API_KEY) {
      logger.warn('ANTHROPIC_API_KEY non configurata — restituisco risultato parziale');
      return res.json({
        success: true,
        data: regexResult,
        source: 'regex',
        warning: 'Parsing parziale: layout non riconosciuto e API key non configurata',
      });
    }

    const claudeResult = await analyzePayslip(text);
    return res.json({ success: true, data: claudeResult, source: 'claude' });

  } catch (err) {
    logger.error({ err }, 'Errore durante l\'analisi');

    if (err.message?.includes('Solo file PDF')) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({
      error: 'Errore durante l\'analisi della busta paga',
      details: err.message,
    });
  }
});

export default router;
