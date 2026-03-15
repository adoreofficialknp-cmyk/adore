import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('[DB] WARNING: DATABASE_URL is not set. All database operations will fail.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool client error:', err.message);
});

export const query = async (text: string, params?: any[]) => {
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    console.error('[DB] Query error:', err.message, '\nQuery:', text);
    throw err;
  }
};

export const initDb = async () => {
  console.log('[DB] Running schema initialization...');

  const safeQuery = async (sql: string, label: string) => {
    try {
      await query(sql);
      console.log(`[DB] OK ${label}`);
    } catch (err: any) {
      console.error(`[DB] WARN ${label} failed (non-fatal):`, err.message);
    }
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  // id is TEXT so it accepts both old integer ids AND new UUID/string ids
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      email      TEXT UNIQUE,
      phone      TEXT UNIQUE,
      name       TEXT,
      role       TEXT DEFAULT 'user',
      address    TEXT,
      city       TEXT,
      pincode    TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'users table');

  // Migrate existing users table: change id from SERIAL/INTEGER to TEXT
  // This is safe: USING id::TEXT converts integers to their string representation
  // Convert users.id from SERIAL/INTEGER to TEXT (preserves all existing rows as "1","2",...)
  await safeQuery(`
    DO $$ BEGIN
      -- Drop the serial sequence default if it exists
      ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
    EXCEPTION WHEN others THEN null; END $$;
  `, 'users: drop serial default');
  await safeQuery(`ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT`, 'users: id to TEXT');
  await safeQuery(`ALTER TABLE users DROP COLUMN IF EXISTS password`, 'users: drop password');
  await safeQuery(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`, 'users: email nullable');
  await safeQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE`, 'users: add phone');
  await safeQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`, 'users: add address');
  await safeQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT`, 'users: add city');
  await safeQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode TEXT`, 'users: add pincode');

  // ── Categories ────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      image       TEXT,
      image_url   TEXT,
      type        TEXT,
      parent_id   TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'categories table');

  // Migrate categories: id and parent_id both to TEXT
  // Convert categories.id from SERIAL/INTEGER to TEXT
  await safeQuery(`
    DO $$ BEGIN
      ALTER TABLE categories ALTER COLUMN id DROP DEFAULT;
    EXCEPTION WHEN others THEN null; END $$;
  `, 'categories: drop serial default');
  await safeQuery(`ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING id::TEXT`, 'categories: id to TEXT');
  await safeQuery(`ALTER TABLE categories ALTER COLUMN parent_id TYPE TEXT USING parent_id::TEXT`, 'categories: parent_id to TEXT');
  await safeQuery(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS image TEXT`, 'categories: add image');
  // Drop old FK constraint if it exists (type mismatch between integer parent_id and text id)
  await safeQuery(`
    DO $$ BEGIN
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
    EXCEPTION WHEN others THEN null; END $$;
  `, 'categories: drop old FK constraint');

  // ── Products ──────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS products (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      description    TEXT,
      price          NUMERIC(10,2) DEFAULT 0,
      category       TEXT,
      subcategory    TEXT,
      stock          INTEGER DEFAULT 0,
      image          TEXT,
      images         TEXT DEFAULT '[]',
      is_best_seller INTEGER DEFAULT 0,
      is_top_rated   INTEGER DEFAULT 0,
      is_new         INTEGER DEFAULT 0,
      color          TEXT,
      video          TEXT,
      bond           TEXT,
      views          INTEGER DEFAULT 0,
      original_price NUMERIC(10,2),
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'products table');

  // Migrate products id to TEXT — this preserves ALL existing products
  // integers like 1, 2, 3 become "1", "2", "3" which the frontend handles fine
  // Convert products.id from SERIAL/INTEGER to TEXT (preserves all existing products as "1","2",...)
  await safeQuery(`
    DO $$ BEGIN
      ALTER TABLE products ALTER COLUMN id DROP DEFAULT;
    EXCEPTION WHEN others THEN null; END $$;
  `, 'products: drop serial default');
  await safeQuery(`ALTER TABLE products ALTER COLUMN id TYPE TEXT USING id::TEXT`, 'products: id to TEXT');
  await safeQuery(`ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`, 'products: add views');
  await safeQuery(`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2)`, 'products: add original_price');
  await safeQuery(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new INTEGER DEFAULT 0`, 'products: add is_new');
  await safeQuery(`ALTER TABLE products ADD COLUMN IF NOT EXISTS bond TEXT`, 'products: add bond');
  await safeQuery(`ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT`, 'products: add color');
  await safeQuery(`ALTER TABLE products ADD COLUMN IF NOT EXISTS video TEXT`, 'products: add video');

  // ── Homepage content ──────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS homepage_content (
      id           TEXT PRIMARY KEY,
      section_name TEXT,
      title        TEXT,
      subtitle     TEXT,
      type         TEXT,
      image_url    TEXT,
      button_text  TEXT,
      button_link  TEXT,
      link_url     TEXT,
      layout       TEXT,
      page         TEXT DEFAULT 'home',
      order_index  INTEGER DEFAULT 0,
      active       INTEGER DEFAULT 1,
      product_ids  TEXT,
      content      TEXT,
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'homepage_content table');

  await safeQuery(`ALTER TABLE homepage_content ALTER COLUMN id TYPE TEXT USING id::TEXT`, 'homepage_content: id to TEXT');
  await safeQuery(`ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS button_link TEXT`, 'homepage_content: add button_link');
  await safeQuery(`ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS link_url TEXT`, 'homepage_content: add link_url');
  await safeQuery(`ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS layout TEXT`, 'homepage_content: add layout');
  await safeQuery(`ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0`, 'homepage_content: add order_index');
  await safeQuery(`ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS section_name TEXT`, 'homepage_content: add section_name');

  // ── Coupons ───────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS coupons (
      id             SERIAL PRIMARY KEY,
      code           TEXT UNIQUE NOT NULL,
      discount_type  TEXT NOT NULL DEFAULT 'percentage',
      discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
      min_purchase   NUMERIC(10,2) DEFAULT 0,
      expiry_date    DATE,
      active         INTEGER DEFAULT 1,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'coupons table');

  // ── Orders ────────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS orders (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT,
      items               TEXT DEFAULT '[]',
      total               NUMERIC(10,2) DEFAULT 0,
      discount            NUMERIC(10,2) DEFAULT 0,
      coupon_id           TEXT,
      shipping_name       TEXT,
      shipping_address    TEXT,
      shipping_city       TEXT,
      shipping_pincode    TEXT,
      shipping_phone      TEXT,
      payment_method      TEXT DEFAULT 'Razorpay',
      payment_status      TEXT DEFAULT 'pending',
      razorpay_order_id   TEXT,
      razorpay_payment_id TEXT,
      status              TEXT DEFAULT 'pending',
      tracking_id         TEXT,
      tracking_status     TEXT,
      created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'orders table');

  // ── Notifications ─────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS notifications (
      id             SERIAL PRIMARY KEY,
      title          TEXT NOT NULL,
      message        TEXT NOT NULL,
      image          TEXT,
      target_user_id TEXT,
      is_read        INTEGER DEFAULT 0,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'notifications table');

  // ── Addresses ─────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS addresses (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT,
      name       TEXT,
      address    TEXT,
      city       TEXT,
      pincode    TEXT,
      phone      TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'addresses table');

  // ── Reviews ───────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL PRIMARY KEY,
      product_id TEXT,
      user_id    TEXT,
      user_name  TEXT,
      rating     INTEGER DEFAULT 5,
      comment    TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'reviews table');

  // ── Settings ──────────────────────────────────────────────────────────────
  await safeQuery(`
    CREATE TABLE IF NOT EXISTS settings (
      id                       SERIAL PRIMARY KEY,
      hero_title               TEXT,
      hero_subtitle            TEXT,
      hero_image               TEXT,
      brand_story              TEXT,
      gifting_title            TEXT,
      gifting_subtitle         TEXT,
      category_grid_format     TEXT,
      primary_color            TEXT,
      secondary_color          TEXT,
      font_heading             TEXT,
      font_body                TEXT,
      social_instagram         TEXT,
      social_facebook          TEXT,
      social_linkedin          TEXT,
      social_whatsapp          TEXT,
      link_privacy_policy      TEXT,
      link_terms_conditions    TEXT,
      payment_gateway_provider TEXT,
      razorpay_key_id          TEXT,
      razorpay_key_secret      TEXT,
      color_selection          TEXT,
      luxury_prices            TEXT
    )
  `, 'settings table');

  // ── Seed: categories (only if empty) ─────────────────────────────────────
  try {
    const cats = await query('SELECT COUNT(*) FROM categories');
    if (parseInt(cats.rows[0].count) === 0) {
      await query(`
        INSERT INTO categories (id, name, description, type) VALUES
          ('cat_1', 'Gold',     'Gold jewellery',     'category'),
          ('cat_2', 'Diamond',  'Diamond jewellery',  'category'),
          ('cat_3', 'Silver',   'Silver jewellery',   'category'),
          ('cat_4', 'Platinum', 'Platinum jewellery', 'category')
      `);
      console.log('[DB] Seeded default categories.');
    }
  } catch (err: any) {
    console.error('[DB] Category seed failed (non-fatal):', err.message);
  }

  // ── Seed: sample coupon (only if empty) ──────────────────────────────────
  try {
    const cp = await query('SELECT COUNT(*) FROM coupons');
    if (parseInt(cp.rows[0].count) === 0) {
      await query(`
        INSERT INTO coupons (code, discount_type, discount_value, min_purchase, expiry_date, active)
        VALUES ('WELCOME10', 'percentage', 10, 0, '2099-12-31', 1)
      `);
      console.log('[DB] Seeded default coupon.');
    }
  } catch (err: any) {
    console.error('[DB] Coupon seed failed (non-fatal):', err.message);
  }

  // ── Seed/ensure admin user ────────────────────────────────────────────────
  // Both phone numbers are checked: the one the user registered with
  // and the backup, to handle any previous login creating a non-admin account.
  try {
    const adminPhone = '+917897671348';  // User's actual number
    const adminPhoneAlt = '+917897681348'; // Previous seed (typo in earlier version)
    const adminId = 'admin_7897671348';

    // First: try the correct phone number
    let existing = await query('SELECT id FROM users WHERE phone = $1', [adminPhone]);

    if (!existing.rowCount || existing.rowCount === 0) {
      // Check the alt number from previous seed
      const existingAlt = await query('SELECT id FROM users WHERE phone = $1', [adminPhoneAlt]);
      if (existingAlt.rowCount && existingAlt.rowCount > 0) {
        // Found user with old typo number - update phone AND role to admin
        await query(`UPDATE users SET phone = $1, role = 'admin' WHERE phone = $2`, [adminPhone, adminPhoneAlt]);
        console.log('[DB] Admin phone corrected and role confirmed.');
      } else {
        // No admin exists at all - create one
        await query(
          `INSERT INTO users (id, phone, name, role) VALUES ($1, $2, $3, 'admin')
           ON CONFLICT (phone) DO UPDATE SET role = 'admin'`,
          [adminId, adminPhone, 'Admin']
        );
        console.log('[DB] Admin user created for ' + adminPhone);
      }
    } else {
      // User exists with correct phone - ensure role is admin
      await query(`UPDATE users SET role = 'admin' WHERE phone = $1`, [adminPhone]);
      console.log('[DB] Admin role confirmed for ' + adminPhone);
    }
  } catch (err: any) {
    console.error('[DB] Admin seed failed (non-fatal):', err.message);
  }

  console.log('[DB] Schema initialization complete.');
};

export default pool;

export const checkDbHealth = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};
