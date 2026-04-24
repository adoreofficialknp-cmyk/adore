const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, adminOnly } = require('../middleware/auth');

// Only configure Cloudinary if the env is set
let cloudinary = null;
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
  try {
    cloudinary = require('cloudinary').v2;
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloud_name: _parseCloudinaryUrl(process.env.CLOUDINARY_URL).cloud_name,
        api_key:    _parseCloudinaryUrl(process.env.CLOUDINARY_URL).api_key,
        api_secret: _parseCloudinaryUrl(process.env.CLOUDINARY_URL).api_secret,
      });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
    // Verify config is valid
    const cfg = cloudinary.config();
    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
      console.warn('[upload] Cloudinary config incomplete — uploads will fail');
      cloudinary = null;
    }
  } catch (e) {
    console.warn('[upload] Cloudinary init error:', e.message);
    cloudinary = null;
  }
}

/**
 * Parse cloudinary://api_key:api_secret@cloud_name into parts.
 * Returns empty strings on failure so the config-validity check above catches it.
 */
function _parseCloudinaryUrl(url) {
  try {
    const u = new URL(url.replace(/^cloudinary:\/\//, 'https://'));
    return {
      api_key:    u.username || '',
      api_secret: u.password || '',
      cloud_name: u.hostname || '',
    };
  } catch {
    return { api_key: '', api_secret: '', cloud_name: '' };
  }
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
// publicId may contain slashes (e.g. adore-jewellery/abc123) so we use wildcard
router.delete('/image/*', auth, adminOnly, async (req, res, next) => {
  try {
    if (!cloudinary) return res.status(503).json({ error: 'Image storage not configured' });
    const publicId = req.params[0];
    if (!publicId) return res.status(400).json({ error: 'Missing publicId' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) { next(err); }
});

// Multer-aware error handler
router.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'File too large — maximum 10MB per image',
      LIMIT_UNEXPECTED_FILE: 'Unexpected field — use "images" as the field name',
      LIMIT_FILE_COUNT: 'Too many files — maximum 8 images at once',
    }
    return res.status(400).json({ error: messages[err.code] || err.message })
  }
  next(err)
})

module.exports = router;
