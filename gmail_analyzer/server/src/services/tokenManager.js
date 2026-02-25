import { createOAuth2Client } from '../config/google.js';
import logger from '../utils/logger.js';

/**
 * Ensure the OAuth2 client has valid credentials.
 * Refreshes the access token if it's expired.
 */
export async function ensureValidTokens(session) {
  if (!session?.tokens) {
    throw Object.assign(new Error('No tokens in session'), { code: 401 });
  }

  const { expiry_date, refresh_token } = session.tokens;

  // Refresh if expiring within 5 minutes
  if (expiry_date && expiry_date - Date.now() < 5 * 60 * 1000) {
    if (!refresh_token) {
      throw Object.assign(new Error('No refresh token available'), { code: 401 });
    }

    logger.debug('Proactively refreshing access token');
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(session.tokens);

    const { credentials } = await oauth2Client.refreshAccessToken();
    session.tokens = { ...session.tokens, ...credentials };
  }

  return session.tokens;
}
