import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parsePayslip } from '../services/payslipParser.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const SAMPLES_DIR = path.join(__dirname, '../../../scripts/samples');

// GET /api/samples — lista dei sample PDF disponibili
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(SAMPLES_DIR)) {
      return res.json({ files: [] });
    }
    const files = fs.readdirSync(SAMPLES_DIR)
      .filter(f => f.endsWith('.pdf'))
      .sort();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel leggere i sample' });
  }
});

// POST /api/samples/analyze — analizza un sample direttamente dal testo
router.post('/analyze', (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'filename richiesto' });
  }

  const baseName = path.basename(filename, '.pdf');
  const textPath = path.join(SAMPLES_DIR, baseName + '.txt');

  if (!fs.existsSync(textPath)) {
    return res.status(404).json({ error: 'File di testo sample non trovato' });
  }

  try {
    const text = fs.readFileSync(textPath, 'utf-8');
    logger.info({ filename, textLength: text.length }, 'Analisi sample da testo');
    const result = parsePayslip(text);
    res.json({ success: true, data: result, source: 'regex' });
  } catch (err) {
    logger.error({ err, filename }, 'Errore analisi sample');
    res.status(500).json({ error: 'Errore durante l\'analisi del sample' });
  }
});

// GET /api/samples/:filename — scarica un sample PDF
router.get('/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(SAMPLES_DIR, filename);

  if (!fs.existsSync(filePath) || !filename.endsWith('.pdf')) {
    return res.status(404).json({ error: 'File non trovato' });
  }

  res.sendFile(filePath);
});

export default router;
