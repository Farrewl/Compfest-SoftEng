# Panduan Deployment SEAPEDIA

Dokumen ini menjelaskan cara membuat SEAPEDIA bisa diakses lewat link publik,
bukan cuma `localhost`. Ikuti urutan di bawah - tiap langkah punya dependensi
ke langkah sebelumnya.

## Mengapa tidak SQLite saja?

Hosting gratis (Render, Railway, dst) memakai *ephemeral filesystem* - disknya
ikut di-reset setiap ada deploy baru dari git push. Kalau database masih
SQLite (file lokal), seluruh data (akun, order, dst) ikut hilang setiap kali
kamu push update kode. Solusinya: database dipisah ke layanan terkelola yang
hidup independen dari server aplikasi - di sini kita pakai **Neon** (Postgres
gratis, tanpa kedaluwarsa).

## Arsitektur

```
GitHub repo (1 repo, 2 folder)
├── seapedia-api/      --> di-deploy ke Render   (Node.js Web Service)
└── seapedia-vintage/  --> di-deploy ke Vercel    (Static Site / Vite)

Database (Postgres) --> Neon, terpisah dari kedua deployment di atas
```

---

## Langkah 1 - Push ke GitHub

Dari folder root project (yang berisi `seapedia-api/` dan `seapedia-vintage/`):

```bash
git init
git add .
git commit -m "Initial commit: Level 1 - public marketplace, auth, review"
```

Buat repo baru di github.com (klik "New repository", **jangan** centang "Add a
README" supaya tidak konflik), lalu:

```bash
git remote add origin https://github.com/USERNAME/seapedia.git
git branch -M main
git push -u origin main
```

Pastikan repo bersifat **Public** (Settings > General > Danger Zone, atau
dipilih saat membuat repo) supaya evaluator bisa mengakses.

> Setelah ini, setiap kali kamu mau update, cukup `git add . && git commit -m "..." && git push` -
> Render dan Vercel otomatis re-deploy.

---

## Langkah 2 - Buat database di Neon

1. Daftar di [neon.tech](https://neon.tech) (gratis, tanpa kartu kredit).
2. Buat project baru, beri nama `seapedia`.
3. Di dashboard, klik **Connect** lalu copy **Connection string**-nya. Bentuknya:
   ```
   postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
   ```

## Langkah 3 - Pindahkan backend lokal ke Postgres

Di folder `seapedia-api`:

```bash
# Hapus migration history lama yang dibuat untuk SQLite
rm -rf prisma/migrations

# Update .env - ganti DATABASE_URL dengan connection string Neon dari Langkah 2
# (gunakan editor, bukan command ini langsung)

# Buat migration baru yang cocok untuk Postgres
npx prisma migrate dev --name init

# Isi data demo ke database Neon (langsung dari komputer kamu)
npm run seed
```

Cek hasilnya dengan `npx prisma studio` - harus muncul tabel-tabel terisi data
demo. Kalau ini berhasil, berarti koneksi ke Neon sudah benar dan langkah
deploy backend di Render tinggal pakai connection string yang sama.

## Langkah 4 - Deploy backend ke Render

1. Daftar di [render.com](https://render.com), hubungkan akun GitHub kamu.
2. **New > Web Service** > pilih repo `seapedia` yang baru di-push.
3. Isi konfigurasi:
   | Field | Nilai |
   |---|---|
   | Root Directory | `seapedia-api` |
   | Runtime | Node |
   | Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
   | Start Command | `node server.js` |
   | Instance Type | Free |
4. Di tab **Environment**, tambahkan variabel berikut (nilai dari `.env` lokal kamu, JWT_SECRET sebaiknya beda dari lokal):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string Neon (sama seperti lokal) |
   | `JWT_SECRET` | string acak baru (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_ORIGIN` | isi sementara dengan `http://localhost:5173`, **akan diupdate di Langkah 6** |
5. Klik **Create Web Service**. Tunggu build selesai, kamu akan dapat URL seperti `https://seapedia-api-xxxx.onrender.com`.
6. Tes: buka `https://seapedia-api-xxxx.onrender.com/api/health` di browser - harus muncul JSON status sehat.

> Free tier Render "tidur" setelah 15 menit tanpa traffic, lalu butuh 30-60 detik untuk bangun lagi di request pertama. Wajar untuk demo gratis - kalau mau selalu aktif, instance Starter berbayar ($7/bln) menghilangkan ini.

## Langkah 5 - Deploy frontend ke Vercel

1. Daftar di [vercel.com](https://vercel.com), hubungkan akun GitHub.
2. **Add New > Project** > pilih repo yang sama.
3. Isi konfigurasi:
   | Field | Nilai |
   |---|---|
   | Root Directory | `seapedia-vintage` |
   | Framework Preset | Vite (otomatis terdeteksi) |
   | Build Command | `npm run build` (default) |
   | Output Directory | `dist` (default) |
4. Tambahkan Environment Variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://seapedia-api-xxxx.onrender.com/api` (URL Render dari Langkah 4, akhiri dengan `/api`) |
5. Klik **Deploy**. Kamu akan dapat URL seperti `https://seapedia-vintage.vercel.app` - **ini link yang bisa dibagikan ke orang lain.**

## Langkah 6 - Sambungkan balik (CORS)

Backend perlu tahu domain frontend mana yang boleh akses (supaya cookie sesi
tidak ditolak browser):

1. Balik ke dashboard Render > service `seapedia-api` > tab **Environment**.
2. Update `CLIENT_ORIGIN` jadi URL Vercel kamu, **tanpa garis miring di akhir**, misal:
   `https://seapedia-vintage.vercel.app`
3. Save - Render otomatis restart service dengan env var baru.

## Langkah 7 - Verifikasi

Buka link Vercel kamu di browser (boleh mode incognito), coba:
- Daftar akun baru, login, lihat Dashboard dengan saldo dari database asli.
- Submit ulasan publik di halaman utama.
- Login pakai akun demo `pengembara_akar` / `Pengembara123!` untuk tes alur pilih role.

Kalau login gagal dengan error CORS di console browser, paling sering sebabnya
`CLIENT_ORIGIN` di Render belum cocok persis dengan URL Vercel (termasuk
`https://` dan tanpa trailing slash).

---

## Referensi cepat - environment variables

**`seapedia-api` (Render):**
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `CLIENT_ORIGIN`

**`seapedia-vintage` (Vercel):**
`VITE_API_URL`

## Update berikutnya

Setelah setup awal ini selesai, workflow harian kamu jadi simpel:

```bash
git add .
git commit -m "Level 2: seller store & product CRUD"
git push
```

Render dan Vercel otomatis build & deploy ulang. Kalau ada perubahan skema
database (model baru), jalankan `npx prisma migrate dev --name <nama>` di
lokal dulu (supaya file migration ikut ter-commit), baru push - Render akan
menjalankan `prisma migrate deploy` otomatis lewat Build Command di atas.
