import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Error "operasional" yang sengaja kita lempar dari business logic,
// misal: "Username sudah dipakai", "Saldo tidak cukup", dst.
// Bedakan dari error tak terduga (bug) yang statusCode-nya default 500.
export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const notFound = (req, res, next) => {
  next(new AppError(`Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // 1) Error validasi input (Zod)
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validasi input gagal',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // 2) Error dari Prisma yang sudah dikenali (constraint, not found, dst)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') ?? 'data';
      return res.status(409).json({
        success: false,
        message: `Data dengan ${field} tersebut sudah digunakan`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Data yang dicari tidak ditemukan',
      });
    }
  }

  // 3) AppError (operasional) atau error tak terduga
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    // Error tak terduga tetap kita log penuh di server untuk debugging,
    // tapi pesan ke client digeneralisir agar tidak membocorkan detail internal.
    console.error('[UNEXPECTED ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Terjadi kesalahan pada server',
    ...(err.details ? { details: err.details } : {}),
  });
};
