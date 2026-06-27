// Karena SQLite tidak punya native enum di Prisma, semua "pilihan tetap"
// distandarkan di sini supaya seluruh modul backend mengacu ke satu sumber.

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  BUYER: 'BUYER',
  DRIVER: 'DRIVER',
});

// Role yang boleh dipilih sendiri oleh user saat registrasi.
// ADMIN sengaja tidak masuk sini - akun admin hanya lewat seed data.
export const NON_ADMIN_ROLES = [ROLES.BUYER, ROLES.SELLER, ROLES.DRIVER];
export const ALL_ROLES = Object.values(ROLES);

export const ORDER_STATUS = Object.freeze({
  SEDANG_DIKEMAS: 'SEDANG_DIKEMAS',
  MENUNGGU_PENGIRIM: 'MENUNGGU_PENGIRIM',
  SEDANG_DIKIRIM: 'SEDANG_DIKIRIM',
  PESANAN_SELESAI: 'PESANAN_SELESAI',
  DIKEMBALIKAN: 'DIKEMBALIKAN',
});

export const DELIVERY_METHOD = Object.freeze({
  INSTANT: 'INSTANT',
  NEXT_DAY: 'NEXT_DAY',
  REGULAR: 'REGULAR',
});

export const DISCOUNT_SOURCE = Object.freeze({
  VOUCHER: 'VOUCHER',
  PROMO: 'PROMO',
});

export const DISCOUNT_TYPE = Object.freeze({
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
});

export const WALLET_TX_TYPE = Object.freeze({
  TOPUP: 'TOPUP',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  SELLER_INCOME: 'SELLER_INCOME',
  SELLER_INCOME_REVERSAL: 'SELLER_INCOME_REVERSAL',
  DRIVER_EARNING: 'DRIVER_EARNING',
});

export const DELIVERY_JOB_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  TAKEN: 'TAKEN',
  COMPLETED: 'COMPLETED',
});

// --- Aturan bisnis (boleh diubah di sini saja, didokumentasikan juga di README) ---

export const DELIVERY_FEE = Object.freeze({
  INSTANT: 25000,
  NEXT_DAY: 15000,
  REGULAR: 9000,
});

export const PPN_RATE = 0.12;
export const DRIVER_EARNING_RATE = 0.8; // Driver dapat 80% dari ongkir, 20% fee platform

// SLA overdue dihitung dalam satuan "hari simulasi" sejak driver mengambil job
export const OVERDUE_SLA_DAYS = Object.freeze({
  INSTANT: 1,
  NEXT_DAY: 2,
  REGULAR: 4,
});
