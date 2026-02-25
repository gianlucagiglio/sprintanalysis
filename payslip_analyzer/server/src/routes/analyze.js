import { Router } from 'express';
import multer from 'multer';
import { extractText } from '../services/pdfParser.js';
import { parsePayslip } from '../services/payslipParser.js';
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

    // 2. Analizza con parser regex
    const analysis = parsePayslip(text);

    // Log testo grezzo per debug
    logger.info({ rawText: text }, 'Testo grezzo PDF');
    logger.info({ analysis }, 'Risultato parsing');

    res.json({ success: true, data: analysis, rawText: text });
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
