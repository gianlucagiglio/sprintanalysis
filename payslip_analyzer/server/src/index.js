import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import logger from './utils/logger.js';
import analyzeRoutes from './routes/analyze.js';
import samplesRoutes from './routes/samples.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/samples', samplesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client in production
if (env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Payslip Analyzer server avviato');
});
