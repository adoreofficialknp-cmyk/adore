import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const razorpayConfigured = !!(
  process.env.RAZORPAY_KEY_ID?.trim() &&
  process.env.RAZORPAY_KEY_SECRET?.trim()
);

if (!razorpayConfigured) {
  console.warn('[Payments] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set — payment routes return 503.');
}

let razorpayInstance: Razorpay | null = null;
const getRazorpay = (): Razorpay | null => {
  if (!razorpayConfigured) return null;
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
};

// ── POST /api/payments/create-order
// Also aliased as /api/create-razorpay-order via server/index.ts
router.post('/create-order', authenticate, async (req: any, res, next) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please use Cash on Delivery or contact support.',
      });
    }

    const { amount, currency = 'INR' } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    const options = {
      amount:  Math.round(Number(amount) * 100), // paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await (razorpay.orders.create as Function)(options);
    res.json({ success: true, ...order });
  } catch (error: any) {
    console.error('[Payments] create-order error:', error.message);
    res.status(500).json({
      success: false,
      message: error.description || error.message || 'Failed to create payment order',
      error:   error.message,
    });
  }
});

// ── POST /api/payments/verify
// Also aliased as /api/verify-payment via server/index.ts
router.post('/verify', authenticate, async (req: any, res, next) => {
  try {
    if (!razorpayConfigured) {
      return res.status(503).json({ success: false, message: 'Payment service not configured' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const sign         = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Payment signature invalid' });
    }

    // Update order record if orderId provided
    if (orderId) {
      await query(
        `UPDATE orders SET
           payment_status = 'paid',
           razorpay_order_id = $1,
           razorpay_payment_id = $2,
           status = 'processing'
         WHERE id = $3`,
        [razorpay_order_id, razorpay_payment_id, orderId]
      );
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error: any) {
    console.error('[Payments] verify error:', error.message);
    next(error);
  }
});

export default router;
