const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

// ── Razorpay ──────────────────────────────────────────────────
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// POST /api/payments/razorpay/create-order
router.post('/razorpay/create-order', auth, async (req, res, next) => {
  try {
    const { orderId } = req.body;
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
      keyId: process.env.RAZORPAY_KEY
    });
  } catch (err) { next(err); }
});

// POST /api/payments/razorpay/verify
router.post('/razorpay/verify', auth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
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
      }
    });

    res.json({ success: true, order });
  } catch (err) { next(err); }
});

// ── Cashfree ──────────────────────────────────────────────────
const { Cashfree } = require('cashfree-pg');
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET;
Cashfree.XEnvironment = process.env.NODE_ENV === 'production'
  ? Cashfree.Environment.PRODUCTION
  : Cashfree.Environment.SANDBOX;

// POST /api/payments/cashfree/create-session
router.post('/cashfree/create-session', auth, async (req, res, next) => {
  try {
    const { orderId } = req.body;
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

    const response = await Cashfree.PGFetchOrder('2023-08-01', cfOrderId);
    const cfOrder = response.data;

    if (cfOrder.order_status === 'PAID') {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: cfOrder.cf_order_id,
          status: 'CONFIRMED'
        }
      });
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
