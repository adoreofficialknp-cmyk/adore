import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Detect whether Cloudinary credentials are present ─────────────────────
export const cloudinaryEnabled = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY    &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] ✅ Uploads enabled — files will go to Cloudinary.');
} else {
  console.warn('[Cloudinary] ⚠️  Credentials missing — using local storage fallback.');
}

// ── Ensure local uploads directory exists ─────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Local disk storage (fallback) ─────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// ── File filter — strict MIME + extension check (prevents spoofing) ──────
// Checks BOTH the file extension AND the mimetype reported by the browser.
// A .jpg file with mimetype "application/x-php" will be rejected.
const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const ALLOWED_EXTS = /\.(jpeg|jpg|png|webp|gif)$/i;

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTS.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(
      `Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed. ` +
      `Received: ${file.mimetype}`
    ));
  }
};

// ── Multer shared options ─────────────────────────────────────────────────
const multerOptions: multer.Options = {
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: imageFilter,
};

// ── Lazy-initialised upload middleware ────────────────────────────────────
// Avoids top-level await (which can cause ESM boot-order issues on Render).
// The real multer instance is created once on the first request.
let _upload: multer.Multer | null = null;

async function resolveUpload(): Promise<multer.Multer> {
  if (_upload) return _upload;

  if (!cloudinaryEnabled) {
    _upload = multer({ ...multerOptions, storage: diskStorage });
    return _upload;
  }

  try {
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');
    const cloudinaryStorage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder:          'adore-uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      } as any,
    });
    _upload = multer({ ...multerOptions, storage: cloudinaryStorage });
    console.log('[Cloudinary] ✅ multer-storage-cloudinary ready.');
  } catch (err: any) {
    console.error('[Cloudinary] ⚠️  multer-storage-cloudinary load failed — using disk:', err.message);
    _upload = multer({ ...multerOptions, storage: diskStorage });
  }

  return _upload!;
}

// Proxy that transparently delegates to the lazily-resolved multer instance.
// Usage in routes stays identical: upload.single('image'), upload.array('images'), etc.
export const upload: multer.Multer = new Proxy({} as multer.Multer, {
  get(_target, prop: string) {
    return (...args: any[]) =>
      async (req: any, res: any, next: any) => {
        try {
          const instance   = await resolveUpload();
          const middleware = (instance as any)[prop](...args);
          middleware(req, res, next);
        } catch (err) {
          next(err);
        }
      };
  },
});

export default cloudinary;
