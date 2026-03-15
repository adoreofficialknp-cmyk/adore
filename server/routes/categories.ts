import { Router } from 'express';
import { query } from '../config/db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// ── PUBLIC: list all ─────────────────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) { next(error); }
});

// ── ADMIN: create or update category ─────────────────────────────────────
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const { id, name, type, parent_id, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    const catId = id || ('cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
    const result = await query(
      `INSERT INTO categories (id, name, type, parent_id, image)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         parent_id = EXCLUDED.parent_id,
         image = EXCLUDED.image
       RETURNING *`,
      [catId, name, type || 'category', parent_id || null, image || null]
    );
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) { next(error); }
});

// ── ADMIN: update category ────────────────────────────────────────────────
router.put('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, parent_id, image } = req.body;
    const result = await query(
      `UPDATE categories SET name=$1, type=$2, parent_id=$3, image=$4 WHERE id=$5 RETURNING *`,
      [name, type || 'category', parent_id || null, image || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category: result.rows[0] });
  } catch (error) { next(error); }
});

// ── ADMIN: delete category ────────────────────────────────────────────────
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
