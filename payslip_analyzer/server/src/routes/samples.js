import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// GET /api/samples/:filename — scarica un sample PDF
router.get('/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // prevent traversal
  const filePath = path.join(SAMPLES_DIR, filename);

  if (!fs.existsSync(filePath) || !filename.endsWith('.pdf')) {
    return res.status(404).json({ error: 'File non trovato' });
  }

  res.sendFile(filePath);
});

export default router;
