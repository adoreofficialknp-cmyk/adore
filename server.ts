import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import pg from "pg";
const { Pool } = pg;
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Configuration
const isPostgres = !!process.env.DATABASE_URL;
let db: any;

if (isPostgres) {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });
  console.log("Using PostgreSQL database");
} else {
  db = new Database("aura.db");
  console.log("Using SQLite database");
}

// Database Abstraction Layer
const convertPlaceholders = (sql: string) => {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
};

const query = async (sql: string, params: any[] = []) => {
  if (isPostgres) {
    const res = await db.query((() => { let i=0; return sql.replace(/\?/g, ()=>`$${++i}`); })(), params);
    return res?.rows || [];
  } else {
    return db.prepare(sql).all(...params);
  }
};

const get = async (sql: string, params: any[] = []) => {
  if (isPostgres) {
    const res = await db.query((() => { let i=0; return sql.replace(/\?/g, ()=>`$${++i}`); })(), params);
    return res?.rows?.[0] || null;
  } else {
    return db.prepare(sql).get(...params);
  }
};

const run = async (sql: string, params: any[] = []) => {
  if (isPostgres) {
    await db.query((() => { let i=0; return sql.replace(/\?/g, ()=>`$${++i}`); })(), params);
  } else {
    db.prepare(sql).run(...params);
  }
};

const exec = async (sql: string) => {
  if (isPostgres) {
    await db.query(sql);
  } else {
    db.exec(sql);
  }
};

// Initialize Database
const initDb = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      pincode TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      subcategory TEXT,
      image TEXT,
      images TEXT,
      video TEXT,
      stock INTEGER DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      parent_id TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS homepage_content (
      id TEXT PRIMARY KEY,
      type TEXT,
      title TEXT,
      subtitle TEXT,
      image_url TEXT,
      link_url TEXT,
      button_text TEXT,
      button_link TEXT,
      layout TEXT DEFAULT 'right',
      page TEXT DEFAULT 'home',
      order_index INTEGER,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      total REAL,
      status TEXT DEFAULT 'pending',
      tracking_id TEXT,
      tracking_status TEXT,
      payment_status TEXT DEFAULT 'pending',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      shipping_name TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_pincode TEXT,
      shipping_phone TEXT,
      payment_method TEXT DEFAULT 'COD',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      product_id TEXT,
      quantity INTEGER,
      price REAL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      user_id TEXT,
      product_id TEXT,
      PRIMARY KEY(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS user_activity (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      image TEXT,
      target_user_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_notifications (
      user_id TEXT,
      notification_id TEXT,
      is_read INTEGER DEFAULT 0,
      PRIMARY KEY(user_id, notification_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      user_id TEXT,
      user_name TEXT,
      rating INTEGER,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `;

  await exec(schema);

  // Handle schema updates
  try { await exec("ALTER TABLE users ADD COLUMN address TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE users ADD COLUMN city TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE users ADD COLUMN pincode TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE products ADD COLUMN images TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE products ADD COLUMN video TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE categories ADD COLUMN image TEXT"); } catch(e) {}
  
  // Homepage Content Migrations
  try { await exec("ALTER TABLE homepage_content RENAME COLUMN image TO image_url"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content RENAME COLUMN link TO link_url"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content RENAME COLUMN \"order\" TO order_index"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content RENAME COLUMN is_active TO active"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content ADD COLUMN button_text TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content ADD COLUMN button_link TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content ADD COLUMN layout TEXT DEFAULT 'right'"); } catch(e) {}
  try { await exec("ALTER TABLE homepage_content ADD COLUMN page TEXT DEFAULT 'home'"); } catch(e) {}

  // Orders Migrations
  try { await exec("ALTER TABLE orders ADD COLUMN tracking_id TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE orders ADD COLUMN tracking_status TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'"); } catch(e) {}
  try { await exec("ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT"); } catch(e) {}
  try { await exec("ALTER TABLE orders ADD COLUMN razorpay_signature TEXT"); } catch(e) {}

  // Seed initial data
  const productCount = await get("SELECT COUNT(*) as count FROM products") as { count: number };
  if (Number(productCount.count) === 0) {
    const initialProducts = [
      ['p1', 'Eternal Gold Band', '18K Solid Gold minimalist band.', 29999, 'Gold', 'Finger Ring', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800', 15],
      ['p2', 'Diamond Solitaire', 'Sparkling 1 carat diamond ring.', 149999, 'Diamond', 'Finger Ring', 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&q=80&w=800', 5],
      ['p3', 'Platinum Men\'s Cuff', 'Sleek platinum cuff for men.', 89999, 'Platinum', 'Bracelet', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800', 10],
      ['p4', 'Silver Moon Pendant', 'Sterling silver pendant with moonstone.', 12999, 'Silver', 'Pendants', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 20],
      ['p5', 'Classic Gold Chain', '24-inch 14K gold chain for men.', 54999, 'Gold', 'Chain', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800', 12],
      ['p6', 'Rose Gold Earrings', 'Delicate rose gold stud earrings.', 19999, 'Gold', 'Earring', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 25],
      ['p7', 'Diamond Tennis Bracelet', 'Elegant diamond tennis bracelet.', 249999, 'Diamond', 'Bracelet', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', 3],
      ['p8', 'Gold Coin 5g', 'Pure 24K gold coin for investment.', 45000, 'Gold', 'Gold Coin', 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800', 50],
      ['p9', 'Traditional Bangles', 'Intricate gold bangles set.', 120000, 'Gold', 'Bangles', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 8],
      ['p10', 'Diamond Nosepin', 'Small sparkling diamond nosepin.', 8999, 'Diamond', 'Nosepin', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 30],
      ['p11', 'Gifting Set - Necklace & Earrings', 'Perfect gift set for special occasions.', 59999, 'Gifting', 'Set', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', 15],
      ['p12', 'Gifting Gold Pendant', 'Heart shaped gold pendant for gifting.', 19999, 'Gifting', 'Pendants', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 25],
      ['p13', 'Gold Studs', 'Simple 22K gold studs.', 15000, 'Gold', 'Earring', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 20],
      ['p14', 'Diamond Pendant', 'Elegant diamond drop pendant.', 75000, 'Diamond', 'Pendants', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', 10],
      ['p15', 'Silver Chain', 'Sterling silver curb chain.', 4500, 'Silver', 'Chain', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800', 50],
      ['p16', 'Platinum Band', 'Classic platinum wedding band.', 60000, 'Platinum', 'Finger Ring', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800', 15],
      ['p17', 'Gold Nosepin', 'Traditional gold nosepin.', 6000, 'Gold', 'Nosepin', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 40],
      ['p18', 'Diamond Bangles', 'Luxury diamond encrusted bangles.', 350000, 'Diamond', 'Bangles', 'https://images.unsplash.com/photo-1535633302723-995f414125df?auto=format&fit=crop&q=80&w=800', 2],
    ];

    for (const p of initialProducts) {
      await run("INSERT INTO products (id, name, description, price, category, subcategory, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", p);
    }

    if (isPostgres) {
      await run("INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING", ['admin_1', 'admin@aura.com', 'Administrator', 'admin']);
      await run("INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING", ['admin_2', 'yashbajpaiknpindia@gmail.com', 'Owner', 'admin']);
      await run("INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING", ['admin_3', 'yashbajpai699@gmail.com', 'Admin', 'admin']);
      await run("INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING", ['admin_4', 'adoreofficialknp@gmail.com', 'Adore Official', 'admin']);
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", ['theme_color', '#f5f2ed']);
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ['accent_color', '#1a1a1a']);
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ['hero_title', 'Timeless Elegance']);
      await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ['hero_subtitle', 'Discover our curated collection of fine jewellery.']);
    } else {
      await run("INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)", ['admin_1', 'admin@aura.com', 'Administrator', 'admin']);
      await run("INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)", ['admin_2', 'yashbajpaiknpindia@gmail.com', 'Owner', 'admin']);
      await run("INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)", ['admin_3', 'yashbajpai699@gmail.com', 'Admin', 'admin']);
      await run("INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)", ['admin_4', 'adoreofficialknp@gmail.com', 'Adore Official', 'admin']);
      await run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['theme_color', '#f5f2ed']);
      await run("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", ['accent_color', '#1a1a1a']);
      await run("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", ['hero_title', 'Timeless Elegance']);
      await run("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", ['hero_subtitle', 'Discover our curated collection of fine jewellery.']);
    }

    const initialCategories = [
      ['cat_1', 'Gold', 'category', null],
      ['cat_2', 'Diamond', 'category', null],
      ['cat_3', 'Platinum', 'category', null],
      ['cat_4', 'Silver', 'category', null],
      ['cat_5', 'Gifting', 'category', null],
      ['sub_1', 'Finger Ring', 'subcategory', 'cat_1'],
      ['sub_2', 'Chain', 'subcategory', 'cat_1'],
      ['sub_3', 'Earring', 'subcategory', 'cat_1'],
      ['sub_4', 'Gold Coin', 'subcategory', 'cat_1'],
      ['sub_5', 'Bangles', 'subcategory', 'cat_1'],
      ['sub_6', 'Nosepin', 'subcategory', 'cat_1'],
      ['sub_7', 'Pendants', 'subcategory', 'cat_1'],
      ['sub_8', 'Finger Ring', 'subcategory', 'cat_2'],
      ['sub_9', 'Bracelet', 'subcategory', 'cat_2'],
      ['sub_10', 'Bangles', 'subcategory', 'cat_2'],
      ['sub_11', 'Nosepin', 'subcategory', 'cat_2'],
      ['sub_12', 'Pendants', 'subcategory', 'cat_2'],
      ['sub_13', 'Finger Ring', 'subcategory', 'cat_3'],
      ['sub_14', 'Bracelet', 'subcategory', 'cat_3'],
      ['sub_15', 'Pendants', 'subcategory', 'cat_4'],
      ['sub_16', 'Chain', 'subcategory', 'cat_4'],
      ['sub_17', 'Set', 'subcategory', 'cat_5'],
      ['sub_18', 'Pendants', 'subcategory', 'cat_5'],
    ];
    for (const c of initialCategories) {
      await run("INSERT INTO categories (id, name, type, parent_id) VALUES (?, ?, ?, ?)", c);
    }

    // Seed initial homepage content for grids
    const initialHomepage = [
      ['hp_c1', 'color_grid', 'Silver', '', 'https://picsum.photos/seed/silver/400', '', '', '', 'right', 'home', 10, 1],
      ['hp_c2', 'color_grid', 'Gold Plated', '', 'https://picsum.photos/seed/gold/400', '', '', '', 'right', 'home', 11, 1],
      ['hp_c3', 'color_grid', 'Rose Gold', '', 'https://picsum.photos/seed/rosegold/400', '', '', '', 'right', 'home', 12, 1],
      ['hp_l1', 'luxury_grid', '1299', 'Under', '', '', '', '', 'right', 'home', 20, 1],
      ['hp_l2', 'luxury_grid', '1499', 'Under', '', '', '', '', 'right', 'home', 21, 1],
      ['hp_l3', 'luxury_grid', '1999', 'Under', '', '', '', '', 'right', 'home', 22, 1],
    ];
    for (const h of initialHomepage) {
      await run("INSERT INTO homepage_content (id, type, title, subtitle, image_url, link_url, button_text, button_link, layout, page, order_index, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", h);
    }
  }
};

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

  // WebSocket broadcast helper
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Configure Multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // Admin Middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await get("SELECT role FROM users WHERE id = ?", [userId]) as any;
    if (user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };

  // Upload Endpoint
  app.post("/api/upload", upload.single("image"), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });

  // API Routes
  app.get("/api/products", async (req, res) => {
    const products = (await query("SELECT * FROM products")).map((p: any) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await get("SELECT * FROM products WHERE id = ?", [req.params.id]) as any;
    if (product) {
      product.images = product.images ? JSON.parse(product.images) : [];
    }
    res.json(product);
  });

  app.post("/api/products", isAdmin, async (req, res) => {
    const { id, name, description, price, category, subcategory, image, images, video, stock } = req.body;
    await run("INSERT INTO products (id, name, description, price, category, subcategory, image, images, video, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, name, description, price, category, subcategory, image, JSON.stringify(images || []), video || null, stock
    ]);
    broadcast({ type: 'PRODUCTS_UPDATED' });
    res.json({ success: true });
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    const { name, description, price, category, subcategory, image, images, video, stock } = req.body;
    await run("UPDATE products SET name = ?, description = ?, price = ?, category = ?, subcategory = ?, image = ?, images = ?, video = ?, stock = ? WHERE id = ?", [
      name, description, price, category, subcategory, image, JSON.stringify(images || []), video || null, stock, req.params.id
    ]);
    broadcast({ type: 'PRODUCTS_UPDATED' });
    res.json({ success: true });
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    await run("DELETE FROM products WHERE id = ?", [req.params.id]);
    broadcast({ type: 'PRODUCTS_UPDATED' });
    res.json({ success: true });
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await query("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", [req.params.id]);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    const { userId, userName, rating, comment } = req.body;
    const productId = req.params.id;
    const id = 'rev_' + Math.random().toString(36).substr(2, 9);
    
    if (!userId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      await run(
        "INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
        [id, productId, userId, userName || 'Anonymous', rating, comment]
      );
      res.json({ success: true, id });
    } catch (err) {
      console.error("Review error:", err);
      res.status(500).json({ error: "Failed to post review" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await query("SELECT * FROM categories");
    res.json(categories);
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    const { id, name, type, parent_id, image } = req.body;
    if (isPostgres) {
      await run("INSERT INTO categories (id, name, type, parent_id, image) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image", [
        id, name, type, parent_id || null, image || null
      ]);
    } else {
      await run("INSERT OR REPLACE INTO categories (id, name, type, parent_id, image) VALUES (?, ?, ?, ?, ?)", [
        id, name, type, parent_id || null, image || null
      ]);
    }
    broadcast({ type: 'CATEGORIES_UPDATED' });
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    await run("DELETE FROM categories WHERE id = ?", [req.params.id]);
    broadcast({ type: 'CATEGORIES_UPDATED' });
    res.json({ success: true });
  });

  // Homepage Content
  app.get("/api/homepage-content", async (req, res) => {
    try {
      const content = await query(`SELECT * FROM homepage_content ORDER BY order_index ASC`);
      res.json(content);
    } catch (err) {
      console.error("Homepage content error:", err);
      res.status(500).json({ error: "Failed to fetch homepage content" });
    }
  });

  app.post("/api/homepage-content", isAdmin, async (req, res) => {
    const { id, type, title, subtitle, image_url, link_url, button_text, button_link, layout, page, order_index, active } = req.body;
    if (isPostgres) {
      await run(`INSERT INTO homepage_content (id, type, title, subtitle, image_url, link_url, button_text, button_link, layout, page, order_index, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, image_url = EXCLUDED.image_url, link_url = EXCLUDED.link_url, button_text = EXCLUDED.button_text, button_link = EXCLUDED.button_link, layout = EXCLUDED.layout, page = EXCLUDED.page, order_index = EXCLUDED.order_index, active = EXCLUDED.active`, [
        id, type, title, subtitle, image_url, link_url, button_text, button_link, layout || 'right', page || 'home', order_index, active ? 1 : 0
      ]);
    } else {
      await run(`INSERT OR REPLACE INTO homepage_content (id, type, title, subtitle, image_url, link_url, button_text, button_link, layout, page, order_index, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id, type, title, subtitle, image_url, link_url, button_text, button_link, layout || 'right', page || 'home', order_index, active ? 1 : 0
      ]);
    }
    broadcast({ type: 'HOMEPAGE_UPDATED' });
    res.json({ success: true });
  });

  app.delete("/api/homepage-content/:id", isAdmin, async (req, res) => {
    await run("DELETE FROM homepage_content WHERE id = ?", [req.params.id]);
    broadcast({ type: 'HOMEPAGE_UPDATED' });
    res.json({ success: true });
  });

  app.get("/api/settings", async (req, res) => {
    const settings = await query("SELECT * FROM settings");
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings", isAdmin, async (req, res) => {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      if (isPostgres) {
        await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [key, value]);
      } else {
        await run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
      }
    }
    broadcast({ type: 'SETTINGS_UPDATED' });
    res.json({ success: true });
  });

  app.post("/api/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const crypto = await import('crypto');
    const Razorpay = (await import('razorpay')).default;
    
    try {
      // Fetch keys from settings or env
      const keyIdSetting = await get("SELECT value FROM settings WHERE key = ?", ['razorpay_key_id']) as any;
      const keySecretSetting = await get("SELECT value FROM settings WHERE key = ?", ['razorpay_key_secret']) as any;
      const keyId = keyIdSetting?.value || process.env.RAZORPAY_KEY_ID || '';
      const keySecret = keySecretSetting?.value || process.env.RAZORPAY_KEY_SECRET || '';
      
      if (!keySecret) {
        throw new Error("Razorpay secret key not configured");
      }

      // 1. Verify Signature
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        console.error("Invalid Razorpay signature");
        await run("UPDATE orders SET status = 'failed', payment_status = 'failed' WHERE id = ?", [orderId]);
        return res.status(400).json({ success: false, error: "Invalid payment signature" });
      }

      // 2. Fetch Payment Details from Razorpay to ensure it's captured
      const rzp = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const payment = await rzp.payments.fetch(razorpay_payment_id);

      if (payment.status === 'captured' || payment.status === 'authorized') {
        // If authorized, we might need to capture it if not auto-captured, 
        // but usually it's auto-captured if configured in dashboard.
        // For safety, we check captured.
        await run(
          "UPDATE orders SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = ?, razorpay_signature = ? WHERE id = ?", 
          [razorpay_payment_id, razorpay_signature, orderId]
        );
        
        // Log activity
        const order = await get("SELECT user_id, total FROM orders WHERE id = ?", [orderId]) as any;
        if (order) {
          await run("INSERT INTO user_activity (id, user_id, action, details) VALUES (?, ?, ?, ?)", [
            'act_' + Math.random().toString(36).substr(2, 9),
            order.user_id,
            'Payment Verified',
            `Order ID: ${orderId}, Payment ID: ${razorpay_payment_id}, Status: ${payment.status}`
          ]);
        }

        broadcast({ type: 'ORDERS_UPDATED' });
        res.json({ success: true });
      } else {
        console.error(`Razorpay payment status: ${payment.status}`);
        await run("UPDATE orders SET status = 'failed', payment_status = 'failed' WHERE id = ?", [orderId]);
        res.status(400).json({ success: false, error: `Payment not captured. Status: ${payment.status}` });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      await run("UPDATE orders SET status = 'failed', payment_status = 'failed' WHERE id = ?", [orderId]);
      res.status(500).json({ success: false, error: error.message || "Internal server error during verification" });
    }
  });

  // Optional Secure Webhook Implementation
  app.post("/api/webhooks/razorpay", async (req, res) => {
    const crypto = await import('crypto');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (signature === digest) {
      const event = req.body.event;
      const payload = req.body.payload.payment.entity;

      if (event === 'payment.captured') {
        const razorpay_order_id = payload.order_id;
        const razorpay_payment_id = payload.id;
        
        await run(
          "UPDATE orders SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = ? WHERE razorpay_order_id = ?", 
          [razorpay_payment_id, razorpay_order_id]
        );
        broadcast({ type: 'ORDERS_UPDATED' });
      }
      res.json({ status: 'ok' });
    } else {
      res.status(400).send('Invalid signature');
    }
  });

  app.post("/api/create-razorpay-order", async (req, res) => {
    const { amount, currency } = req.body;
    const Razorpay = (await import('razorpay')).default;
    
    // Fetch keys from settings or env
    const keyIdSetting = await get("SELECT value FROM settings WHERE key = ?", ['razorpay_key_id']) as any;
    const keySecretSetting = await get("SELECT value FROM settings WHERE key = ?", ['razorpay_key_secret']) as any;
    
    const rzp = new Razorpay({
      key_id: keyIdSetting?.value || process.env.RAZORPAY_KEY_ID || '',
      key_secret: keySecretSetting?.value || process.env.RAZORPAY_KEY_SECRET || '',
    });

    try {
      const order = await rzp.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency: currency || 'INR',
        receipt: 'receipt_' + Math.random().toString(36).substr(2, 9),
      });
      res.json(order);
    } catch (error) {
      console.error("Razorpay error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });

  app.delete("/api/orders/:id", isAdmin, async (req, res) => {
    try {
      await run("DELETE FROM order_items WHERE order_id = ?", [req.params.id]);
      await run("DELETE FROM orders WHERE id = ?", [req.params.id]);
      broadcast({ type: 'ORDERS_UPDATED' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  app.get("/api/orders", isAdmin, async (req, res) => {
    const orders = await query(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", isAdmin, async (req, res) => {
    const { status, tracking_id, tracking_status } = req.body;
    await run(
      "UPDATE orders SET status = ?, tracking_id = ?, tracking_status = ? WHERE id = ?", 
      [status, tracking_id, tracking_status, req.params.id]
    );
    broadcast({ type: 'ORDERS_UPDATED' });
    res.json({ success: true });
  });

  app.put("/api/orders/:id/payment-status", isAdmin, async (req, res) => {
    const { payment_status } = req.body;
    await run("UPDATE orders SET payment_status = ? WHERE id = ?", [payment_status, req.params.id]);
    broadcast({ type: 'ORDERS_UPDATED' });
    res.json({ success: true });
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, items, total, shipping, razorpay_order_id, payment_status } = req.body;
    const orderId = 'ord_' + Math.random().toString(36).substr(2, 9);
    
    try {
      await run(`
        INSERT INTO orders (
          id, user_id, total, 
          shipping_name, shipping_address, shipping_city, 
          shipping_pincode, shipping_phone, payment_method,
          razorpay_order_id, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId, userId, total, 
        shipping.name, shipping.address, shipping.city, 
        shipping.pincode, shipping.phone, shipping.paymentMethod || 'COD',
        razorpay_order_id || null, payment_status || 'pending'
      ]);
      for (const item of items) {
        await run("INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)", [
          'oi_' + Math.random().toString(36).substr(2, 9), orderId, item.productId, item.quantity, item.price
        ]);
      }
      await run("INSERT INTO user_activity (id, user_id, action, details) VALUES (?, ?, ?, ?)", [
        'act_' + Math.random().toString(36).substr(2, 9), userId, 'Order Placed', `Order ID: ${orderId}, Total: Rs. ${total}`
      ]);
      
      broadcast({ type: 'ORDERS_UPDATED' });
      res.json({ success: true, orderId });
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  app.get("/api/activity", isAdmin, async (req, res) => {
    const activity = await query(`
      SELECT a.*, u.name as user_name, u.email as user_email 
      FROM user_activity a 
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json(activity);
  });

  app.get("/api/users", isAdmin, async (req, res) => {
    const users = await query("SELECT * FROM users");
    res.json(users);
  });

  app.put("/api/users/:id", async (req, res) => {
    const { name, phone, address, city, pincode, role } = req.body;
    const requesterId = req.headers['x-user-id'];
    const requester = await get("SELECT role FROM users WHERE id = ?", [requesterId]) as any;

    if (role && requester?.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can change roles" });
    }

    if (role) {
      await run("UPDATE users SET name = ?, phone = ?, address = ?, city = ?, pincode = ?, role = ? WHERE id = ?", [
        name, phone, address, city, pincode, role, req.params.id
      ]);
    } else {
      await run("UPDATE users SET name = ?, phone = ?, address = ?, city = ?, pincode = ? WHERE id = ?", [
        name, phone, address, city, pincode, req.params.id
      ]);
    }
    const updatedUser = await get("SELECT * FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, user: updatedUser });
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    const notifications = await query(`
      SELECT n.*, un.is_read 
      FROM notifications n
      LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
      WHERE n.target_user_id IS NULL OR n.target_user_id = ?
      ORDER BY n.created_at DESC
    `, [req.params.userId, req.params.userId]);
    res.json(notifications);
  });

  app.post("/api/notifications", isAdmin, async (req, res) => {
    const { title, message, image, targetUserId } = req.body;
    const id = 'notif_' + Math.random().toString(36).substr(2, 9);
    await run("INSERT INTO notifications (id, title, message, image, target_user_id) VALUES (?, ?, ?, ?, ?)", [
      id, title, message, image || null, targetUserId || null
    ]);
    broadcast({ type: 'NOTIFICATIONS_UPDATED', targetUserId });
    res.json({ success: true });
  });

  app.post("/api/notifications/read", async (req, res) => {
    const { userId, notificationId } = req.body;
    if (isPostgres) {
      await run("INSERT INTO user_notifications (user_id, notification_id, is_read) VALUES (?, ?, 1) ON CONFLICT (user_id, notification_id) DO UPDATE SET is_read = 1", [
        userId, notificationId
      ]);
    } else {
      await run("INSERT OR REPLACE INTO user_notifications (user_id, notification_id, is_read) VALUES (?, ?, 1)", [
        userId, notificationId
      ]);
    }
    res.json({ success: true });
  });

  app.post("/api/users/login", async (req, res) => {
    const { id, email, name, phone } = req.body;
    const adminEmails = ['yashbajpaiknpindia@gmail.com', 'admin@aura.com', 'yashbajpai699@gmail.com', 'adoreofficialknp@gmail.com'];
    const role = adminEmails.includes(email) ? 'admin' : 'user';
    
    let user = await get("SELECT * FROM users WHERE email = ?", [email]) as any;
    
    if (!user) {
      await run("INSERT INTO users (id, email, name, phone, role) VALUES (?, ?, ?, ?, ?)", [
        id, email, name, phone || null, role
      ]);
      user = await get("SELECT * FROM users WHERE id = ?", [id]);
    } else {
      if (adminEmails.includes(email) && user.role !== 'admin') {
        await run("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
        user.role = 'admin';
      }
    }

    await run("INSERT INTO user_activity (id, user_id, action, details) VALUES (?, ?, ?, ?)", [
      'act_' + Math.random().toString(36).substr(2, 9),
      user.id,
      'Login',
      `User logged in via ${id.startsWith('google') ? 'Google' : 'Mobile'}`
    ]);
    
    res.json({ success: true, user });
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const totalSales = await get("SELECT SUM(total) as total FROM orders WHERE payment_status = 'paid'") as any;
      const totalOrders = await get("SELECT COUNT(*) as count FROM orders") as any;
      const totalUsers = await get("SELECT COUNT(*) as count FROM users") as any;
      const totalProducts = await get("SELECT COUNT(*) as count FROM products") as any;
      
      const recentOrders = await query(`
        SELECT o.*, u.name as user_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 5
      `);

      res.json({
        stats: {
          revenue: totalSales?.total || 0,
          orders: totalOrders?.count || 0,
          users: totalUsers?.count || 0,
          products: totalProducts?.count || 0
        },
        recentOrders: recentOrders || []
      });
    } catch (err) {
      console.error("Stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/location", async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
      // Using a public API for IP location
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      res.json({
        country: data.country_name || "India",
        city: data.city || "Mumbai",
        ip: ip
      });
    } catch (err) {
      res.json({ country: "India", city: "Mumbai", ip: ip });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  await initDb();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
