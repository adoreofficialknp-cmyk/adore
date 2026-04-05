const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Trust proxy (required for express-rate-limit on Render) ──
app.set('trust proxy', 1);

// ── Security ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// ── Rate limiting ──
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Health check (required for Render) ──
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);

// ── Serve React build in production ──
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ── Global error handler ──
app.use(errorHandler);

// ── Startup: push schema → seed → listen ────────────────────────────────────
const { execSync } = require('child_process');
const prisma = new PrismaClient();

async function ensureSchema() {
  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: __dirname,                       // runs inside /server
      env: { ...process.env },              // carries DATABASE_URL
      timeout: 60000,
    });
    console.log('✅ Database schema synced');
  } catch (err) {
    console.error('❌ prisma db push failed:', err.message);
    process.exit(1);
  }
}

async function ensureSeed() {
  try {
    // Skip if products already exist
    const count = await prisma.product.count();
    if (count > 0) { console.log(`⏭  Seed skipped (${count} products already exist)`); return; }

    // Admin user
    const adminPass = await bcrypt.hash('admin@adore123', 12);
    await prisma.user.upsert({
      where: { email: 'admin@adore.com' },
      update: {},
      create: { name: 'ADORE Admin', email: 'admin@adore.com', password: adminPass, role: 'ADMIN' },
    });

    // Test user + cart
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

    // Seed products
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
    for (const p of PRODUCTS) await prisma.product.create({ data: p });

    // Coupons
    const COUPONS = [
      { code: 'ADORE10', type: 'percent', value: 10, minOrder: 5000, isActive: true },
      { code: 'WELCOME500', type: 'flat', value: 500, minOrder: 3000, isActive: true },
      { code: 'LUXURY20', type: 'percent', value: 20, minOrder: 50000, maxUses: 100, isActive: true },
    ];
    for (const c of COUPONS) await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });

    console.log(`✅ Seeded: 2 users · ${PRODUCTS.length} products · ${COUPONS.length} coupons`);
    console.log('   Admin: admin@adore.com / admin@adore123');
    console.log('   User:  test@adore.com  / test123');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}

async function startServer() {
  await ensureSchema();    // push schema → creates all tables
  await ensureSeed();      // seed data only if empty
  await prisma.$executeRaw`SELECT 1`;
  console.log('✅ Database ready');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 ADORE Server running on port ${PORT}`);
    console.log(`📦 ENV: ${process.env.NODE_ENV || 'development'}`);
  });
}
startServer().catch(e => { console.error('❌ Failed to start server:', e); process.exit(1); });

module.exports = app;
