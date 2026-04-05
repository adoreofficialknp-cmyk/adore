const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(auth, adminOnly);

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

module.exports = router;
