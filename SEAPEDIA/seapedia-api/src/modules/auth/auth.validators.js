import { z } from 'zod';
import { NON_ADMIN_ROLES } from '../../constants/enums.js';

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username minimal 3 karakter')
  .max(20, 'Username maksimal 20 karakter')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore');

const passwordSchema = z
  .string()
  .min(6, 'Kata sandi minimal 6 karakter')
  .max(72, 'Kata sandi maksimal 72 karakter');

// Dibuat manual (bukan z.enum) supaya pesan errornya konsisten lintas versi Zod.
const roleSchema = z.string().refine((val) => NON_ADMIN_ROLES.includes(val), {
  message: `Role harus salah satu dari: ${NON_ADMIN_ROLES.join(', ')}`,
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  password: passwordSchema,
  role: roleSchema,
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

// Dipakai setelah login mendeteksi user multi-role: butuh pendingToken
// (token sementara dari respons login) + role pilihan untuk diaktifkan.
export const selectRoleSchema = z.object({
  pendingToken: z.string().min(10, 'Token pemilihan role tidak valid'),
  role: roleSchema,
});

export const switchRoleSchema = z.object({
  role: roleSchema,
});

export const addRoleSchema = switchRoleSchema;
