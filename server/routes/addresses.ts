import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/addresses/:userId ────────────────────────────────────────────
router.get('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const result = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
});

// ── POST /api/addresses ───────────────────────────────────────────────────
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, name, address, city, pincode, phone, is_default } = req.body;
    if (!userId || !name || !address || !city || !pincode || !phone) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }
    // If this is default, unset others first
    if (is_default) {
      await query(`UPDATE addresses SET is_default = 0 WHERE user_id = $1`, [userId]);
    }
    const result = await query(
      `INSERT INTO addresses (user_id, name, address, city, pincode, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, name, address, city, pincode, phone, is_default ? 1 : 0]
    );
    res.status(201).json({ success: true, address: result.rows[0] });
  } catch (error) { next(error); }
});

// ── PUT /api/addresses/:id/default ────────────────────────────────────────
router.put('/:id/default', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    // Get userId from address
    const addrResult = await query(`SELECT user_id FROM addresses WHERE id = $1`, [id]);
    if (addrResult.rowCount === 0) return res.status(404).json({ success: false, message: 'Address not found' });
    const userId = addrResult.rows[0].user_id;
    await query(`UPDATE addresses SET is_default = 0 WHERE user_id = $1`, [userId]);
    await query(`UPDATE addresses SET is_default = 1 WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// ── DELETE /api/addresses/:id ─────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM addresses WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
