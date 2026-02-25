import { Router } from 'express';
import { z } from 'zod';
import requireAuth from '../middleware/requireAuth.js';
import { batchDelete, batchModify, createFilter } from '../services/gmail.js';
import logger from '../utils/logger.js';

const router = Router();

const idsSchema = z.object({
  messageIds: z.array(z.string()).min(1).max(5000),
});

const filterSchema = z.object({
  from: z.string().min(1),
  action: z.object({
    addLabelIds: z.array(z.string()).optional(),
    removeLabelIds: z.array(z.string()).optional(),
    archive: z.boolean().optional(),
    markRead: z.boolean().optional(),
    trash: z.boolean().optional(),
  }),
});

// POST /api/actions/delete
router.post('/delete', requireAuth, async (req, res, next) => {
  try {
    const { messageIds } = idsSchema.parse(req.body);
    await batchDelete(req.oauth2Client, messageIds);
    logger.info({ count: messageIds.length, user: req.session.user?.email }, 'Messages deleted');
    res.json({ ok: true, deleted: messageIds.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dati non validi', details: err.flatten() });
    }
    next(err);
  }
});

// POST /api/actions/mark-read
router.post('/mark-read', requireAuth, async (req, res, next) => {
  try {
    const { messageIds } = idsSchema.parse(req.body);
    await batchModify(req.oauth2Client, messageIds, { removeLabels: ['UNREAD'] });
    logger.info({ count: messageIds.length }, 'Messages marked as read');
    res.json({ ok: true, modified: messageIds.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dati non validi', details: err.flatten() });
    }
    next(err);
  }
});

// POST /api/actions/create-filter
router.post('/create-filter', requireAuth, async (req, res, next) => {
  try {
    const data = filterSchema.parse(req.body);

    // Transform our simplified action to Gmail API format
    const gmailAction = {};
    if (data.action.addLabelIds) gmailAction.addLabelIds = data.action.addLabelIds;
    if (data.action.removeLabelIds) gmailAction.removeLabelIds = data.action.removeLabelIds;
    if (data.action.archive) gmailAction.removeLabelIds = [...(gmailAction.removeLabelIds || []), 'INBOX'];
    if (data.action.markRead) gmailAction.removeLabelIds = [...(gmailAction.removeLabelIds || []), 'UNREAD'];
    if (data.action.trash) gmailAction.addLabelIds = [...(gmailAction.addLabelIds || []), 'TRASH'];

    const filter = await createFilter(req.oauth2Client, {
      from: data.from,
      action: gmailAction,
    });

    logger.info({ from: data.from }, 'Filter created');
    res.json({ ok: true, filter });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dati non validi', details: err.flatten() });
    }
    next(err);
  }
});

export default router;
