import dotenv from 'dotenv';
// ⚠️  Load .env BEFORE anything else reads process.env
dotenv.config();

// ISSUE 4: Validate required environment variables at startup
const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
});

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// ── Global safety nets ────────────────────────────────────────────────────
process.on('uncaughtException',  (err)    => console.error('[Process] Uncaught Exception:',  err));
process.on('unhandledRejection', (reason) => console.error('[Process] Unhandled Rejection:', reason));

// ── Internal modules ──────────────────────────────────────────────────────
import { initDb, checkDbHealth } from './config/db.js';
import { authenticate } from './middleware/auth.js';
import { logger }                from './middleware/logger.js';
import { errorHandler }          from './middleware/error.js';

// ── Route modules ─────────────────────────────────────────────────────────
import authRoutes     from './routes/auth.js';
import productRoutes  from './routes/products.js';
import paymentRoutes  from './routes/payments.js';
import homepageRoutes from './routes/homepage.js';
import categoryRoutes from './routes/categories.js';
import userRoutes     from './routes/users.js';
import couponRoutes   from './routes/coupons.js';
import uploadRoutes        from './routes/upload.js';
import orderRoutes        from './routes/orders.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes        from './routes/admin.js';
import addressRoutes      from './routes/addresses.js';
import settingsRoutes     from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Rate limiters ─────────────────────────────────────────────────────────
// Global limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              300,             // max 300 requests per window per IP
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints — prevent brute force
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              20,              // max 20 login/register attempts per window per IP
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Upload limiter — prevent file upload abuse
const uploadLimiter = rateLimit({
  windowMs:         60 * 1000, // 1 minute
  max:              30,         // max 30 uploads per minute per IP
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, message: 'Too many uploads, please slow down.' },
});

async function start() {
  const app        = express();
  const httpServer = createServer(app);
  const PORT       = Number(process.env.PORT) || 3000;
  const isProd     = process.env.NODE_ENV === 'production';

  // ── Trust proxy (required on Render to avoid X-Forwarded-For warnings) ──
  app.set('trust proxy', 1);

  // ── CORS ──────────────────────────────────────────────────────────────
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      // In dev, allow all origins
      if (!isProd) return callback(null, true);
      // In prod, allow same-origin and any explicitly listed origins
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }));

  // ── Security headers (helmet) ─────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false,   // handled by frontend framework
    crossOriginEmbedderPolicy: false,
  }));

  // ── Compression + body parsing ────────────────────────────────────────
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // ── HTTP request logger ───────────────────────────────────────────────
  app.use(logger);

  // ── Health check — MUST be before rate limiter so Render pings never get 429
  app.get('/api/health', async (_req, res) => {
    const dbOk = await checkDbHealth();
    const status = dbOk ? 200 : 503;
    res.status(status).json({
      status:    dbOk ? 'ok' : 'degraded',
      db:        dbOk ? 'connected' : 'unavailable',
      uptime:    Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // ── Location stub (geolocation handled client-side) ───────────────────────
  app.get('/api/location', (_req, res) => {
    res.json({ country: 'India', city: 'Mumbai' });
  });

  // ── Global rate limiter ───────────────────────────────────────────────
  app.use(globalLimiter);

  // ── API routes ────────────────────────────────────────────────────────
  app.use('/api/auth',             authLimiter, authRoutes);
  app.use('/api/products',         productRoutes);
  app.use('/api/payments',         paymentRoutes);
  app.use('/api/homepage-content', homepageRoutes);
  app.use('/api/categories',       categoryRoutes);
  app.use('/api/users',            userRoutes);
  app.use('/api/coupons',          couponRoutes);
  app.use('/api/upload',           uploadLimiter, uploadRoutes);
  app.use('/api/orders',           orderRoutes);
  app.use('/api/notifications',    notificationRoutes);
  app.use('/api/admin',            adminRoutes);
  app.use('/api/activity',         adminRoutes);   // /api/activity -> admin router GET /
  app.use('/api/addresses',        addressRoutes);
  app.use('/api/settings',         settingsRoutes);

  // ── Legacy URL aliases (frontend uses these old paths) ───────────────────
  app.post('/api/create-razorpay-order', authenticate as any, async (req, res, next) => {
    req.url = '/create-order';
    (paymentRoutes as any)(req, res, next);
  });
  app.post('/api/verify-payment', authenticate as any, async (req, res, next) => {
    req.url = '/verify';
    (paymentRoutes as any)(req, res, next);
  });

  // ── WebSocket ─────────────────────────────────────────────────────────
  const wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', (ws) => {
    console.log('[WS] New connection');
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to server' }));
    ws.on('message', (msg) => console.log('[WS] Received:', msg.toString()));
    ws.on('error',   (err) => console.error('[WS] Error:', err.message));
  });

  // ── Frontend serving ──────────────────────────────────────────────────
  if (!isProd) {
    console.log('[Server] Development mode — starting Vite middleware...');
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server:  { middlewareMode: true },
        appType: 'spa',
        root:    path.join(__dirname, '..'),
      });
      // Serve local uploads in dev mode
      app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
      app.use(vite.middlewares);

      app.use('*', async (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) return next();
        try {
          const indexPath = path.resolve(__dirname, '../client/index.html');
          let template    = await fs.readFile(indexPath, 'utf-8');
          template        = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          next(e);
        }
      });

      console.log('[Server] Vite middleware ready.');
    } catch (viteErr) {
      console.error('[Server] Vite failed to initialise:', viteErr);
    }
  } else {
    // Production — serve pre-built Vite output from dist/
    const distPath = path.join(__dirname, '../dist');

    try {
      await fs.access(distPath);
      console.log('[Server] Serving static files from dist/');
    } catch {
      console.error(
        '[Server] ⚠️  dist/ not found — did the build step run? ' +
        'Render buildCommand should include: npm run build'
      );
    }

    // Serve uploaded files (fallback when Cloudinary not configured)
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use(express.static(distPath));

    // SPA catch-all — must come AFTER API routes
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ── Multer / file-upload error handler ───────────────────────────────
  app.use((err: any, _req: any, res: any, next: any) => {
    if (
      err &&
      (err.code === 'LIMIT_FILE_SIZE' ||
       err.code?.startsWith('LIMIT_') ||
       err.message?.includes('Only image'))
    ) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next(err);
  });

  // ── Global error handler (must be last) ──────────────────────────────
  app.use(errorHandler);

  // ── Start server ──────────────────────────────────────────────────────
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Server] ✅ Listening on http://0.0.0.0:${PORT}  ` +
      `(${process.env.NODE_ENV || 'development'})`
    );
  });

  // ── Initialise DB with retry (after server is up so port binds fast) ──
  await initDbWithRetry();
}

// ── DB retry logic ────────────────────────────────────────────────────────
// Render Postgres can take a few seconds to become available on cold starts.
// Retries up to 5 times with exponential backoff before giving up.
async function initDbWithRetry(maxAttempts = 5, baseDelayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await initDb();
      return; // success
    } catch (err: any) {
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt) {
        console.error(
          `[DB] ❌ All ${maxAttempts} connection attempts failed. ` +
          'Server is running but database is unavailable. Check DATABASE_URL.'
        );
        return;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s, 16s
      console.warn(
        `[DB] ⚠️  Attempt ${attempt}/${maxAttempts} failed: ${err.message}. ` +
        `Retrying in ${delay / 1000}s...`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

start();
