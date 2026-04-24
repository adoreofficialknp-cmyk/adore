const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/products - list with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      category, search, sort = 'createdAt', order = 'desc',
      page = 1, limit = 20, minPrice, maxPrice, gender, tag, color, material
    } = req.query;

    const where = { isActive: true };
    if (category && category !== 'all') where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    // Gender filter: match tags or subcategory
    if (gender) {
      where.OR = [
        { tags: { has: gender.toLowerCase() } },
        { subcategory: { contains: gender, mode: 'insensitive' } }
      ];
    }
    // Tag filter (for bond shop)
    if (tag) {
      where.tags = { has: tag.toLowerCase() };
    }
    // Material filter: match tags, subcategory, or name containing the material
    if (material) {
      const matLower = material.toLowerCase();
      const matHyphen = matLower.replace(' ', '-');
      where.OR = [
        { tags: { has: matLower } },
        { tags: { has: matHyphen } },
        { name: { contains: material, mode: 'insensitive' } },
        { description: { contains: material, mode: 'insensitive' } },
        { subcategory: { contains: material, mode: 'insensitive' } }
      ];
    }

    // Color filter: match tags or name/description containing the color
    if (color) {
      const colorLower = color.toLowerCase();
      where.OR = [
        { tags: { has: colorLower } },
        { name: { contains: color, mode: 'insensitive' } },
        { description: { contains: color, mode: 'insensitive' } },
        { subcategory: { contains: color, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

// GET /api/products/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true }
    });
    res.json(categories);
  } catch (err) { next(err); }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// POST /api/products - admin only
router.post('/', auth, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, originalPrice,
            category, subcategory, stock, tags, images, isActive } = req.body
    const product = await prisma.product.create({
      data: { name, description, price, originalPrice,
              category, subcategory, stock, tags, images, isActive }
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// PUT /api/products/:id - admin only
router.put('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, originalPrice,
            category, subcategory, stock, tags, images, isActive } = req.body
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, price, originalPrice,
              category, subcategory, stock, tags, images, isActive }
    });
    res.json(product);
  } catch (err) { next(err); }
});

// DELETE /api/products/:id - admin only
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Product deactivated' });
  } catch (err) { next(err); }
});

// POST /api/products/:id/review
router.post('/:id/review', auth, async (req, res, next) => {
  try {
    const { rating, title, body } = req.body;
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId: req.params.id } },
      create: { userId: req.user.id, productId: req.params.id, rating, title, body },
      update: { rating, title, body }
    });

    // Update product rating
    const agg = await prisma.review.aggregate({
      where: { productId: req.params.id },
      _avg: { rating: true },
      _count: { id: true }
    });
    await prisma.product.update({
      where: { id: req.params.id },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count.id }
    });

    res.json(review);
  } catch (err) { next(err); }
});

module.exports = router;
