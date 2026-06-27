import { PrismaClient } from '@prisma/client';

// Pola singleton: simpan instance di globalThis supaya kalau ada
// hot-reload (mis. saat pindah ke tooling lain) tidak bikin koneksi
// database baru berkali-kali.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
