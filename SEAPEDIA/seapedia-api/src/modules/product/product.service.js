import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

const requireOwnStore = async (sellerId) => {
  const store = await prisma.store.findUnique({ where: { ownerId: sellerId } });
  if (!store) {
    throw new AppError('Anda harus membuat profil toko terlebih dahulu sebelum menambah produk', 400);
  }
  return store;
};

const findOwnedProduct = async (sellerId, productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });
  if (!product) throw new AppError('Produk tidak ditemukan', 404);
  if (product.store.ownerId !== sellerId) {
    throw new AppError('Anda tidak memiliki akses ke produk ini', 403);
  }
  return product;
};

export const createProduct = async (sellerId, data) => {
  const store = await requireOwnStore(sellerId);
  return prisma.product.create({ data: { ...data, storeId: store.id } });
};

export const updateProduct = async (sellerId, productId, data) => {
  await findOwnedProduct(sellerId, productId);
  return prisma.product.update({ where: { id: productId }, data });
};

export const deleteProduct = async (sellerId, productId) => {
  await findOwnedProduct(sellerId, productId);

  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    // Produk sudah pernah dipesan - jangan hard delete (akan merusak histori
    // order lama), cukup nonaktifkan supaya hilang dari katalog publik.
    return prisma.product.update({ where: { id: productId }, data: { isActive: false } });
  }

  await prisma.product.delete({ where: { id: productId } });
  return null;
};

export const listMyProducts = async (sellerId) => {
  const store = await prisma.store.findUnique({ where: { ownerId: sellerId } });
  if (!store) return [];
  return prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  });
};

export const listPublicProducts = async ({ page, limit, storeId, search }) => {
  const skip = (page - 1) * limit;
  const where = {
    isActive: true,
    ...(storeId ? { storeId } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
};

export const getPublicProduct = async (productId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    include: { store: { select: { id: true, name: true, description: true } } },
  });
  if (!product) throw new AppError('Produk tidak ditemukan', 404);
  return product;
};
