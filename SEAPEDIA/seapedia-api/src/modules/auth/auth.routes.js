import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// Limiter lebih ketat khusus endpoint sensitif, untuk mencegah brute force
// login/registrasi. Limiter global di app.js tetap berlaku sebagai lapisan
// pertama untuk seluruh API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan, coba lagi dalam beberapa menit.' },
});

// Publik
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/select-role', authLimiter, authController.selectRole);
router.post('/logout', authController.logout);

// Privat (butuh sesi login)
router.get('/me', requireAuth, authController.me);
router.post('/switch-role', requireAuth, authController.switchRole);
router.post('/roles', requireAuth, authController.addRole);

export default router;
