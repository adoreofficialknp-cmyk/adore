import { Router } from 'express';
import { query } from '../config/db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// ── PUBLIC: list all active coupons ───────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, code, discount_type, discount_value, min_purchase, expiry_date, active, created_at
       FROM coupons
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// ── PUBLIC: validate a coupon code ────────────────────────────────────────
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await query(
      `SELECT id, code, discount_type, discount_value, min_purchase, expiry_date, active
       FROM coupons
       WHERE UPPER(code) = UPPER($1) AND active = 1`,
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found or inactive' });
    }

    const coupon = result.rows[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: create coupon ──────────────────────────────────────────────────
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const { code, discount_type, discount_value, min_purchase, expiry_date, active } = req.body;

    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ success: false, message: 'code, discount_type, and discount_value are required' });
    }

    const result = await query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_purchase, expiry_date, active)
       VALUES (UPPER($1), $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        code,
        discount_type,
        discount_value,
        min_purchase || 0,
        expiry_date || null,
        active !== undefined ? (active ? 1 : 0) : 1,
      ]
    );

    res.status(201).json({ success: true, coupon: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    next(error);
  }
});

// ── ADMIN: update coupon ──────────────────────────────────────────────────
router.put('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_purchase, expiry_date, active } = req.body;

    const result = await query(
      `UPDATE coupons SET
         code           = UPPER($1),
         discount_type  = $2,
         discount_value = $3,
         min_purchase   = $4,
         expiry_date    = $5,
         active         = $6
       WHERE id = $7
       RETURNING *`,
      [
        code,
        discount_type,
        discount_value,
        min_purchase || 0,
        expiry_date || null,
        active !== undefined ? (active ? 1 : 0) : 1,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, coupon: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: delete coupon ──────────────────────────────────────────────────
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
