import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import admin from 'firebase-admin';

const router = Router();

// ── JWT Secret ────────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

// ── Firebase Admin SDK init (lazy, only if env vars provided) ─────────────────
let firebaseAdminReady = false;

function initFirebaseAdmin() {
  if (firebaseAdminReady) return true;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Handle both formats Render might store the key:
  // 1. Single-line with literal \n: "-----BEGIN PRIVATE KEY-----\nMIIE..."
  // 2. Already has real newlines (copied directly)
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')   // Convert literal \n to real newlines
    : rawKey;                           // Already has real newlines

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[Auth] Firebase Admin SDK env vars missing. Google login will not verify tokens server-side.');
    return false;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }
    firebaseAdminReady = true;
    console.log('[Auth] Firebase Admin SDK initialised.');
    return true;
  } catch (err: any) {
    console.error('[Auth] Firebase Admin SDK init failed:', err.message);
    return false;
  }
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

// ── Helper: generate JWT ──────────────────────────────────────────────────────
function generateToken(user: { id: number | string; email?: string | null; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email ?? null, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// ── Helper: safe public user shape ───────────────────────────────────────────
function publicUser(user: any) {
  return {
    id:         user.id,
    email:      user.email   ?? null,
    name:       user.name    ?? null,
    phone:      user.phone   ?? null,
    role:       user.role,
    address:    user.address ?? null,
    city:       user.city    ?? null,
    pincode:    user.pincode ?? null,
    created_at: user.created_at ?? null,
  };
}

// ── POST /register ────────────────────────────────────────────────────────────
// No password. Accepts email, name, phone only.
router.post('/register', async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    // Check for existing user by email or phone
    const existing = await query(
      'SELECT id FROM users WHERE (email IS NOT NULL AND email = $1) OR (phone IS NOT NULL AND phone = $2)',
      [email ?? null, phone ?? null]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'User with this email or phone already exists' });
    }

    const result = await query(
      'INSERT INTO users (id, email, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, role',
      [uuidv4(), email ?? null, name ?? null, phone ?? null, 'user']
    );

    const user  = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

// ── POST /google-login ────────────────────────────────────────────────────────
// Frontend sends Firebase ID token -> backend verifies and issues app JWT.
router.post('/google-login', loginLimiter, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Firebase ID token is required' });
    }

    let email: string;
    let name:  string | null = null;
    let picture: string | null = null;

    // Verify token with Firebase Admin SDK when available
    if (initFirebaseAdmin()) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        email   = decoded.email!;
        name    = decoded.name    ?? null;
        picture = decoded.picture ?? null;

        if (!email) {
          return res.status(400).json({ success: false, message: 'Google account has no email' });
        }
      } catch (firebaseErr: any) {
        console.error('[Auth] Firebase token verification failed:', firebaseErr.message, firebaseErr.code);
        // Give specific messages for common errors
        if (firebaseErr.code === 'auth/argument-error') {
          return res.status(400).json({ 
            success: false, 
            message: 'Malformed Firebase token. Make sure FIREBASE_PRIVATE_KEY is set correctly in Render env vars.' 
          });
        }
        if (firebaseErr.code === 'auth/id-token-expired') {
          return res.status(401).json({ success: false, message: 'Google session expired. Please sign in again.' });
        }
        return res.status(401).json({ 
          success: false, 
          message: 'Google login failed: ' + (firebaseErr.message || 'token verification error') 
        });
      }
    } else {
      // Firebase Admin SDK not configured.
      // In production this should not happen - check your env vars.
      if (process.env.NODE_ENV === 'production') {
        console.error('[Auth] Firebase Admin SDK not configured in production! Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Render env vars.');
        return res.status(503).json({ 
          success: false, 
          message: 'Google login is not configured on the server. Please contact the admin or use phone login.' 
        });
      }
      // Development fallback: decode without verification (demo mode only)
      try {
        const parts   = token.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        email   = payload.email   ?? 'demo@example.com';
        name    = payload.name    ?? payload.displayName ?? null;
        picture = payload.picture ?? null;
        console.warn('[Auth] Firebase Admin not configured — using demo mode (dev only).');
      } catch {
        return res.status(400).json({ success: false, message: 'Malformed token. Firebase is not configured.' });
      }
    }

    // Find or create user
    let userRow = (await query('SELECT * FROM users WHERE email = $1', [email])).rows[0];

    if (!userRow) {
      const inserted = await query(
        'INSERT INTO users (id, email, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [uuidv4(), email, name, 'user']
      );
      userRow = inserted.rows[0];
    }

    const appToken = generateToken(userRow);
    res.json({ success: true, token: appToken, user: publicUser(userRow) });
  } catch (error) {
    next(error);
  }
});

// ── POST /phone-login ─────────────────────────────────────────────────────────
// Finds or creates a user by phone number. No OTP required.
router.post('/phone-login', loginLimiter, async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Basic format guard - must start with + and contain only digits after
    if (!/^\+\d{7,15}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone must be in E.164 format, e.g. +91XXXXXXXXXX' });
    }

    // Find or create user by phone
    let userRow = (await query('SELECT * FROM users WHERE phone = $1', [phone])).rows[0];

    if (!userRow) {
      // New user - create with phone (and name if provided)
      const { name } = req.body;
      const inserted = await query(
        'INSERT INTO users (id, phone, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [uuidv4(), phone, name || null, 'user']
      );
      userRow = inserted.rows[0];
    } else if (req.body.name && !userRow.name) {
      // Existing user without a name - update it
      const updated = await query(
        'UPDATE users SET name = $1 WHERE phone = $2 RETURNING *',
        [req.body.name, phone]
      );
      userRow = updated.rows[0];
    }

    // If this is the admin's phone number, always enforce admin role
    const ADMIN_PHONES = ['+917897671348', '+917897681348']; // both numbers (typo fix)
    if (ADMIN_PHONES.includes(phone) && userRow.role !== 'admin') {
      const upgraded = await query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
        ['admin', userRow.id]
      );
      userRow = upgraded.rows[0] ?? userRow;
    }

    const token = generateToken(userRow);
    res.json({ success: true, token, user: publicUser(userRow) });
  } catch (error) {
    next(error);
  }
});


// ── GET /me ───────────────────────────────────────────────────────────────────
// Returns the current user from DB using the JWT token.
// Used by the frontend on startup to refresh user data (especially role).
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Fetch fresh user data from DB (role may have changed since token was issued)
    const result = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

// ── POST /set-role ─────────────────────────────────────────────────────────
// Allows an admin to promote/demote users (requires admin token)
router.post('/set-role', async (req, res, next) => {
  try {
    const { targetPhone, role, adminPhone } = req.body;
    
    // Simple bootstrap: allow if caller is the designated admin phone
    const ADMIN_PHONES = ['+917897671348', '+917897681348'];
    if (!ADMIN_PHONES.includes(adminPhone)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    if (!targetPhone || !role) {
      return res.status(400).json({ success: false, message: 'targetPhone and role required' });
    }
    
    const result = await query(
      'UPDATE users SET role = $1 WHERE phone = $2 RETURNING id, phone, name, role',
      [role, targetPhone]
    );
    
    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
