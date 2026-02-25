import { google } from 'googleapis';
import quotaTracker from '../utils/quotaTracker.js';
import logger from '../utils/logger.js';

const METADATA_HEADERS = [
  'From',
  'Subject',
  'Date',
  'List-Unsubscribe',
  'Precedence',
  'X-Mailer',
];

/**
 * List all message IDs in the inbox (paginated).
 * Yields pages of { id, threadId } objects.
 */
export async function* listMessageIds(oauth2Client, { query = '', maxResults = 500 } = {}) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  let pageToken;

  do {
    await quotaTracker.waitForQuota(5);

    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      pageToken,
      q: query,
    });

    quotaTracker.record(5);

    const messages = res.data.messages || [];
    if (messages.length > 0) {
      yield messages;
    }

    pageToken = res.data.nextPageToken;
  } while (pageToken);
}

/**
 * Batch-get message metadata for a list of IDs.
 * Returns array of parsed metadata objects.
 */
export async function batchGetMetadata(oauth2Client, messageIds) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const results = [];

  // Process in chunks of 50 (batch API limit)
  const chunkSize = 50;
  for (let i = 0; i < messageIds.length; i += chunkSize) {
    const chunk = messageIds.slice(i, i + chunkSize);
    const quotaNeeded = chunk.length * 5;

    await quotaTracker.waitForQuota(quotaNeeded);

    const promises = chunk.map((id) =>
      gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'metadata',
        metadataHeaders: METADATA_HEADERS,
      })
    );

    const responses = await Promise.allSettled(promises);
    quotaTracker.record(quotaNeeded);

    for (const res of responses) {
      if (res.status === 'fulfilled') {
        results.push(parseMessage(res.value.data));
      } else {
        logger.warn({ err: res.reason?.message }, 'Failed to get message');
      }
    }
  }

  return results;
}

/**
 * Trash messages by IDs (batch, up to 1000 per call).
 * Uses batchModify to add TRASH label (works with gmail.modify scope).
 * Includes retry with backoff for rate limit errors.
 */
export async function batchDelete(oauth2Client, messageIds) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const chunkSize = 1000;

  for (let i = 0; i < messageIds.length; i += chunkSize) {
    const chunk = messageIds.slice(i, i + chunkSize);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await quotaTracker.waitForQuota(50);
        await gmail.users.messages.batchModify({
          userId: 'me',
          requestBody: {
            ids: chunk,
            addLabelIds: ['TRASH'],
            removeLabelIds: ['INBOX'],
          },
        });
        quotaTracker.record(50);
        break;
      } catch (err) {
        if (err.code === 429 && attempt < 4) {
          const wait = Math.pow(2, attempt + 1) * 1000;
          logger.warn({ attempt, wait }, 'Rate limited on trash, retrying...');
          await new Promise((r) => setTimeout(r, wait));
        } else {
          throw err;
        }
      }
    }

    // Small delay between chunks to avoid rate limits
    if (i + chunkSize < messageIds.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

/**
 * Batch modify messages (add/remove labels).
 * Includes retry with backoff for rate limit errors.
 */
export async function batchModify(oauth2Client, messageIds, { addLabels = [], removeLabels = [] }) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const chunkSize = 1000;

  for (let i = 0; i < messageIds.length; i += chunkSize) {
    const chunk = messageIds.slice(i, i + chunkSize);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await quotaTracker.waitForQuota(50);
        await gmail.users.messages.batchModify({
          userId: 'me',
          requestBody: {
            ids: chunk,
            addLabelIds: addLabels,
            removeLabelIds: removeLabels,
          },
        });
        quotaTracker.record(50);
        break;
      } catch (err) {
        if (err.code === 429 && attempt < 4) {
          const wait = Math.pow(2, attempt + 1) * 1000;
          logger.warn({ attempt, wait }, 'Rate limited on modify, retrying...');
          await new Promise((r) => setTimeout(r, wait));
        } else {
          throw err;
        }
      }
    }

    if (i + chunkSize < messageIds.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

/**
 * Create a Gmail filter.
 */
export async function createFilter(oauth2Client, { from, action }) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  await quotaTracker.waitForQuota(5);

  const result = await gmail.users.settings.filters.create({
    userId: 'me',
    requestBody: {
      criteria: { from },
      action,
    },
  });

  quotaTracker.record(5);
  return result.data;
}

/**
 * Get user profile info.
 */
export async function getProfile(oauth2Client) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  await quotaTracker.waitForQuota(5);

  const res = await gmail.users.getProfile({ userId: 'me' });
  quotaTracker.record(5);

  return res.data;
}

// --- Helpers ---

function parseMessage(msg) {
  const headers = {};
  for (const h of msg.payload?.headers || []) {
    headers[h.name] = h.value;
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    labelIds: msg.labelIds || [],
    snippet: msg.snippet,
    internalDate: Number(msg.internalDate),
    sizeEstimate: msg.sizeEstimate,
    from: headers.From || '',
    subject: headers.Subject || '',
    date: headers.Date || '',
    listUnsubscribe: headers['List-Unsubscribe'] || null,
    precedence: headers.Precedence || null,
  };
}
