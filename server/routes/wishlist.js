const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// ── WISHLIST ──
// GET /api/wishlist
router.get('/', auth, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(wishlist);
  } catch (err) { next(err); }
});

// POST /api/wishlist/toggle
router.post('/toggle', auth, async (req, res, next) => {
  try {
    const { productId } = req.body;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      res.json({ wishlisted: false });
    } else {
      await prisma.wishlist.create({ data: { userId: req.user.id, productId } });
      res.json({ wishlisted: true });
    }
  } catch (err) { next(err); }
});

module.exports = router;
