const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/cart
router.get('/', auth, async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true, price: true, stock: true } } }
        }
      }
    });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id }, include: { items: true } });
    res.json(cart);
  } catch (err) { next(err); }
});

// POST /api/cart/add
router.post('/add', auth, async (req, res, next) => {
  try {
    const { productId, quantity = 1, size } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, size: size || null }
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, size, price: product.price }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true, price: true, stock: true } } }
        }
      }
    });
    res.json(updatedCart);
  } catch (err) { next(err); }
});

// PUT /api/cart/item/:id
router.put('/item/:id', auth, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
    } else {
      await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity } });
    }
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true, price: true, stock: true } } }
        }
      }
    });
    res.json(cart);
  } catch (err) { next(err); }
});

// DELETE /api/cart/item/:id
router.delete('/item/:id', auth, async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true, price: true, stock: true } } }
        }
      }
    });
    res.json(cart);
  } catch (err) { next(err); }
});

// DELETE /api/cart/clear
router.delete('/clear', auth, async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
});

module.exports = router;
