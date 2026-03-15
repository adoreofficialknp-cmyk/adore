import { Router } from 'express';
import { query } from '../config/db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// ── GET /api/admin/stats ──────────────────────────────────────────────────
router.get('/stats', isAdmin, async (_req, res, next) => {
  try {
    const [ordersResult, usersResult, productsResult, recentResult] = await Promise.all([
      query(`SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue FROM orders WHERE payment_status='paid'`),
      query(`SELECT COUNT(*) AS users FROM users`),
      query(`SELECT COUNT(*) AS products FROM products`),
      query(`SELECT o.*, u.name AS user_name, u.email AS user_email
             FROM orders o LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC LIMIT 10`),
    ]);
    res.json({
      stats: {
        orders:   parseInt(ordersResult.rows[0].orders),
        revenue:  parseFloat(ordersResult.rows[0].revenue),
        users:    parseInt(usersResult.rows[0].users),
        products: parseInt(productsResult.rows[0].products),
      },
      recentOrders: recentResult.rows,
    });
  } catch (error) { next(error); }
});

// ── GET /api/admin/user-data - Cart and wishlist snapshots ────────────────
router.get('/user-data', isAdmin, async (_req, res, next) => {
  try {
    // Return empty arrays - cart/wishlist are client-side in localStorage
    // Real implementation would need a cart/wishlist table
    res.json({ carts: [], wishlists: [] });
  } catch (error) { next(error); }
});

// ── GET /api/activity ─────────────────────────────────────────────────────
// Note: frontend calls /api/activity - mount this under /api/activity too
router.get('/', isAdmin, async (_req, res, next) => {
  try {
    // Return order-based activity feed
    const result = await query(`
      SELECT
        o.id,
        u.id   AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        'order_placed' AS action,
        CONCAT('Order #', SUBSTRING(o.id, 1, 8), ' - ₹', o.total) AS details,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) { next(error); }
});

export default router;
