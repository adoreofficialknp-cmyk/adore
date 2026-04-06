const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /api/coupons/validate
router.post('/validate', auth, async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: 'Invalid or expired coupon' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    if (orderTotal < coupon.minOrder) {
      return res.status(400).json({ error: `Minimum order ₹${coupon.minOrder} required` });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    const discount = coupon.type === 'percent'
      ? Math.round(orderTotal * coupon.value / 100)
      : coupon.value;

    res.json({ valid: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } });
  } catch (err) { next(err); }
});

// ── ADMIN COUPON MANAGEMENT ──
router.get('/', auth, adminOnly, async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(coupons);
  } catch (err) { next(err); }
});

router.post('/', auth, adminOnly, async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: { ...req.body, code: req.body.code.toUpperCase() } });
    res.status(201).json(coupon);
  } catch (err) { next(err); }
});

router.put('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
    res.json(coupon);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
