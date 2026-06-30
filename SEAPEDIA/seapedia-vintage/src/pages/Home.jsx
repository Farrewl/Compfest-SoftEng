import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RootButton, OrganicCard, OrganicInput } from '../components/UI';
import { getReviews, submitReview } from '../api/reviews';
import { listPublicProducts } from '../api/products';

export default function Home() {
  const navigate = useNavigate();

  // State katalog produk - sekarang dari backend, bukan dummy lagi
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Ambil katalog produk publik setiap kali halaman ini dibuka
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await listPublicProducts({ limit: 8 });
        if (isMounted) setProducts(res.data.items);
      } catch {
        // Gagal memuat katalog tidak perlu menghentikan seluruh halaman
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);
  
  // State untuk menyimpan data ulasan
  const [review, setReview] = useState({ name: "", rating: 5, comment: "" });
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Ambil ulasan asli dari backend setiap kali halaman ini dibuka
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getReviews({ limit: 10 });
        if (isMounted) setReviews(res.data.items);
      } catch {
        // Gagal memuat ulasan tidak perlu menghentikan seluruh halaman
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Fungsi untuk menangani pengiriman ulasan - sekarang benar-benar tersimpan di database
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!review.comment) return; // Mencegah ulasan kosong
    setIsSubmittingReview(true);
    setReviewError("");
    try {
      const res = await submitReview(review);
      // Menambahkan ulasan baru ke urutan paling atas
      setReviews([res.data.data, ...reviews]);
      // Mereset form kembali ke awal
      setReview({ name: "", rating: 5, comment: "" });
    } catch (err) {
      setReviewError(
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Gagal mengirim ulasan, coba lagi."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="container mx-auto space-y-20 mt-8 p-4 mb-16"
    >
      
      {/* 1. HERO SECTION (Perkenalan Marketplace Multirole) */}
      <section className="text-center py-16 relative">
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl text-[#492828] mb-6 font-bold tracking-wide"
          style={{ fontFamily: 'Playfair Display' }}
        >
          Welcome to SEAPEDIA
        </motion.h1>
        <p className="text-lg text-[#84934A] max-w-2xl mx-auto font-medium leading-relaxed">
          Marketplace tempat kamu mencari barang-barang yang kamu inginkan, menjual barang-barang yang kamu miliki!!
        </p>
      </section>

      {/* 2. KATALOG PUBLIK (Syarat Level 1: Read-Only untuk Tamu) */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl text-[#492828] font-bold inline-block border-b-4 border-[#84934A] pb-2" style={{ fontFamily: 'Playfair Display' }}>
            Katalog Publik
          </h2>
          <p className="text-[#84934A] mt-3">Silakan lihat koleksi kami. Login untuk melakukan transaksi.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {isLoadingProducts ? (
            <p className="col-span-full text-center text-[#84934A] italic py-10">Memuat katalog...</p>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center text-[#84934A] italic py-10">
              <span className="text-5xl block mb-3">🪴</span>
              <p>Belum ada produk yang tersedia. Seller, ayo buka toko!</p>
            </div>
          ) : (
            products.map(product => (
              <OrganicCard key={product.id} className="flex flex-col">
                <div className="h-40 bg-[#84934A]/10 rounded-t-xl mb-4 flex items-center justify-center border border-[#84934A]/30">
                  <span className="text-6xl drop-shadow-md">{product.imageEmoji}</span>
                </div>
                <h3 className="text-xl text-[#492828] font-bold mb-1" style={{ fontFamily: 'Playfair Display' }}>
                  {product.name}
                </h3>
                <p className="text-sm text-[#656D3F] mb-3 font-semibold">Toko: {product.store.name}</p>
                <p className="text-xl text-[#84934A] font-bold mb-6">
                  {product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
                
                {/* Tombol diarahkan ke Halaman Detail Produk */}
                <div className="mt-auto">
                  <RootButton 
                    className="w-full text-sm" 
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    Lihat Detail
                  </RootButton>
                </div>
              </OrganicCard>
            ))
          )}
        </div>
      </section>

      {/* 3. FITUR ULASAN PUBLIK (Syarat Level 1: Tanpa Login) */}
      <section className="max-w-5xl mx-auto bg-white/50 p-8 rounded-[3rem] border-2 border-[#84934A]/20 shadow-lg">
        <h2 className="text-3xl text-[#492828] mb-8 text-center font-bold" style={{ fontFamily: 'Playfair Display' }}>
          Ulasan Publik
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Input Ulasan */}
          <form onSubmit={handleReviewSubmit} className="bg-[#ECECEC] p-6 rounded-br-[3rem] rounded-tl-[1rem] border-l-4 border-[#84934A] shadow-md h-fit">
            <OrganicInput 
              label="Nama Anda" 
              placeholder="Anonim" 
              value={review.name} 
              onChange={(e) => setReview({...review, name: e.target.value})} 
            />
            <div className="mb-4">
              <label className="text-[#492828] mb-1 block font-bold" style={{ fontFamily: 'Playfair Display' }}>
                Rating Bintang
              </label>
              <select 
                className="w-full bg-[#ECECEC] border-b-2 border-[#84934A] focus:border-[#492828] outline-none px-3 py-2 cursor-pointer text-[#492828] font-bold" 
                value={review.rating} 
                onChange={(e) => setReview({...review, rating: Number(e.target.value)})}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (Sempurna)</option>
                <option value={4}>⭐⭐⭐⭐ (Sangat Bagus)</option>
                <option value={3}>⭐⭐⭐ (Bagus)</option>
                <option value={2}>⭐⭐ (Biasa)</option>
                <option value={1}>⭐ (Kurang)</option>
              </select>
            </div>
            <OrganicInput 
              label="Komentar" 
              placeholder="Bagikan pengalaman Anda..." 
              value={review.comment} 
              onChange={(e) => setReview({...review, comment: e.target.value})} 
              required={true}
            />
            {reviewError && <p className="text-red-600 text-xs font-bold mt-1">{reviewError}</p>}
            <RootButton type="submit" className="w-full mt-6" disabled={isSubmittingReview}>
              {isSubmittingReview ? 'Mengirim...' : 'Tinggalkan Jejak'}
            </RootButton>
          </form>
          
          {/* Daftar Ulasan */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingReviews ? (
              <div className="h-full flex flex-col items-center justify-center text-[#84934A] italic text-center opacity-70 py-10">
                <span className="text-4xl mb-2 animate-pulse">🍃</span>
                <p>Memuat jejak para pengembara...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#84934A] italic text-center opacity-70 py-10">
                <span className="text-4xl mb-2">🍃</span>
                <p>Belum ada ulasan.<br/>Jadilah daun pertama yang gugur meninggalkan cerita!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  key={r.id} 
                  className="bg-white p-5 rounded-xl rounded-br-[2rem] shadow-sm border-l-4 border-[#656D3F]"
                >
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-[#492828] text-lg" style={{ fontFamily: 'Playfair Display' }}>
                      {r.name || "Pengembara Anonim"}
                    </strong>
                    <span className="text-yellow-600 tracking-widest text-sm">
                      {'★'.repeat(r.rating)}
                    </span>
                  </div>
                  <p className="mt-1 text-[#492828] leading-relaxed">{r.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

    </motion.div>
  );
}