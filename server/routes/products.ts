
// Normalize a product row: parse JSON string fields before sending to client
function normalizeProductRow(row: any) {
  return {
    ...row,
    images: (() => {
      if (!row.images) return [];
      if (typeof row.images === 'string') {
        try { return JSON.parse(row.images); } catch { return []; }
      }
      return row.images;
    })(),
  };
}

import { Router } from 'express';
import { query } from '../config/db.js';
import { isAdmin } from '../middleware/auth.js';
import { upload, cloudinaryEnabled } from '../config/cloudinary.js';

const router = Router();

// ── PUBLIC: list all products ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows.map(normalizeProductRow));
  } catch (error) {
    next(error);
  }
});

// ── PUBLIC: single product ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: upload product image ───────────────────────────────────────────
router.post('/upload', isAdmin, upload.single('image') as any, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }
  const url: string =
    cloudinaryEnabled && (req.file as any).path
      ? (req.file as any).path
      : `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// ── ADMIN: create product ─────────────────────────────────────────────────
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const {
      name, description, price, category, subcategory,
      stock, image, images, is_best_seller, is_top_rated, color, video, bond,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const productId = req.body.id || ('p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
    const result = await query(
      `INSERT INTO products
         (id,name,description,price,category,subcategory,stock,image,images,
          is_best_seller,is_top_rated,color,video,bond)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET
         name=$2,description=$3,price=$4,category=$5,subcategory=$6,
         stock=$7,image=$8,images=$9,is_best_seller=$10,is_top_rated=$11,
         color=$12,video=$13,bond=$14
       RETURNING *`,
      [
        productId,
        name, description||null, price||0, category||null, subcategory||null,
        stock||0, image||null, JSON.stringify(images||[]),
        is_best_seller?1:0, is_top_rated?1:0, color||null, video||null, bond||null,
      ]
    );

    res.status(201).json({ success: true, product: normalizeProductRow(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: update product ─────────────────────────────────────────────────
router.put('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, category, subcategory,
      stock, image, images, is_best_seller, is_top_rated, color, video, bond,
    } = req.body;

    const result = await query(
      `UPDATE products SET
         name=$1, description=$2, price=$3, category=$4, subcategory=$5,
         stock=$6, image=$7, images=$8, is_best_seller=$9, is_top_rated=$10,
         color=$11, video=$12, bond=$13
       WHERE id=$14
       RETURNING *`,
      [
        name, description||null, price||0, category||null, subcategory||null,
        stock||0, image||null, JSON.stringify(images||[]),
        is_best_seller?1:0, is_top_rated?1:0, color||null, video||null, bond||null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: normalizeProductRow(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: delete product ─────────────────────────────────────────────────
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});


// ── POST /api/products/:id/view — Increment view count ───────────────────
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// ── GET /api/products/:id/reviews ─────────────────────────────────────────
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
});

// ── POST /api/products/:id/reviews ────────────────────────────────────────
router.post('/:id/reviews', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, userName, rating, comment } = req.body;
    if (!userId || !comment) {
      return res.status(400).json({ success: false, message: 'userId and comment required' });
    }
    await query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES ($1,$2,$3,$4,$5)`,
      [id, userId, userName || 'Anonymous', rating || 5, comment]
    );
    res.status(201).json({ success: true });
  } catch (error) { next(error); }
});

export default router;
