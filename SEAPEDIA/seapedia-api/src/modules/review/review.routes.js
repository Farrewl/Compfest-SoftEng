import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as reviewController from './review.controller.js';
import { attachUserIfPresent } from '../../middleware/auth.js';

const router = Router();

// Cegah spam submit ulasan dari satu IP (guest gampang spam endpoint publik)
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak ulasan dikirim, coba lagi nanti.' },
});

// Semua endpoint publik - guest maupun user login boleh akses.
// attachUserIfPresent: kalau ada sesi login, ulasan ditautkan ke userId
// (untuk jejak data), tapi TIDAK mewajibkan login sama sekali.
router.post('/', reviewLimiter, attachUserIfPresent, reviewController.submitReview);
router.get('/', reviewController.getReviews);
router.get('/summary', reviewController.getSummary);

export default router;
