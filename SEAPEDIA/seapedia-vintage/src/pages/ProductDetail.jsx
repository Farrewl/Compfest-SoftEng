import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootButton, OrganicCard } from '../components/UI';
import { getPublicProduct } from '../api/products';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getPublicProduct(id);
        if (isMounted) setProduct(res.data.data);
      } catch (err) {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#84934A] italic animate-pulse text-lg">Memuat detail produk...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#84934A] gap-4">
        <span className="text-6xl">🍂</span>
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Jejak Tidak Ditemukan</h2>
        <p className="text-sm opacity-70">Produk yang Anda cari mungkin sudah dipindahkan atau dihapus.</p>
        <RootButton onClick={() => navigate('/')}>Kembali ke Katalog</RootButton>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 mt-12 mb-20 max-w-5xl"
    >
      <RootButton variant="secondary" onClick={() => navigate('/')} className="mb-8 w-fit text-sm">
        ← Kembali
      </RootButton>

      <OrganicCard className="flex flex-col md:flex-row gap-10 items-center md:items-stretch p-8">
        {/* Gambar/Ikon Produk */}
        <div className="w-full md:w-1/2 h-72 md:h-auto bg-[#84934A]/10 rounded-2xl flex items-center justify-center border-2 border-[#84934A]/30 shadow-inner min-h-[200px]">
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-9xl drop-shadow-lg"
          >
            {product.imageEmoji}
          </motion.span>
        </div>

        {/* Detail Informasi */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Breadcrumb toko */}
          <p className="text-xs text-[#84934A] font-bold uppercase tracking-widest mb-2">
            🏪 {product.store?.name ?? 'Toko'}
          </p>

          <h1
            className="text-3xl md:text-4xl text-[#492828] font-bold mb-2"
            style={{ fontFamily: 'Playfair Display' }}
          >
            {product.name}
          </h1>

          {/* Stok */}
          <p className={`text-xs font-bold mb-4 px-2 py-1 rounded-full inline-flex w-fit ${
            product.stock > 0
              ? 'bg-[#656D3F]/10 text-[#656D3F]'
              : 'bg-red-100 text-red-600'
          }`}>
            {product.stock > 0 ? `✓ Stok tersedia (${product.stock})` : '✗ Stok habis'}
          </p>

          <div className="mb-6 flex-grow">
            <h3
              className="text-[#84934A] font-bold mb-2"
              style={{ fontFamily: 'Playfair Display' }}
            >
              Deskripsi Produk
            </h3>
            <p className="text-[#492828] leading-relaxed text-justify opacity-90 text-sm">
              {product.description}
            </p>
          </div>

          {/* Info toko */}
          {product.store?.description && (
            <div className="mb-4 p-3 bg-[#84934A]/5 rounded-lg border border-[#84934A]/20">
              <p className="text-xs font-bold text-[#84934A] mb-1">Tentang Toko</p>
              <p className="text-xs text-[#492828]">{product.store.description}</p>
            </div>
          )}

          {/* Harga & CTA */}
          <div className="mt-auto bg-[#ECECEC] p-6 rounded-tl-[2rem] rounded-br-[2rem] border-l-4 border-[#84934A] shadow-md">
            <p className="text-sm text-[#492828] mb-1 font-bold">Harga Penukaran</p>
            <p className="text-3xl text-[#84934A] font-bold mb-4">
              {product.price.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              })}
            </p>

            {/* Peringatan untuk tamu - bisa beli setelah Level 3 tersambung */}
            <div className="text-center p-4 bg-white/70 border-2 border-[#84934A]/30 rounded-xl border-dashed">
              <p className="text-sm text-[#492828]">
                Buku catatan transaksi terkunci.{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-bold text-[#84934A] underline hover:text-[#492828] transition-colors"
                >
                  Masuk atau Daftar
                </button>{' '}
                terlebih dahulu untuk melakukan pemesanan.
              </p>
            </div>
          </div>
        </div>
      </OrganicCard>
    </motion.div>
  );
}
