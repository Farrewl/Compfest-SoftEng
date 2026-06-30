import { z } from 'zod';

export const upsertStoreSchema = z.object({
  name: z.string().trim().min(3, 'Nama toko minimal 3 karakter').max(50, 'Nama toko maksimal 50 karakter'),
  description: z.string().trim().max(300, 'Deskripsi maksimal 300 karakter').optional().or(z.literal('')),
});
