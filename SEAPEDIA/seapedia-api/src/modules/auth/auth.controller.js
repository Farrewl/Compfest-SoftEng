import { asyncHandler } from '../../utils/asyncHandler.js';
import { COOKIE_NAME, cookieOptions } from '../../utils/jwt.js';
import * as authService from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  selectRoleSchema,
  switchRoleSchema,
  addRoleSchema,
} from './auth.validators.js';

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const user = await authService.registerUser(data);
  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil, silakan masuk',
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginUser(data);

  if (result.requiresRoleSelection) {
    return res.status(200).json({
      success: true,
      requiresRoleSelection: true,
      pendingToken: result.pendingToken,
      roles: result.roles,
      message: 'Akun ini punya lebih dari satu role, pilih role aktif untuk sesi ini',
    });
  }

  res.cookie(COOKIE_NAME, result.token, cookieOptions);
  res.status(200).json({
    success: true,
    requiresRoleSelection: false,
    message: 'Login berhasil',
    data: result.user,
  });
});

export const selectRole = asyncHandler(async (req, res) => {
  const { pendingToken, role } = selectRoleSchema.parse(req.body);
  const result = await authService.completeRoleSelection({ pendingToken, role });

  res.cookie(COOKIE_NAME, result.token, cookieOptions);
  res.status(200).json({
    success: true,
    message: `Role ${role} berhasil diaktifkan`,
    data: result.user,
  });
});

export const switchRole = asyncHandler(async (req, res) => {
  const { role } = switchRoleSchema.parse(req.body);
  const result = await authService.switchActiveRole({ userId: req.user.id, role });

  res.cookie(COOKIE_NAME, result.token, cookieOptions);
  res.status(200).json({
    success: true,
    message: `Berhasil beralih ke role ${role}`,
    data: result.user,
  });
});

export const addRole = asyncHandler(async (req, res) => {
  const { role } = addRoleSchema.parse(req.body);
  const result = await authService.addRoleToUser({ userId: req.user.id, role });

  res.cookie(COOKIE_NAME, result.token, cookieOptions);
  res.status(201).json({
    success: true,
    message: `Role ${role} berhasil ditambahkan dan diaktifkan`,
    data: result.user,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile({
    userId: req.user.id,
    activeRole: req.user.activeRole,
  });
  res.status(200).json({ success: true, data: user });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logout berhasil' });
});
