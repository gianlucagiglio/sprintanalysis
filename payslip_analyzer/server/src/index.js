import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import logger from './utils/logger.js';
import analyzeRoutes from './routes/analyze.js';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Payslip Analyzer server avviato');
});
