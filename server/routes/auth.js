const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional()
    });
    const { name, email, password, phone } = schema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
      select: { id: true, name: true, email: true, role: true, phone: true }
    });

    // Create empty cart for new user
    await prisma.cart.create({ data: { userId: user.id } });

    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _, ...safeUser } = user;
    const token = signToken(user);
    res.json({ user: safeUser, token });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, addresses: true }
    });
    res.json(user);
  } catch (err) { next(err); }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, avatar },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true }
    });
    res.json(user);
  } catch (err) { next(err); }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
});

module.exports = router;
