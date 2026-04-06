const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, adminOnly } = require('../middleware/auth');

// Only configure Cloudinary if the env is set
let cloudinary = null;
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  } catch {}
}

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

const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!cloudinary) {
      return reject(new Error('Image storage not configured. Please set CLOUDINARY_URL in environment variables.'));
    }
    cloudinary.uploader.upload_stream(
      { folder: 'adore-jewellery', quality: 'auto', fetch_format: 'auto', ...options },
      (error, result) => error ? reject(error) : resolve(result)
    ).end(fileBuffer);
  });
};

// POST /api/upload/image - single image
router.post('/image', auth, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    if (err.message?.includes('not configured')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

// POST /api/upload/images - multiple images
router.post('/images', auth, adminOnly, upload.array('images', 8), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    const uploads = await Promise.all(
      req.files.map(file => uploadToCloudinary(file.buffer)
        .then(result => ({ url: result.secure_url, publicId: result.public_id }))
      )
    );

    res.json(uploads);
  } catch (err) {
    if (err.message?.includes('not configured')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /api/upload/image/:publicId
router.delete('/image/:publicId', auth, adminOnly, async (req, res, next) => {
  try {
    if (!cloudinary) return res.status(503).json({ error: 'Image storage not configured' });
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
