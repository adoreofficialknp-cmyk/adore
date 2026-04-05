const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { auth, adminOnly } = require('../middleware/auth');

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'));
    }
    cb(null, true);
  }
});

// POST /api/upload/image - single image
router.post('/image', auth, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'adore-jewellery', quality: 'auto', fetch_format: 'auto' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(req.file.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) { next(err); }
});

// POST /api/upload/images - multiple images
router.post('/images', auth, adminOnly, upload.array('images', 8), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    const uploads = await Promise.all(req.files.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'adore-jewellery', quality: 'auto', fetch_format: 'auto' },
          (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id })
        ).end(file.buffer);
      })
    ));

    res.json(uploads);
  } catch (err) { next(err); }
});

// DELETE /api/upload/image/:publicId
router.delete('/image/:publicId', auth, adminOnly, async (req, res, next) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
