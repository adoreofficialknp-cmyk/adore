const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

// Helper to get config
async function getConfig(key) {
  const config = await prisma.config.findUnique({ where: { key } });
  return config ? config.value : process.env[key];
}

// ── Razorpay ──────────────────────────────────────────────────
const Razorpay = require('razorpay');

async function getRazorpayInstance() {
  const key_id = await getConfig('RAZORPAY_KEY');
  const key_secret = await getConfig('RAZORPAY_SECRET');
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

// POST /api/payments/razorpay/create-order
router.post('/razorpay/create-order', auth, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const razorpay = await getRazorpayInstance();
    if (!razorpay) return res.status(400).json({ error: 'Razorpay is not configured' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: 'INR',
      receipt: orderId
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: rzpOrder.id, paymentMethod: 'razorpay' }
    });

    res.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: await getConfig('RAZORPAY_KEY')
    });
  } catch (err) { next(err); }
});

// POST /api/payments/razorpay/verify
router.post('/razorpay/verify', auth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const key_secret = await getConfig('RAZORPAY_SECRET');
    if (!key_secret) return res.status(400).json({ error: 'Razorpay is not configured' });

    const expected = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
        status: 'CONFIRMED'
      },
      include: { items: true }
    });

    // Decrement stock for online payments upon verification
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

    res.json({ success: true, order });
  } catch (err) { next(err); }
});

// ── Cashfree ──────────────────────────────────────────────────
const { Cashfree } = require('cashfree-pg');

async function setupCashfree() {
  const appId = await getConfig('CASHFREE_APP_ID');
  const secret = await getConfig('CASHFREE_SECRET');
  const env = await getConfig('CASHFREE_ENV'); // PRODUCTION or SANDBOX

  if (!appId || !secret) return false;

  Cashfree.XClientId = appId;
  Cashfree.XClientSecret = secret;
  Cashfree.XEnvironment = env === 'PRODUCTION'
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;
  return true;
}

// POST /api/payments/cashfree/create-session
router.post('/cashfree/create-session', auth, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const isConfigured = await setupCashfree();
    if (!isConfigured) return res.status(400).json({ error: 'Cashfree is not configured' });

    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });
    if (!dbOrder || dbOrder.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const request = {
      order_amount: dbOrder.total,
      order_currency: 'INR',
      order_id: `ADORE_${orderId}_${Date.now()}`,
      customer_details: {
        customer_id: req.user.id,
        customer_name: dbOrder.user.name,
        customer_email: dbOrder.user.email,
        customer_phone: dbOrder.user.phone || '9999999999'
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/orders/${orderId}?payment=cashfree`
      }
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', request);
    const cfData = response.data;

    await prisma.order.update({
      where: { id: orderId },
      data: { cashfreeOrderId: cfData.order_id, paymentMethod: 'cashfree' }
    });

    res.json({
      paymentSessionId: cfData.payment_session_id,
      cfOrderId: cfData.order_id
    });
  } catch (err) { next(err); }
});

// POST /api/payments/cashfree/verify
router.post('/cashfree/verify', auth, async (req, res, next) => {
  try {
    const { cfOrderId, orderId } = req.body;
    const isConfigured = await setupCashfree();
    if (!isConfigured) return res.status(400).json({ error: 'Cashfree is not configured' });

    const response = await Cashfree.PGFetchOrder('2023-08-01', cfOrderId);
    const cfOrder = response.data;

    if (cfOrder.order_status === 'PAID') {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: cfOrder.cf_order_id,
          status: 'CONFIRMED'
        },
        include: { items: true }
      });

      // Decrement stock for online payments upon verification
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear cart
      await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

      res.json({ success: true, order });
    } else {
      res.status(400).json({ error: 'Payment not completed', status: cfOrder.order_status });
    }
  } catch (err) { next(err); }
});

// POST /api/payments/cashfree/webhook
router.post('/cashfree/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    if (body.data?.order?.order_status === 'PAID') {
      const cfOrderId = body.data.order.order_id;
      await prisma.order.updateMany({
        where: { cashfreeOrderId: cfOrderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
      });
    }
    res.json({ status: 'ok' });
  } catch { res.status(200).json({ status: 'ok' }); }
});

module.exports = router;
