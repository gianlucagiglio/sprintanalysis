import { listMessageIds, batchGetMetadata } from './gmail.js';
import logger from '../utils/logger.js';

/**
 * Scan inbox and emit progress via SSE callback.
 *
 * @param {object} oauth2Client - Authenticated Google OAuth2 client
 * @param {function} emit - SSE emitter: (event, data) => void
 * @param {AbortSignal} signal - Abort signal for cancellation
 */
export async function scanInbox(oauth2Client, emit, signal) {
  emit('status', { phase: 'listing', message: 'Raccogliendo ID messaggi...' });

  // Phase 1: Collect all message IDs
  const allIds = [];
  for await (const page of listMessageIds(oauth2Client)) {
    if (signal?.aborted) {
      emit('cancelled', {});
      return;
    }
    allIds.push(...page.map((m) => m.id));
    emit('listing', { collected: allIds.length });
  }

  const totalMessages = allIds.length;
  emit('status', {
    phase: 'fetching',
    message: `Trovati ${totalMessages} messaggi. Scaricando metadata...`,
    total: totalMessages,
  });

  if (totalMessages === 0) {
    emit('complete', { emails: [], total: 0 });
    return;
  }

  // Phase 2: Fetch metadata in batches
  const BATCH_SIZE = 50;
  const allEmails = [];
  let fetched = 0;

  for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
    if (signal?.aborted) {
      emit('cancelled', {});
      return;
    }

    const batch = allIds.slice(i, i + BATCH_SIZE);

    try {
      const emails = await batchGetMetadata(oauth2Client, batch);
      allEmails.push(...emails);
      fetched += batch.length;

      emit('progress', {
        fetched,
        total: totalMessages,
        percent: Math.round((fetched / totalMessages) * 100),
        batch: emails,
      });
    } catch (err) {
      logger.error({ err, batch: i }, 'Batch fetch failed');
      fetched += batch.length; // skip failed batch
      emit('error', {
        message: `Errore nel batch ${i}-${i + BATCH_SIZE}: ${err.message}`,
        fetched,
        total: totalMessages,
      });
    }
  }

  emit('complete', { total: allEmails.length });
  logger.info({ total: allEmails.length }, 'Scan complete');
}
