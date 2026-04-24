const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /api/custom - create custom request
router.post('/', auth, async (req, res, next) => {
  try {
    const customRequest = await prisma.customRequest.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.status(201).json(customRequest);
  } catch (err) { next(err); }
});

// GET /api/custom/my - user's custom requests
router.get('/my', auth, async (req, res, next) => {
  try {
    const requests = await prisma.customRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) { next(err); }
});

// GET /api/custom - admin: all custom requests
router.get('/', auth, adminOnly, async (req, res, next) => {
  try {
    const requests = await prisma.customRequest.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) { next(err); }
});

// PUT /api/custom/:id/status - admin: update status
router.put('/:id/status', auth, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await prisma.customRequest.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(request);
  } catch (err) { next(err); }
});

module.exports = router;
