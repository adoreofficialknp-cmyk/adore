const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /api/orders - create order from cart
router.post('/', auth, async (req, res, next) => {
  try {
    const { addressId: existingAddressId, address, paymentMethod, couponCode, notes } = req.body;

    // Support inline address object from checkout (create + attach automatically)
    let addressId = existingAddressId;
    if (!addressId && address && address.line1) {
      const created = await prisma.address.create({
        data: {
          userId: req.user.id,
          name: address.name || '',
          phone: address.phone || '',
          line1: address.line1,
          line2: address.line2 || null,
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || '',
        }
      });
      addressId = created.id;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Verify stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product.name}` });
      }
    }

    let subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });
      if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          discount = coupon.type === 'percent'
            ? Math.round(subtotal * coupon.value / 100)
            : coupon.value;
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }
    }

    const total = subtotal - discount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        addressId,
        paymentMethod,
        couponCode,
        notes,
        subtotal,
        discount,
        total,
        status: paymentMethod === 'cod' ? 'CONFIRMED' : 'PENDING',
        paymentStatus: paymentMethod === 'cod' ? 'PENDING' : 'PENDING',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: item.price,
            name: item.product.name,
            image: item.product.images[0] || null
          }))
        }
      },
      include: { items: true }
    });

    // Only decrement stock and clear cart for COD orders immediately.
    // For online payments, we'll do this after verification in the payments route.
    if (paymentMethod === 'cod') {
      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(201).json(order);
  } catch (err) { next(err); }
});

// POST /api/orders/buy-now - instant single product order
router.post('/buy-now', auth, async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, addressId: existingAddressId, address, paymentMethod } = req.body;

    // Support inline address object
    let addressId = existingAddressId;
    if (!addressId && address && address.line1) {
      const created = await prisma.address.create({
        data: {
          userId: req.user.id,
          name: address.name || '',
          phone: address.phone || '',
          line1: address.line1,
          line2: address.line2 || null,
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || '',
        }
      });
      addressId = created.id;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    const total = product.price * quantity;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        addressId,
        paymentMethod,
        subtotal: total,
        discount: 0,
        total,
        status: paymentMethod === 'cod' ? 'CONFIRMED' : 'PENDING',
        items: {
          create: [{
            productId,
            quantity,
            size,
            price: product.price,
            name: product.name,
            image: product.images[0] || null
          }]
        }
      },
      include: { items: true }
    });

    if (paymentMethod === 'cod') {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }
      });
    }

    res.status(201).json(order);
  } catch (err) { next(err); }
});

// GET /api/orders/my - user's orders
router.get('/my', auth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) { next(err); }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, address: true, user: { select: { name: true, email: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(order);
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', auth, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.userId !== req.user.id) return res.status(404).json({ error: 'Order not found' });
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    // Restore stock
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// GET /api/orders - admin: all orders
router.get('/', auth, adminOnly, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);
    res.json({ orders, total });
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/status - admin
router.put('/:id/status', auth, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (err) { next(err); }
});

// DELETE /api/orders/:id - admin permanently deletes an order
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    // Delete child records first to satisfy FK constraints
    await prisma.orderItem.deleteMany({ where: { orderId: req.params.id } });
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
