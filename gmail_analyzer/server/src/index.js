import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env.js';
import { createSessionMiddleware } from './config/session.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scan.js';
import actionsRoutes from './routes/actions.js';

const app = express();

// Trust proxy (Render uses reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());

// Sessions
app.use(createSessionMiddleware());

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/actions', actionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server avviato');
});
