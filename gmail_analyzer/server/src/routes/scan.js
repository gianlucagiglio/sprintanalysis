import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { scanInbox } from '../services/scanner.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /api/scan - SSE endpoint for inbox scanning
router.get('/', requireAuth, (req, res) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
  });

  const emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const abortController = new AbortController();

  req.on('close', () => {
    logger.debug('SSE client disconnected');
    abortController.abort();
  });

  // Send keepalive every 15s
  const keepalive = setInterval(() => {
    res.write(':keepalive\n\n');
  }, 15_000);

  scanInbox(req.oauth2Client, emit, abortController.signal)
    .catch((err) => {
      logger.error({ err }, 'Scan failed');
      emit('error', { message: err.message });
    })
    .finally(() => {
      clearInterval(keepalive);
      res.end();
    });
});

export default router;
