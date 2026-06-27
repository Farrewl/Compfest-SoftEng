import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import { ROLES } from '../../constants/enums.js';

const SALT_ROUNDS = 10;
const ROLE_SELECTION_TOKEN_TTL = '5m';

const buildSessionToken = (user, activeRole) => signToken({ sub: user.id, activeRole });

const toPublicUser = (user, activeRole) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  roles: user.roles.map((r) => r.role),
  activeRole,
  walletBalance: user.wallet?.balance ?? 0,
});

export const registerUser = async ({ username, email, password, role }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    throw new AppError(
      existing.username === username ? 'Username sudah digunakan' : 'Email sudah digunakan',
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      roles: { create: { role } },
      wallet: { create: { balance: 0 } },
    },
    include: { roles: true, wallet: true },
  });

  return toPublicUser(user, role);
};

export const loginUser = async ({ username, password }) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { roles: true, wallet: true },
  });

  // Pesan disamakan untuk username salah maupun password salah, supaya
  // tidak membantu penyerang menebak username mana saja yang valid.
  if (!user) {
    throw new AppError('Username atau kata sandi salah', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Username atau kata sandi salah', 401);
  }

  const ownedRoles = user.roles.map((r) => r.role);
  const nonAdminRoles = ownedRoles.filter((r) => r !== ROLES.ADMIN);

  // Admin, atau pemilik tepat satu role non-admin -> langsung dapat sesi penuh.
  if (ownedRoles.includes(ROLES.ADMIN) || nonAdminRoles.length <= 1) {
    const activeRole = ownedRoles.includes(ROLES.ADMIN) ? ROLES.ADMIN : nonAdminRoles[0];
    const token = buildSessionToken(user, activeRole);
    return {
      requiresRoleSelection: false,
      token,
      user: toPublicUser(user, activeRole),
    };
  }

  // Multi-role non-admin -> jangan langsung kasih sesi penuh, minta pilih role dulu.
  // pendingToken berumur pendek (5 menit) dan TIDAK pernah disimpan sebagai cookie.
  const pendingToken = signToken({ sub: user.id, purpose: 'role_selection' }, ROLE_SELECTION_TOKEN_TTL);

  return {
    requiresRoleSelection: true,
    pendingToken,
    roles: nonAdminRoles,
  };
};

export const completeRoleSelection = async ({ pendingToken, role }) => {
  let payload;
  try {
    payload = verifyToken(pendingToken);
  } catch {
    throw new AppError('Sesi pemilihan role sudah berakhir, silakan login kembali', 401);
  }

  if (payload.purpose !== 'role_selection') {
    throw new AppError('Token tidak valid untuk pemilihan role', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { roles: true, wallet: true },
  });
  if (!user) {
    throw new AppError('Akun tidak ditemukan', 404);
  }

  const ownedRoles = user.roles.map((r) => r.role);
  if (!ownedRoles.includes(role)) {
    throw new AppError('Anda tidak memiliki role tersebut', 403);
  }

  const token = buildSessionToken(user, role);
  return { token, user: toPublicUser(user, role) };
};

export const switchActiveRole = async ({ userId, role }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true, wallet: true },
  });
  if (!user) throw new AppError('Akun tidak ditemukan', 404);

  const ownedRoles = user.roles.map((r) => r.role);
  if (!ownedRoles.includes(role)) {
    throw new AppError('Anda tidak memiliki role tersebut', 403);
  }

  const token = buildSessionToken(user, role);
  return { token, user: toPublicUser(user, role) };
};

export const addRoleToUser = async ({ userId, role }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!user) throw new AppError('Akun tidak ditemukan', 404);

  const ownedRoles = user.roles.map((r) => r.role);
  if (ownedRoles.includes(role)) {
    throw new AppError('Anda sudah memiliki role tersebut', 409);
  }
  if (role === ROLES.ADMIN) {
    throw new AppError('Role Admin tidak dapat ditambahkan sendiri', 403);
  }

  await prisma.userRole.create({ data: { userId, role } });

  // Otomatis aktifkan role yang baru ditambahkan (konsisten dengan perilaku
  // yang sudah ada di Dashboard.jsx versi frontend kamu).
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true, wallet: true },
  });

  const token = buildSessionToken(updatedUser, role);
  return { token, user: toPublicUser(updatedUser, role) };
};

export const getProfile = async ({ userId, activeRole }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true, wallet: true },
  });
  if (!user) throw new AppError('Akun tidak ditemukan', 404);
  return toPublicUser(user, activeRole);
};
