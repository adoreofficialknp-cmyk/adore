const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// GET /api/admin/config - get site config (admin only)
router.get('/config', async (req, res, next) => {
  try {
    const configs = await prisma.config.findMany();
    const configMap = configs.reduce((acc, c) => {
      acc[c.key] = c.value;
      return acc;
    }, {});
    res.json(configMap);
  } catch (err) { next(err); }
});

// POST /api/admin/config - update site config (admin only)
router.post('/config', async (req, res, next) => {
  try {
    const { configs } = req.body; // { key: value, ... }
    const operations = Object.entries(configs).map(([key, value]) =>
      prisma.config.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    );
    await Promise.all(operations);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: true }
      })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalProducts,
      totalUsers,
      recentOrders
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);
    res.json({ users, total });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (err) { next(err); }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [ordersByDay, topProducts, categoryRevenue] = await Promise.all([
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' },
        _sum: { total: true },
        _count: { id: true }
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.orderItem.groupBy({
        by: ['name'],
        _sum: { price: true },
        take: 10
      })
    ]);

    res.json({ ordersByDay, topProducts, categoryRevenue });
  } catch (err) { next(err); }
});

// POST /api/admin/push-notification
// Sends a push notification to all users (stub — wire to FCM or OneSignal in production)
router.post('/push-notification', async (req, res, next) => {
  try {
    const { title, body, url } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });

    const userCount = await prisma.user.count({ where: { role: 'USER' } });

    // In production: integrate with Firebase Cloud Messaging (FCM) or OneSignal here
    // Example FCM payload structure:
    // await sendFCMToAll({ notification: { title, body }, data: { url: url || '/' } })

    res.json({
      success: true,
      sent: userCount,
      message: `Notification queued for ${userCount} users`,
      payload: { title, body, url }
    });
  } catch (err) { next(err); }
});

// GET /api/admin/coupons
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(coupons);
  } catch (err) { next(err); }
});

// POST /api/admin/coupons
router.post('/coupons', async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.json(coupon);
  } catch (err) { next(err); }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── DATABASE EXPORT ──
// POST /api/admin/db/export
//
// TABLE_MAP: export key (used in JSON) → prisma client accessor (real model name)
// 'notifications' removed — no Notification model exists in schema.prisma
const TABLE_MAP = {
  users:          { model: 'user',          include: { addresses: true } },
  products:       { model: 'product' },
  coupons:        { model: 'coupon' },
  orders:         { model: 'order',         include: { items: true, address: true } },
  orderItems:     { model: 'orderItem' },
  reviews:        { model: 'review' },
  wishlistItems:  { model: 'wishlist' },
  cartItems:      { model: 'cartItem' },
  customRequests: { model: 'customRequest' },
};

router.post('/db/export', async (req, res, next) => {
  try {
    const allowed = Object.keys(TABLE_MAP);
    const tables = (req.body.tables || allowed).filter(t => TABLE_MAP[t]);
    const data = {};
    const errors = {};
    for (const table of tables) {
      const { model, include } = TABLE_MAP[table];
      try {
        data[table] = await prisma[model].findMany(include ? { include } : undefined);
      } catch (err) {
        data[table] = [];
        errors[table] = err.message;
      }
    }
    const response = { exportedAt: new Date().toISOString(), version: '1.0', data };
    if (Object.keys(errors).length) response.errors = errors;
    res.json(response);
  } catch (err) { next(err); }
});

// ── DATABASE IMPORT ──
// POST /api/admin/db/import
//
// Import order respects FK dependencies:
//   users → products → coupons → orders → orderItems → reviews → wishlistItems → cartItems → customRequests
// orderItems are embedded in orders export (include: items) but also exported standalone —
// skip standalone orderItem import if the order upsert already cascaded them.
const IMPORT_ORDER = [
  { key: 'users',          model: 'user',          stripRelations: ['cart','orders','wishlist','addresses','reviews','customRequests'] },
  { key: 'products',       model: 'product',        stripRelations: ['cartItems','orderItems','wishlist','reviews'] },
  { key: 'coupons',        model: 'coupon',         stripRelations: [] },
  { key: 'orders',         model: 'order',          stripRelations: ['items','user','address'] },
  { key: 'orderItems',     model: 'orderItem',      stripRelations: ['order','product'] },
  { key: 'reviews',        model: 'review',         stripRelations: ['user','product'] },
  { key: 'wishlistItems',  model: 'wishlist',       stripRelations: ['user','product'] },
  { key: 'cartItems',      model: 'cartItem',       stripRelations: ['cart','product'] },
  { key: 'customRequests', model: 'customRequest',  stripRelations: ['user'] },
];

router.post('/db/import', async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Invalid export file: missing data field' });

    const summary = {};
    const importErrors = {};

    for (const { key, model, stripRelations } of IMPORT_ORDER) {
      if (!data[key] || !Array.isArray(data[key])) continue;
      let count = 0;
      const errs = [];
      for (const raw of data[key]) {
        // Strip nested relation objects — only keep scalar/FK fields
        const record = { ...raw };
        for (const rel of stripRelations) delete record[rel];
        try {
          await prisma[model].upsert({
            where: { id: record.id },
            update: record,
            create: record,
          });
          count++;
        } catch (err) {
          errs.push({ id: record.id, error: err.message });
        }
      }
      summary[key] = count;
      if (errs.length) importErrors[key] = errs;
    }

    res.json({ success: true, summary, ...(Object.keys(importErrors).length ? { importErrors } : {}) });
  } catch (err) { next(err); }
});

module.exports = router;
