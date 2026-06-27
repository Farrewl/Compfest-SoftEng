import { z } from 'zod';

export const createReviewSchema = z.object({
  name: z.string().trim().max(50, 'Nama maksimal 50 karakter').optional(),
  rating: z.coerce
    .number()
    .int('Rating harus bilangan bulat')
    .min(1, 'Rating minimal 1 bintang')
    .max(5, 'Rating maksimal 5 bintang'),
  comment: z
    .string()
    .trim()
    .min(3, 'Komentar minimal 3 karakter')
    .max(500, 'Komentar maksimal 500 karakter'),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
