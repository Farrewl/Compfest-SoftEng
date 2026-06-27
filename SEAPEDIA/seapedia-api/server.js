import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`SEAPEDIA API berjalan di http://localhost:${PORT}`);
  console.log(`Cek kesehatan server di http://localhost:${PORT}/api/health`);
});

// Kalau ada promise yang reject tanpa ditangani, jangan biarkan server
// jalan di state yang nggak jelas - matikan dengan baik.
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Mematikan server...', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM diterima, mematikan server dengan baik...');
  server.close(() => console.log('Proses dihentikan.'));
});
