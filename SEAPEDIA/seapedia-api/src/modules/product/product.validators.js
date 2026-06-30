import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(3, 'Nama produk minimal 3 karakter').max(100, 'Nama produk maksimal 100 karakter'),
  description: z.string().trim().min(3, 'Deskripsi minimal 3 karakter').max(1000, 'Deskripsi maksimal 1000 karakter'),
  price: z.coerce.number().int('Harga harus bilangan bulat').positive('Harga harus lebih dari 0'),
  stock: z.coerce.number().int('Stok harus bilangan bulat').min(0, 'Stok tidak boleh negatif'),
  imageEmoji: z.string().trim().max(8, 'Emoji terlalu panjang').optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  storeId: z.string().optional(),
  search: z.string().trim().max(100).optional(),
});
