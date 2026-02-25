/**
 * Heuristic email categorization based on metadata only.
 *
 * Categories: newsletter, promo, social, transactional, automated, personal
 */

const SOCIAL_DOMAINS = new Set([
  'facebookmail.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'instagram.com',
  'pinterest.com',
  'reddit.com',
  'tiktok.com',
  'youtube.com',
  'discord.com',
  'slack.com',
  'whatsapp.com',
  'telegram.org',
  'snapchat.com',
  'tumblr.com',
  'medium.com',
]);

const NEWSLETTER_PATTERNS = /newsletter|digest|weekly|daily|monthly|roundup|brief|update|bulletin/i;
const PROMO_PATTERNS = /promo|offerta|sconto|sale|deal|coupon|codice|speciale|risparmia|gratis|free|limited|esclusiv/i;
const TRANSACTIONAL_PATTERNS = /receipt|ricevuta|order|ordine|invoice|fattura|conferma|conferma|shipping|spedizione|tracking|pagamento|payment/i;
const NOREPLY_PATTERNS = /no[-_]?reply|noreply|do[-_]?not[-_]?reply|mailer[-_]?daemon|postmaster/i;

/**
 * Categorize a single email based on its metadata.
 */
export function categorize(email) {
  const from = email.from.toLowerCase();
  const subject = (email.subject || '').toLowerCase();
  const domain = extractDomain(from);
  const hasUnsubscribe = !!email.listUnsubscribe;
  const isBulk = email.precedence === 'bulk' || email.precedence === 'list';
  const isNoreply = NOREPLY_PATTERNS.test(from);
  const isGmailPromo = email.labelIds?.includes('CATEGORY_PROMOTIONS');
  const isGmailSocial = email.labelIds?.includes('CATEGORY_SOCIAL');
  const isGmailUpdates = email.labelIds?.includes('CATEGORY_UPDATES');
  const isGmailForums = email.labelIds?.includes('CATEGORY_FORUMS');

  // Social networks
  if (isGmailSocial || SOCIAL_DOMAINS.has(domain)) {
    return 'social';
  }

  // Newsletter: has unsubscribe + newsletter-like patterns
  if (hasUnsubscribe && (NEWSLETTER_PATTERNS.test(from) || NEWSLETTER_PATTERNS.test(subject))) {
    return 'newsletter';
  }

  // Promotional: Gmail category or promo patterns
  if (isGmailPromo || (hasUnsubscribe && PROMO_PATTERNS.test(subject))) {
    return 'promo';
  }

  // Transactional: receipt/order patterns (typically low volume)
  if (TRANSACTIONAL_PATTERNS.test(subject)) {
    return 'transactional';
  }

  // Automated: bulk/list precedence, noreply, or has unsubscribe
  if (isBulk || (isNoreply && hasUnsubscribe) || isGmailUpdates || isGmailForums) {
    return 'automated';
  }

  // Newsletter catch-all: has unsubscribe and noreply
  if (hasUnsubscribe && isNoreply) {
    return 'newsletter';
  }

  // Promo catch-all: has unsubscribe (not caught above)
  if (hasUnsubscribe) {
    return 'promo';
  }

  // Automated: noreply without unsubscribe
  if (isNoreply) {
    return 'automated';
  }

  return 'personal';
}

/**
 * Get category display info.
 */
export const CATEGORIES = {
  newsletter: { label: 'Newsletter', color: 'var(--color-cat-newsletter)', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  promo: { label: 'Promozionale', color: 'var(--color-cat-promo)', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  social: { label: 'Social', color: 'var(--color-cat-social)', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  transactional: { label: 'Transazionale', color: 'var(--color-cat-transactional)', bg: 'bg-green-500/10', text: 'text-green-400' },
  automated: { label: 'Automatico', color: 'var(--color-cat-automated)', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  personal: { label: 'Personale', color: 'var(--color-cat-personal)', bg: 'bg-pink-500/10', text: 'text-pink-400' },
};

function extractDomain(from) {
  const match = from.match(/@([\w.-]+)/);
  return match ? match[1] : '';
}
