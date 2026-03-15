import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── POST /api/orders — Create a new order (requires auth) ─────────────────
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, items, total, discount, coupon_id, shipping, payment_status } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'userId and items are required' });
    }
    if (!shipping?.name || !shipping?.address || !shipping?.city || !shipping?.pincode || !shipping?.phone) {
      return res.status(400).json({ success: false, message: 'Complete shipping details are required' });
    }

    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    await query(
      `INSERT INTO orders
         (id, user_id, items, total, discount, coupon_id,
          shipping_name, shipping_address, shipping_city,
          shipping_pincode, shipping_phone, payment_method,
          payment_status, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending')`,
      [
        orderId,
        userId,
        JSON.stringify(items),
        total || 0,
        discount || 0,
        coupon_id || null,
        shipping.name,
        shipping.address,
        shipping.city,
        shipping.pincode,
        shipping.phone,
        shipping.paymentMethod || 'Razorpay',
        payment_status || 'pending',
      ]
    );

    res.status(201).json({ success: true, orderId });
  } catch (error: any) {
    console.error('[Orders] create error:', error.message);
    next(error);
  }
});

// ── GET /api/orders — All orders (admin only) ─────────────────────────────
router.get('/', isAdmin, async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) { next(error); }
});

// ── GET /api/orders/user/:userId — Orders for a specific user ─────────────
router.get('/user/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    // Allow users to only see their own orders
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const result = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    // Parse items JSON for each order
    const rows = result.rows.map((o: any) => ({
      ...o,
      items: (() => {
        try { return typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []); }
        catch { return []; }
      })(),
    }));
    res.json(rows);
  } catch (error) { next(error); }
});

// ── GET /api/orders/:id — Single order ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = result.rows[0];
    order.items = (() => {
      try { return typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); }
      catch { return []; }
    })();
    res.json(order);
  } catch (error) { next(error); }
});

// ── PUT /api/orders/:id/status — Update order status (admin) ─────────────
router.put('/:id/status', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tracking_id, tracking_status } = req.body;
    const result = await query(
      `UPDATE orders SET status=$1, tracking_id=$2, tracking_status=$3 WHERE id=$4 RETURNING *`,
      [status, tracking_id || null, tracking_status || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: result.rows[0] });
  } catch (error) { next(error); }
});

// ── PUT /api/orders/:id/payment-status — Update payment status (admin) ────
router.put('/:id/payment-status', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const result = await query(
      `UPDATE orders SET payment_status=$1 WHERE id=$2 RETURNING *`,
      [payment_status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: result.rows[0] });
  } catch (error) { next(error); }
});

// ── DELETE /api/orders/:id — Delete order (admin) ─────────────────────────
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM orders WHERE id=$1 RETURNING id`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) { next(error); }
});

export default router;
