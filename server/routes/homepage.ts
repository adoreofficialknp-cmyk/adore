import { Router } from 'express';
import { query } from '../config/db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// ── PUBLIC: all content rows ──────────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM homepage_content ORDER BY order_index ASC, id ASC');
    const rows = result.rows.map(normalizeRow);
    res.json(rows);
  } catch (error) { next(error); }
});

// ── ADMIN: upsert a section ───────────────────────────────────────────────
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const {
      id, title, subtitle, type, image_url, button_text, button_link,
      link_url, layout, page, order_index, active, product_ids,
    } = req.body;

    // Use frontend-supplied id or generate one
    const contentId = id || ('hp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

    const result = await query(
      `INSERT INTO homepage_content
         (id, title, subtitle, type, image_url, button_text, button_link,
          link_url, layout, page, order_index, active, product_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         title       = EXCLUDED.title,
         subtitle    = EXCLUDED.subtitle,
         type        = EXCLUDED.type,
         image_url   = EXCLUDED.image_url,
         button_text = EXCLUDED.button_text,
         button_link = EXCLUDED.button_link,
         link_url    = EXCLUDED.link_url,
         layout      = EXCLUDED.layout,
         page        = EXCLUDED.page,
         order_index = EXCLUDED.order_index,
         active      = EXCLUDED.active,
         product_ids = EXCLUDED.product_ids,
         updated_at  = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        contentId,
        title       || null,
        subtitle    || null,
        type        || 'section',
        image_url   || null,
        button_text || null,
        button_link || null,
        link_url    || null,
        layout      || 'right',
        page        || 'home',
        order_index ?? 0,
        active !== undefined ? Number(active) : 1,
        product_ids ? JSON.stringify(product_ids) : null,
      ]
    );
    res.json({ success: true, content: normalizeRow(result.rows[0]) });
  } catch (error) { next(error); }
});

// ── ADMIN: delete a section ───────────────────────────────────────────────
router.delete('/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM homepage_content WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// ── Helper: normalise a DB row to match frontend HomepageContent type ────
function normalizeRow(row: any) {
  return {
    ...row,
    id:          String(row.id),
    order_index: Number(row.order_index ?? 0),
    active:      Number(row.active ?? 1),
    product_ids: (() => {
      try {
        if (!row.product_ids) return [];
        return typeof row.product_ids === 'string' ? JSON.parse(row.product_ids) : row.product_ids;
      } catch { return []; }
    })(),
  };
}

export default router;
