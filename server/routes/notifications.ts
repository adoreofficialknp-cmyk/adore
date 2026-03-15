import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/notifications/:userId ────────────────────────────────────────
router.get('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const result = await query(
      `SELECT * FROM notifications
       WHERE (target_user_id = $1 OR target_user_id IS NULL)
       ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
});

// ── POST /api/notifications — Send notification (admin) ───────────────────
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const { title, message, image, targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required' });
    }
    await query(
      `INSERT INTO notifications (title, message, image, target_user_id)
       VALUES ($1, $2, $3, $4)`,
      [title, message, image || null, targetUserId || null]
    );
    res.status(201).json({ success: true, message: 'Notification sent' });
  } catch (error) { next(error); }
});

// ── POST /api/notifications/read — Mark as read ───────────────────────────
router.post('/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { notificationId } = req.body;
    await query(`UPDATE notifications SET is_read = 1 WHERE id = $1`, [notificationId]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
