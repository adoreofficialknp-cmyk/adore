const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const compression = require('compression');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes    = require('./routes/cart');
const orderRoutes   = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes   = require('./routes/admin');
const uploadRoutes  = require('./routes/upload');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes  = require('./routes/coupons');
const customRoutes  = require('./routes/custom');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const prisma = new PrismaClient();

// ── Trust proxy (required for rate-limit on Render) ──────────────────────
app.set('trust proxy', 1);

// ── Compression (gzip) ───────────────────────────────────────────────────
app.use(compression());

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// ── Rate limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Public config endpoint (non-secret, for checkout payment method availability) ──
app.get('/api/config/public', async (req, res) => {
  try {
    const configs = await prisma.config.findMany({
      where: { key: { in: ['RAZORPAY_KEY', 'CASHFREE_APP_ID', 'CASHFREE_ENV'] } }
    });
    const map = configs.reduce((acc, c) => { acc[c.key] = c.value; return acc; }, {});
    // Return whether each gateway is configured, not the actual secrets
    res.json({
      razorpay_configured: !!(map.RAZORPAY_KEY || process.env.RAZORPAY_KEY),
      cashfree_configured: !!(map.CASHFREE_APP_ID || process.env.CASHFREE_APP_ID),
      // Razorpay public key is safe to expose to frontend (it's the publishable key)
      RAZORPAY_KEY: map.RAZORPAY_KEY || process.env.RAZORPAY_KEY || '',
      CASHFREE_ENV: map.CASHFREE_ENV || process.env.CASHFREE_ENV || 'SANDBOX',
    });
  } catch (err) {
    res.json({ razorpay_configured: false, cashfree_configured: false, RAZORPAY_KEY: '', CASHFREE_ENV: 'SANDBOX' });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons',  couponRoutes);
app.use('/api/custom',   customRoutes);

// ── Serve React build in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath, { maxAge: '7d', etag: true }));
  app.get('*', (req, res) => {
    // Never intercept /api routes
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ── Database setup ────────────────────────────────────────────────────────
async function migrateDatabase() {
  try {
    // Try migrate deploy first (safe, uses migration history)
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env },
      timeout: 90000,
    });
    console.log('✅ Database migrated');
  } catch {
    // Fallback: db push for fresh databases or dev environments
    try {
      console.log('⚠️  migrate deploy failed — trying db push (safe for new DB)...');
      execSync('npx prisma db push', {
        stdio: 'inherit',
        cwd: __dirname,
        env: { ...process.env },
        timeout: 90000,
      });
      console.log('✅ Database schema pushed');
    } catch (err) {
      console.error('❌ Database setup failed:', err.message);
      process.exit(1);
    }
  }
}

async function seedDatabase() {
  try {
    const count = await prisma.product.count();
    if (count > 0) {
      console.log(`⏭  Seed skipped (${count} products already exist)`);
      return;
    }

    // Admin user
    const adminPass = await bcrypt.hash('admin@adore123', 12);
    await prisma.user.upsert({
      where: { email: 'admin@adore.com' },
      update: {},
      create: { name: 'ADORE Admin', email: 'admin@adore.com', password: adminPass, role: 'ADMIN' },
    });

    // Test user
    const userPass = await bcrypt.hash('test123', 12);
    const testUser = await prisma.user.upsert({
      where: { email: 'test@adore.com' },
      update: {},
      create: { name: 'Rahul Sharma', email: 'test@adore.com', password: userPass, role: 'USER' },
    });
    await prisma.cart.upsert({
      where: { userId: testUser.id },
      update: {},
      create: { userId: testUser.id },
    });

    const PRODUCTS = [
      { name: 'Eternal Rose Gold Solitaire Ring', description: 'A timeless solitaire ring in 18K rose gold with a brilliant-cut diamond. Perfect for proposals or as a statement piece.', price: 45000, originalPrice: 52000, category: 'Rings', subcategory: 'Solitaire', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&q=80&w=600'], stock: 15, tags: ['ring', 'rose gold', 'solitaire', 'diamond', 'bestseller', 'women'], rating: 4.8, reviewCount: 124 },
      { name: 'Pearl Cascade Necklace', description: 'Delicate freshwater pearls in an elegant cascade, set in 18K white gold. Sophisticated for formal occasions.', price: 28000, originalPrice: 35000, category: 'Necklaces', subcategory: 'Pearl', images: ['https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600'], stock: 8, tags: ['necklace', 'pearl', 'white gold', 'formal', 'women', 'mother', 'wife'], rating: 4.6, reviewCount: 89 },
      { name: 'Diamond Hoop Earrings', description: 'Classic hoops with brilliant-cut diamonds in 18K yellow gold. Lightweight and comfortable for all-day wear.', price: 32000, originalPrice: null, category: 'Earrings', subcategory: 'Hoops', images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600'], stock: 20, tags: ['earrings', 'hoops', 'diamond', 'yellow gold', 'new', 'women', 'girlfriend', 'sister'], rating: 4.9, reviewCount: 56 },
      { name: 'Sapphire Tennis Bracelet', description: 'Exquisite tennis bracelet with alternating blue sapphires and diamonds in platinum. A true heirloom piece.', price: 85000, originalPrice: 98000, category: 'Bracelets', subcategory: 'Tennis', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600'], stock: 5, tags: ['bracelet', 'sapphire', 'tennis', 'platinum', 'luxury', 'women', 'wife'], rating: 4.9, reviewCount: 34 },
      { name: 'Vintage Floral Pendant', description: 'Victorian-era inspired filigree in rose gold with a central ruby. Intricate craftsmanship for the discerning wearer.', price: 18500, originalPrice: 22000, category: 'Pendants', subcategory: 'Vintage', images: ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?auto=format&fit=crop&q=80&w=600'], stock: 12, tags: ['pendant', 'vintage', 'rose gold', 'ruby', 'floral', 'women', 'daughter'], rating: 4.7, reviewCount: 67 },
      { name: 'Emerald Cut Engagement Ring', description: 'Sophisticated 1.5ct emerald cut diamond in platinum. A symbol of eternal love and timeless elegance.', price: 125000, originalPrice: 145000, category: 'Rings', subcategory: 'Engagement', images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=600'], stock: 3, tags: ['ring', 'engagement', 'emerald cut', 'diamond', 'platinum', 'wife', 'girlfriend'], rating: 5.0, reviewCount: 28 },
      { name: 'Gold Chain Layering Necklace Set', description: 'Three delicate gold chains of varying lengths, perfect for layering and mixing for a curated look.', price: 12000, originalPrice: null, category: 'Necklaces', subcategory: 'Chains', images: ['https://images.unsplash.com/photo-1561740289-c2a31e946da0?auto=format&fit=crop&q=80&w=600'], stock: 30, tags: ['necklace', 'chain', 'layering', 'gold', 'set', 'new', 'women', 'sister'], rating: 4.5, reviewCount: 201 },
      { name: 'Ruby Stud Earrings', description: 'Vibrant Burmese rubies set in 18K rose gold. Classic, timeless and endlessly versatile for every occasion.', price: 22000, originalPrice: 26000, category: 'Earrings', subcategory: 'Studs', images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600'], stock: 18, tags: ['earrings', 'studs', 'ruby', 'rose gold', 'women', 'mother', 'daughter'], rating: 4.7, reviewCount: 93 },
      { name: "Men's Gold Cuban Link Chain", description: 'Bold 22K gold Cuban link chain for the modern man. Heavy gauge links with a secure lobster clasp.', price: 38000, originalPrice: 44000, category: 'Necklaces', subcategory: 'Chains', images: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=600'], stock: 10, tags: ['necklace', 'chain', 'gold', 'men', 'boyfriend', 'brother', 'husband'], rating: 4.6, reviewCount: 47 },
      { name: 'Silver Kada for Men', description: 'Hand-forged 925 sterling silver kada with traditional engravings. Ideal for everyday wear or gifting.', price: 6500, originalPrice: 8000, category: 'Bracelets', subcategory: 'Kada', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600'], stock: 25, tags: ['bracelet', 'kada', 'silver', 'men', 'father', 'brother', 'son'], rating: 4.4, reviewCount: 138 },
      { name: 'Bridal Kundan Necklace Set', description: 'Opulent Kundan necklace with matching earrings and maang tikka. Set in 22K gold with semi-precious stones.', price: 95000, originalPrice: 110000, category: 'Necklaces', subcategory: 'Bridal', images: ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=600'], stock: 4, tags: ['necklace', 'kundan', 'bridal', 'gold', 'women', 'wife', 'bestseller'], rating: 4.9, reviewCount: 62 },
      { name: 'Diamond Solitaire Studs', description: 'Timeless 0.5ct diamond solitaire studs in 18K white gold. The perfect everyday luxury gift.', price: 41000, originalPrice: 48000, category: 'Earrings', subcategory: 'Studs', images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600'], stock: 14, tags: ['earrings', 'studs', 'diamond', 'white gold', 'women', 'girlfriend', 'wife'], rating: 4.8, reviewCount: 81 },
    ];

    for (const p of PRODUCTS) {
      await prisma.product.create({ data: p });
    }

    const COUPONS = [
      { code: 'ADORE10',   type: 'percent', value: 10,  minOrder: 5000,  isActive: true },
      { code: 'WELCOME500', type: 'flat',   value: 500, minOrder: 3000,  isActive: true },
      { code: 'LUXURY20',  type: 'percent', value: 20,  minOrder: 50000, maxUses: 100, isActive: true },
    ];
    for (const c of COUPONS) {
      await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
    }

    console.log(`✅ Seeded: 2 users · ${PRODUCTS.length} products · ${COUPONS.length} coupons`);
    console.log('   Admin → admin@adore.com / admin@adore123');
    console.log('   User  → test@adore.com  / test123');
  } catch (err) {
    console.error('⚠️  Seed error (non-fatal):', err.message);
  }
}

// ── Boot sequence ─────────────────────────────────────────────────────────
async function startServer() {
  await migrateDatabase();
  await seedDatabase();

  // Verify DB connection
  try {
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Database connection verified');
  } catch (err) {
    console.error('❌ DB connection check failed:', err.message);
    process.exit(1);
  }

  const PORT = parseInt(process.env.PORT || '5000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ADORE server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    startKeepAlive();
  });
}

startServer().catch(err => {
  console.error('❌ Fatal startup error:', err);
  process.exit(1);
});

// ── Keep-alive ping (prevents Render free tier cold-start after 15 min) ────
function startKeepAlive() {
  if (process.env.NODE_ENV !== 'production') return;
  const base = process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 5000}`;
  setInterval(() => {
    try {
      const mod = base.startsWith('https') ? require('https') : require('http');
      mod.get(`${base}/health`, () => {}).on('error', () => {});
    } catch {}
  }, 14 * 60 * 1000);
  console.log('⏱  Keep-alive active (every 14 min)');
}

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
