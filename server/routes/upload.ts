import { Router, Request, Response, NextFunction } from 'express';
import { upload, cloudinaryEnabled } from '../config/cloudinary.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/upload
 * Admin-only. Accepts a single image field named "image".
 * Returns { success: true, url: string, imageUrl: string }
 * Both `url` and `imageUrl` are returned for frontend compatibility.
 */
router.post(
  '/',
  isAdmin,
  upload.single('image') as any,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Send a multipart/form-data request with field name "image".',
        });
      }

      // Cloudinary sets `file.path` to the secure HTTPS URL.
      // Local disk storage sets `file.filename`; we build a relative URL from that.
      const imageUrl: string =
        cloudinaryEnabled && (req.file as any).path
          ? (req.file as any).path
          : `/uploads/${req.file.filename}`;

      return res.json({
        success:  true,
        url:      imageUrl,   // kept for any direct consumers
        imageUrl: imageUrl,   // what all frontend handlers expect
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
