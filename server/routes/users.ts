import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, pincode, role } = req.body;

    // Ensure user is updating their own profile or is admin
    if (String((req as any).user.id) !== String(id) && (req as any).user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Build dynamic update — only update provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (name !== undefined)    { updates.push(`name = $${idx++}`);    values.push(name || null); }
    if (email !== undefined)   { updates.push(`email = $${idx++}`);   values.push(email ? email.trim().toLowerCase() : null); }
    if (phone !== undefined)   { updates.push(`phone = $${idx++}`);   values.push(phone || null); }
    if (address !== undefined) { updates.push(`address = $${idx++}`); values.push(address || null); }
    if (city !== undefined)    { updates.push(`city = $${idx++}`);    values.push(city || null); }
    if (pincode !== undefined) { updates.push(`pincode = $${idx++}`); values.push(pincode || null); }
    // Only admins can change role
    if (role !== undefined && (req as any).user.role === 'admin') {
      updates.push(`role = $${idx++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, name, phone, role, address, city, pincode, created_at`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    next(error);
  }
});

router.patch('/:id/role', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role, created_at',
      [role, id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
