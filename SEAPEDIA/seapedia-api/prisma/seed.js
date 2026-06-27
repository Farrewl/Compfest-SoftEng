import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const demoAccounts = [
  {
    username: process.env.ADMIN_USERNAME || 'admin_akar',
    email: process.env.ADMIN_EMAIL || 'admin@seapedia.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    roles: ['ADMIN'],
  },
  {
    username: 'toko_hutan',
    email: 'seller@seapedia.com',
    password: 'Seller123!',
    roles: ['SELLER'],
  },
  {
    username: 'pembeli_akar',
    email: 'buyer@seapedia.com',
    password: 'Buyer123!',
    roles: ['BUYER'],
  },
  {
    username: 'kurir_akar',
    email: 'driver@seapedia.com',
    password: 'Driver123!',
    roles: ['DRIVER'],
  },
  {
    // Akun multi-role untuk mendemokan alur pemilihan role aktif
    username: 'pengembara_akar',
    email: 'pengembara@seapedia.com',
    password: 'Pengembara123!',
    roles: ['BUYER', 'SELLER', 'DRIVER'],
  },
];

async function main() {
  console.log('Mulai seeding data demo SEAPEDIA...\n');

  for (const account of demoAccounts) {
    const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);
    const isBuyer = account.roles.includes('BUYER');

    const user = await prisma.user.upsert({
      where: { username: account.username },
      update: {},
      create: {
        username: account.username,
        email: account.email,
        passwordHash,
        wallet: { create: { balance: isBuyer ? 500000 : 0 } },
        roles: { create: account.roles.map((role) => ({ role })) },
      },
    });

    console.log(`Akun siap: ${user.username} (role: ${account.roles.join(', ')})`);
  }

  // Inisialisasi singleton SystemClock kalau belum ada (untuk simulasi hari di Level 6)
  await prisma.systemClock.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log('\nSeeding selesai. Daftar akun demo (password ada di README):');
  demoAccounts.forEach((a) => console.log(`  - ${a.username.padEnd(18)} -> ${a.roles.join(', ')}`));
}

main()
  .catch((err) => {
    console.error('Seeding gagal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
