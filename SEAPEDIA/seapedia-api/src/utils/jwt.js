import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET belum diatur di file .env - server tidak boleh jalan tanpa ini.');
}

export const signToken = (payload, expiresIn = JWT_EXPIRES_IN) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

// Nama cookie tempat JWT sesi disimpan. httpOnly = tidak bisa dibaca lewat
// JavaScript di browser, jadi token lebih aman dari pencurian via XSS
// dibanding kalau disimpan di localStorage.
export const COOKIE_NAME = 'seapedia_token';

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  path: '/',
};
