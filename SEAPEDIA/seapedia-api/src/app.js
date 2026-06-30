import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import reviewRoutes from './modules/review/review.routes.js';
import storeRoutes from './modules/store/store.routes.js';
import productRoutes from './modules/product/product.routes.js';

const app = express();

// Security headers standar (X-Content-Type-Options, HSTS, dst)
app.use(helmet());

// CORS: hanya izinkan origin frontend, dengan kredensial (cookie JWT)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body & cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging request - cuma aktif di development biar log production bersih
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limit global - lapisan pertama cegah brute force / abuse dasar.
// Endpoint sensitif (login, register) akan dapat limiter lebih ketat lagi.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti.' },
});
app.use(globalLimiter);

// Health check - dipakai untuk memastikan server hidup
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SEAPEDIA API menyala',
    timestamp: new Date().toISOString(),
  });
});

// ===========================================================
// Routes (akan terus bertambah seiring level)
// ===========================================================
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);

// 404 handler + error handler terpusat - WAJIB paling akhir
app.use(notFound);
app.use(errorHandler);

export default app;
