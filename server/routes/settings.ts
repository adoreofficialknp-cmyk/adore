import { Router } from 'express';
import { query } from '../config/db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// Allowed settings columns (prevents SQL injection via dynamic column names)
const ALLOWED_COLUMNS = new Set([
  'hero_title','hero_subtitle','hero_image','brand_story',
  'gifting_title','gifting_subtitle','category_grid_format',
  'primary_color','secondary_color','font_heading','font_body',
  'social_instagram','social_facebook','social_linkedin','social_whatsapp',
  'link_privacy_policy','link_terms_conditions',
  'payment_gateway_provider','razorpay_key_id','razorpay_key_secret',
  'color_selection','luxury_prices',
]);

// ── GET /api/settings ─────────────────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM settings LIMIT 1');
    if (!result.rowCount || result.rowCount === 0) return res.json({});
    const row = result.rows[0];
    // Parse JSON fields
    ['color_selection','luxury_prices'].forEach(key => {
      if (row[key] && typeof row[key] === 'string') {
        try { row[key] = JSON.parse(row[key]); } catch {}
      }
    });
    res.json(row);
  } catch (error) { next(error); }
});

// ── POST /api/settings — Upsert settings (admin only) ────────────────────
router.post('/', isAdmin, async (req, res, next) => {
  try {
    const body = req.body as Record<string, any>;

    // Filter to only allowed columns
    const safeEntries = Object.entries(body).filter(([k]) => ALLOWED_COLUMNS.has(k));
    if (safeEntries.length === 0) {
      return res.json({ success: true, message: 'No valid settings fields provided' });
    }

    // Serialize object/array fields
    const serialized = safeEntries.map(([k, v]) => [
      k,
      (['color_selection','luxury_prices'].includes(k) && v !== null && typeof v === 'object')
        ? JSON.stringify(v)
        : v,
    ]);

    const keys   = serialized.map(([k]) => k);
    const values = serialized.map(([, v]) => v);

    const existing = await query('SELECT id FROM settings LIMIT 1');

    if (!existing.rowCount || existing.rowCount === 0) {
      const cols  = keys.join(', ');
      const ph    = keys.map((_, i) => `$${i + 1}`).join(', ');
      await query(`INSERT INTO settings (${cols}) VALUES (${ph})`, values);
    } else {
      const id  = existing.rows[0].id;
      const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      await query(`UPDATE settings SET ${set} WHERE id = $${keys.length + 1}`, [...values, id]);
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) { next(error); }
});

export default router;
