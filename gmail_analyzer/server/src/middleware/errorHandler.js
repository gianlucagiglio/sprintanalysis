import logger from '../utils/logger.js';

export default function errorHandler(err, req, res, _next) {
  logger.error({ err, path: req.path }, 'Unhandled error');

  if (err.code === 401 || err.response?.status === 401) {
    req.session?.destroy();
    return res.status(401).json({ error: 'Sessione scaduta, effettua di nuovo il login' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Errore interno del server',
  });
}
