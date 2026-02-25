import { Router } from 'express';
import { google } from 'googleapis';
import { createOAuth2Client, getAuthUrl } from '../config/google.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /auth/google - Redirect to Google consent screen
router.get('/google', authLimiter, (req, res) => {
  const oauth2Client = createOAuth2Client();
  const url = getAuthUrl(oauth2Client);
  res.redirect(url);
});

// GET /auth/callback - Exchange code for tokens
router.get('/callback', authLimiter, async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Store in session
    req.session.tokens = tokens;
    req.session.user = {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    logger.info({ email: userInfo.email }, 'User logged in');

    // Redirect to client
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/callback?success=true`);
  } catch (err) {
    logger.error({ err }, 'OAuth callback failed');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/callback?error=${encodeURIComponent(err.message)}`);
  }
});

// GET /auth/me - Get current user
router.get('/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Non autenticato' });
  }
  res.json({ user: req.session.user });
});

// POST /auth/logout - Destroy session
router.post('/logout', (req, res) => {
  const email = req.session?.user?.email;
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, 'Logout failed');
      return res.status(500).json({ error: 'Errore durante il logout' });
    }
    res.clearCookie('connect.sid');
    logger.info({ email }, 'User logged out');
    res.json({ ok: true });
  });
});

export default router;
