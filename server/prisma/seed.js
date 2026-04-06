const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const PRODUCTS = [
  {
    name: 'Eternal Rose Gold Solitaire Ring',
    description: 'A timeless solitaire ring in 18K rose gold, featuring a brilliant-cut diamond that catches light from every angle. Perfect for proposals or as a statement piece.',
    price: 45000,
    originalPrice: 52000,
    category: 'Rings',
    subcategory: 'Solitaire',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 15,
    tags: ['ring', 'rose gold', 'solitaire', 'diamond', 'bestseller', 'women'],
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: 'Pearl Cascade Necklace',
    description: 'Delicate freshwater pearls arranged in an elegant cascade, set in 18K white gold. A sophisticated piece for formal occasions.',
    price: 28000,
    originalPrice: 35000,
    category: 'Necklaces',
    subcategory: 'Pearl',
    images: [
      'https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 8,
    tags: ['necklace', 'pearl', 'white gold', 'formal', 'women', 'mother', 'wife'],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    name: 'Diamond Hoop Earrings',
    description: 'Classic hoop earrings adorned with brilliant-cut diamonds, crafted in 18K yellow gold. Lightweight and comfortable for all-day wear.',
    price: 32000,
    originalPrice: null,
    category: 'Earrings',
    subcategory: 'Hoops',
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 20,
    tags: ['earrings', 'hoops', 'diamond', 'yellow gold', 'new', 'women', 'girlfriend', 'sister'],
    rating: 4.9,
    reviewCount: 56,
  },
  {
    name: 'Sapphire Tennis Bracelet',
    description: 'An exquisite tennis bracelet featuring alternating blue sapphires and diamonds in a platinum setting. A true heirloom piece.',
    price: 85000,
    originalPrice: 98000,
    category: 'Bracelets',
    subcategory: 'Tennis',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1573408301185-9519f94816b5?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 5,
    tags: ['bracelet', 'sapphire', 'tennis', 'platinum', 'luxury', 'women', 'wife'],
    rating: 4.9,
    reviewCount: 34,
  },
  {
    name: 'Vintage Floral Pendant',
    description: 'Inspired by Victorian-era florals, this pendant features intricate filigree work in rose gold with a central ruby.',
    price: 18500,
    originalPrice: 22000,
    category: 'Pendants',
    subcategory: 'Vintage',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9519f94816b5?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 12,
    tags: ['pendant', 'vintage', 'rose gold', 'ruby', 'floral', 'women', 'daughter'],
    rating: 4.7,
    reviewCount: 67,
  },
  {
    name: 'Emerald Cut Engagement Ring',
    description: 'The emerald cut diamond ring in platinum is a symbol of sophistication and eternal love. Features a 1.5ct center stone.',
    price: 125000,
    originalPrice: 145000,
    category: 'Rings',
    subcategory: 'Engagement',
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 3,
    tags: ['ring', 'engagement', 'emerald cut', 'diamond', 'platinum', 'wife', 'girlfriend'],
    rating: 5.0,
    reviewCount: 28,
  },
  {
    name: 'Gold Chain Layering Necklace Set',
    description: 'A set of three delicate gold chains of varying lengths, perfect for layering. Mix and match for a curated look.',
    price: 12000,
    originalPrice: null,
    category: 'Necklaces',
    subcategory: 'Chains',
    images: [
      'https://images.unsplash.com/photo-1561740289-c2a31e946da0?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 30,
    tags: ['necklace', 'chain', 'layering', 'gold', 'set', 'new', 'women', 'sister'],
    rating: 4.5,
    reviewCount: 201,
  },
  {
    name: 'Ruby Stud Earrings',
    description: 'Vibrant Burmese rubies set in 18K rose gold stud earrings. Classic, timeless and endlessly versatile.',
    price: 22000,
    originalPrice: 26000,
    category: 'Earrings',
    subcategory: 'Studs',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 18,
    tags: ['earrings', 'studs', 'ruby', 'rose gold', 'women', 'mother', 'daughter'],
    rating: 4.7,
    reviewCount: 93,
  },
  {
    name: 'Men\'s Gold Chain Necklace',
    description: 'A bold 22K gold Cuban link chain for the modern man. Heavy gauge links with a secure lobster clasp.',
    price: 38000,
    originalPrice: 44000,
    category: 'Necklaces',
    subcategory: 'Chains',
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 10,
    tags: ['necklace', 'chain', 'gold', 'men', 'boyfriend', 'brother', 'husband'],
    rating: 4.6,
    reviewCount: 47,
  },
  {
    name: 'Silver Kada Bracelet for Men',
    description: 'Hand-forged 925 sterling silver kada with traditional engravings. Ideal for everyday wear or gifting.',
    price: 6500,
    originalPrice: 8000,
    category: 'Bracelets',
    subcategory: 'Kada',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 25,
    tags: ['bracelet', 'kada', 'silver', 'men', 'father', 'brother', 'son'],
    rating: 4.4,
    reviewCount: 138,
  },
  {
    name: 'Bridal Kundan Necklace Set',
    description: 'Opulent Kundan necklace with matching earrings and maang tikka. Set in 22K gold with semi-precious stones.',
    price: 95000,
    originalPrice: 110000,
    category: 'Necklaces',
    subcategory: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 4,
    tags: ['necklace', 'kundan', 'bridal', 'gold', 'women', 'wife', 'bestseller'],
    rating: 4.9,
    reviewCount: 62,
  },
  {
    name: 'Diamond Solitaire Stud Earrings',
    description: 'Timeless 0.5ct diamond solitaire studs in 18K white gold. The perfect everyday luxury.',
    price: 41000,
    originalPrice: 48000,
    category: 'Earrings',
    subcategory: 'Studs',
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600',
    ],
    stock: 14,
    tags: ['earrings', 'studs', 'diamond', 'white gold', 'women', 'girlfriend', 'wife'],
    rating: 4.8,
    reviewCount: 81,
  },
];

const COUPONS = [
  { code: 'ADORE10', type: 'percent', value: 10, minOrder: 5000, isActive: true },
  { code: 'WELCOME500', type: 'flat', value: 500, minOrder: 3000, isActive: true },
  { code: 'LUXURY20', type: 'percent', value: 20, minOrder: 50000, maxUses: 100, isActive: true }
];

async function main() {
  console.log('🌱 Seeding ADORE database...');

  // Create admin user
  const adminPass = await bcrypt.hash('admin@adore123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adore.com' },
    update: {},
    create: {
      name: 'ADORE Admin',
      email: 'admin@adore.com',
      password: adminPass,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user:', admin.email);

  // Create test user
  const userPass = await bcrypt.hash('test123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@adore.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'test@adore.com',
      password: userPass,
      role: 'USER'
    }
  });
  await prisma.cart.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { userId: testUser.id }
  });
  console.log('✅ Test user:', testUser.email);

  // Create products — skip if already seeded
  const existingCount = await prisma.product.count();
  if (existingCount === 0) {
    for (const p of PRODUCTS) {
      await prisma.product.create({ data: p });
    }
    console.log(`✅ Created ${PRODUCTS.length} products`);
  } else {
    console.log(`⏭ Products already exist (${existingCount}), skipping`);
  }

  // Create coupons
  for (const c of COUPONS) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }
  console.log(`✅ Created ${COUPONS.length} coupons`);

  console.log('\n🎉 Seed complete!');
  console.log('Admin: admin@adore.com / admin@adore123');
  console.log('User:  test@adore.com  / test123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
