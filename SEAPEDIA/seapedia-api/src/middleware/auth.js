import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';
import { prisma } from '../lib/prisma.js';

// Membaca & verifikasi token sesi dari cookie httpOnly, lalu menempelkan
// req.user = { id, username, email, activeRole, roles } untuk dipakai
// controller/middleware selanjutnya. WAJIB dipasang di setiap route privat.
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      throw new AppError('Anda harus login untuk mengakses fitur ini', 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError('Sesi tidak valid atau sudah berakhir, silakan login kembali', 401);
    }

    // Token sementara untuk pemilihan role tidak boleh dipakai sebagai sesi penuh.
    if (payload.purpose) {
      throw new AppError('Sesi tidak valid, silakan login kembali', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true },
    });

    if (!user) {
      throw new AppError('Akun tidak ditemukan, silakan login kembali', 401);
    }

    const ownedRoles = user.roles.map((r) => r.role);

    // Pastikan activeRole di dalam token masih benar-benar dimiliki user -
    // mis. kalau suatu saat role dicabut, token lama tidak boleh tetap sakti.
    if (!ownedRoles.includes(payload.activeRole)) {
      throw new AppError('Role aktif tidak valid, silakan login kembali', 401);
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      activeRole: payload.activeRole,
      roles: ownedRoles,
    };

    next();
  } catch (err) {
    next(err);
  }
};

// Otorisasi berdasarkan ROLE AKTIF saat ini - bukan seluruh daftar role yang
// dimiliki user. Ini menegakkan aturan bisnis inti SEAPEDIA: "Authorization
// must follow the active role, not merely the full list of roles owned".
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Anda harus login untuk mengakses fitur ini', 401));
  }
  if (!allowedRoles.includes(req.user.activeRole)) {
    return next(
      new AppError(
        `Fitur ini hanya untuk role: ${allowedRoles.join(', ')}. Role aktif Anda saat ini: ${req.user.activeRole}`,
        403
      )
    );
  }
  next();
};

// Versi "lunak": tetap lanjut walau belum login (dipakai di endpoint publik
// yang perilakunya boleh sedikit beda kalau request datang dari user yang
// sudah login, misal submit review).
export const attachUserIfPresent = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return next();

    const payload = verifyToken(token);
    if (payload.purpose) return next();

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true },
    });

    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        activeRole: payload.activeRole,
        roles: user.roles.map((r) => r.role),
      };
    }
    next();
  } catch {
    // Token tidak valid di endpoint publik -> anggap saja guest, jangan blokir.
    next();
  }
};
