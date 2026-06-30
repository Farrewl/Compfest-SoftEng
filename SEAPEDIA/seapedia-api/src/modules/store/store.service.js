import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getMyStore = async (ownerId) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    include: { _count: { select: { products: true } } },
  });
  return store;
};

export const upsertMyStore = async (ownerId, { name, description }) => {
  // Cek manual selain unique constraint di DB, supaya pesan errornya jelas
  // dan tidak bocor sebagai error Prisma mentah.
  const existingWithName = await prisma.store.findUnique({ where: { name } });
  if (existingWithName && existingWithName.ownerId !== ownerId) {
    throw new AppError('Nama toko sudah digunakan, coba nama lain', 409);
  }

  const store = await prisma.store.upsert({
    where: { ownerId },
    update: { name, description: description || null },
    create: { ownerId, name, description: description || null },
  });

  return store;
};

export const getPublicStore = async (storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });
  if (!store) throw new AppError('Toko tidak ditemukan', 404);
  return store;
};

export const listPublicStores = async () => {
  return prisma.store.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
