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
  {
    // Seller kategori elektronik & arloji vintage - bukti SEAPEDIA bukan toko tanaman saja
    username: 'kios_waktu',
    email: 'kioswaktu@seapedia.com',
    password: 'Seller123!',
    roles: ['SELLER'],
  },
  {
    // Seller kategori buku & alat tulis
    username: 'pustaka_lama',
    email: 'pustakalama@seapedia.com',
    password: 'Seller123!',
    roles: ['SELLER'],
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

  // --- Seed toko & produk demo (lintas kategori, bukan toko tanaman saja) ---
  console.log('\nMenyiapkan toko dan produk demo...');

  const sellerUser  = await prisma.user.findUnique({ where: { username: 'toko_hutan' } });
  const multiUser   = await prisma.user.findUnique({ where: { username: 'pengembara_akar' } });
  const kiosWaktu   = await prisma.user.findUnique({ where: { username: 'kios_waktu' } });
  const pustakaLama = await prisma.user.findUnique({ where: { username: 'pustaka_lama' } });

  const storeDefs = [
    { owner: sellerUser,  name: 'Toko Hutan Akar', description: 'Kategori Tumbuhan & Berkebun - pemasok bibit pilihan, pupuk organik, dan perlengkapan berkebun warisan leluhur.' },
    { owner: multiUser,   name: 'Antik Navigator', description: 'Kategori Navigasi & Aksesoris Petualang - peralatan navigasi, peta, dan perlengkapan kulit dari era keemasan eksplorasi.' },
    { owner: kiosWaktu,   name: 'Kios Waktu', description: 'Kategori Elektronik & Arloji Vintage - radio tabung, kamera film, dan jam saku yang masih berfungsi sempurna.' },
    { owner: pustakaLama, name: 'Pustaka Lama', description: 'Kategori Buku & Alat Tulis - novel klasik, alat tulis kuno, dan perlengkapan menulis bergaya lampau.' },
  ];

  const stores = {};
  for (const def of storeDefs) {
    const store = await prisma.store.upsert({
      where: { ownerId: def.owner.id },
      update: {},
      create: { ownerId: def.owner.id, name: def.name, description: def.description },
    });
    stores[def.name] = store;
  }

  const demoProducts = [
    // Kategori: Tumbuhan & Berkebun
    { storeId: stores['Toko Hutan Akar'].id, name: 'Bibit Jati Emas Kuno', description: 'Bibit pohon jati kualitas terbaik yang telah disemai dengan metode tradisional kuno. Memastikan pertumbuhan akar yang kuat dan kayu yang kokoh untuk menopang kehidupan berabad-abad.', price: 50000,  stock: 100, imageEmoji: '🌱' },
    { storeId: stores['Toko Hutan Akar'].id, name: 'Pupuk Organik Akar',   description: 'Campuran daun kering, humus, dan rempah alam rahasia yang diracik khusus untuk mempercepat pertumbuhan akar tanaman hias maupun pohon keras secara alami.',               price: 35000,  stock: 200, imageEmoji: '🌿' },
    { storeId: stores['Toko Hutan Akar'].id, name: 'Pot Tanah Liat Vintage', description: 'Pot tanah liat buatan tangan dengan ukiran motif akar pohon. Membantu menjaga kelembapan tanah dengan sirkulasi udara yang natural, peninggalan pengrajin masa lampau.',    price: 75000,  stock: 50,  imageEmoji: '🏺' },

    // Kategori: Navigasi & Aksesoris Petualang
    { storeId: stores['Antik Navigator'].id, name: 'Kompas Kuningan Tua',  description: 'Alat navigasi kuningan asli peninggalan pelaut abad ke-19. Masih berfungsi dengan baik, memandu jalan kembali ke akar bagi pengembara yang tersesat di belantara.',            price: 150000, stock: 15,  imageEmoji: '🧭' },
    { storeId: stores['Antik Navigator'].id, name: 'Peta Rempah Nusantara', description: 'Reproduksi peta kuno jalur perdagangan rempah Nusantara abad ke-17, dicetak di atas kertas daur ulang dengan tinta alami. Dekorasi dinding bernilai sejarah tinggi.',       price: 95000,  stock: 30,  imageEmoji: '🗺️' },
    { storeId: stores['Antik Navigator'].id, name: 'Tas Kulit Pengembara Vintage', description: 'Tas selempang kulit asli dengan jahitan tangan, dilengkapi gesper kuningan antik. Tahan lama dan cocok untuk perjalanan jauh maupun gaya sehari-hari.',         price: 225000, stock: 10,  imageEmoji: '👜' },

    // Kategori: Elektronik & Arloji Vintage
    { storeId: stores['Kios Waktu'].id, name: 'Radio Tabung Antik',        description: 'Radio tabung dengan bodi kayu asli era 1960-an, telah direstorasi dan dapat menerima siaran AM. Suara hangat khas radio analog, jarang ditemukan dalam kondisi prima.', price: 850000, stock: 5,   imageEmoji: '📻' },
    { storeId: stores['Kios Waktu'].id, name: 'Kamera Film Klasik 35mm',   description: 'Kamera analog mekanis sepenuhnya, tanpa baterai, dengan lensa kaca asli. Pilihan favorit penggemar fotografi film untuk hasil bernuansa nostalgia.',                 price: 650000, stock: 8,   imageEmoji: '📷' },
    { storeId: stores['Kios Waktu'].id, name: 'Jam Saku Perak Berukir',    description: 'Jam saku mekanis dengan ukiran motif daun di bagian penutup, rantai perak asli, dan mesin yang masih akurat menjaga waktu.',                                          price: 320000, stock: 12,  imageEmoji: '⌚' },

    // Kategori: Buku & Alat Tulis
    { storeId: stores['Pustaka Lama'].id, name: 'Novel Klasik Bersampul Kulit', description: 'Cetakan ulang novel klasik dengan sampul kulit asli dan halaman bertepi emas. Koleksi wajib bagi pecinta sastra dan buku antik.',                            price: 180000, stock: 20,  imageEmoji: '📚' },
    { storeId: stores['Pustaka Lama'].id, name: 'Pena Bulu & Tinta Sepia',  description: 'Set pena bulu angsa lengkap dengan tinta sepia alami, cocok untuk kaligrafi maupun sekadar menulis surat bergaya zaman dahulu.',                                      price: 65000,  stock: 40,  imageEmoji: '🪶' },
    { storeId: stores['Pustaka Lama'].id, name: 'Buku Catatan Kertas Daur Ulang', description: 'Buku catatan bersampul kanvas dengan kertas daur ulang bertekstur, dijahit tangan. Ideal untuk jurnal harian maupun sketsa perjalanan.',                  price: 48000,  stock: 60,  imageEmoji: '📓' },
  ];

  for (const p of demoProducts) {
    const exists = await prisma.product.findFirst({ where: { name: p.name, storeId: p.storeId } });
    if (!exists) {
      await prisma.product.create({ data: p });
      console.log(`  Produk: ${p.name}`);
    }
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
