import { createOAuth2Client } from '../config/google.js';
import logger from '../utils/logger.js';

export default function requireAuth(req, res, next) {
  if (!req.session?.tokens) {
    return res.status(401).json({ error: 'Non autenticato' });
  }

  // Attach an authenticated OAuth2 client to the request
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(req.session.tokens);

  // Auto-refresh: listen for new tokens
  oauth2Client.on('tokens', (tokens) => {
    logger.debug('Token refreshed');
    req.session.tokens = { ...req.session.tokens, ...tokens };
  });

  req.oauth2Client = oauth2Client;
  next();
}
