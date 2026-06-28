import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RootButton, OrganicCard, OrganicInput } from '../components/UI';
import { getReviews, submitReview } from '../api/reviews';

// Data produk sementara (Dummy) sesuai syarat Level 1 jika backend belum ada
const DUMMY_PRODUCTS = [
  { id: 1, name: "Bibit Jati Emas Kuno", price: "Rp 50.000", store: "Toko Hutan" },
  { id: 2, name: "Pupuk Organik Akar", price: "Rp 35.000", store: "Tani Makmur" },
  { id: 3, name: "Pot Tanah Liat Vintage", price: "Rp 75.000", store: "Kriya Alam" },
  { id: 4, name: "Kompas Kuningan Tua", price: "Rp 150.000", store: "Antik Navigator" },
];

export default function Home() {
  const navigate = useNavigate();
  
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
          className="text-4xl md:text-6xl text-[#4A3B32] mb-6 font-bold tracking-wide"
          style={{ fontFamily: 'Playfair Display' }}
        >
          Jelajahi Akar Kehidupan
        </motion.h1>
        <p className="text-lg text-[#8B5A2B] max-w-2xl mx-auto font-medium leading-relaxed">
          Selamat datang di SEAPEDIA. Marketplace terintegrasi dengan ekosistem multi-peran (Seller, Buyer, Driver). 
          Temukan berbagai keajaiban botani dan peralatan kuno di sini.
        </p>
      </section>

      {/* 2. KATALOG PUBLIK (Syarat Level 1: Read-Only untuk Tamu) */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl text-[#4A3B32] font-bold inline-block border-b-4 border-[#8B5A2B] pb-2" style={{ fontFamily: 'Playfair Display' }}>
            Katalog Publik
          </h2>
          <p className="text-[#8B5A2B] mt-3">Silakan lihat koleksi kami. Login untuk melakukan transaksi.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {DUMMY_PRODUCTS.map(product => (
            <OrganicCard key={product.id} className="flex flex-col">
              <div className="h-40 bg-[#8B5A2B]/10 rounded-t-xl mb-4 flex items-center justify-center border border-[#8B5A2B]/30">
                <span className="text-6xl drop-shadow-md">🪴</span>
              </div>
              <h3 className="text-xl text-[#4A3B32] font-bold mb-1" style={{ fontFamily: 'Playfair Display' }}>
                {product.name}
              </h3>
              <p className="text-sm text-[#3B5E3C] mb-3 font-semibold">Toko: {product.store}</p>
              <p className="text-xl text-[#8B5A2B] font-bold mb-6">{product.price}</p>
              
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
          ))}
        </div>
      </section>

      {/* 3. FITUR ULASAN PUBLIK (Syarat Level 1: Tanpa Login) */}
      <section className="max-w-5xl mx-auto bg-white/50 p-8 rounded-[3rem] border-2 border-[#8B5A2B]/20 shadow-lg">
        <h2 className="text-3xl text-[#4A3B32] mb-8 text-center font-bold" style={{ fontFamily: 'Playfair Display' }}>
          Suara Pengembara (Ulasan)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Input Ulasan */}
          <form onSubmit={handleReviewSubmit} className="bg-[#F4ECD8] p-6 rounded-br-[3rem] rounded-tl-[1rem] border-l-4 border-[#8B5A2B] shadow-md h-fit">
            <OrganicInput 
              label="Nama Anda" 
              placeholder="Anonim" 
              value={review.name} 
              onChange={(e) => setReview({...review, name: e.target.value})} 
            />
            <div className="mb-4">
              <label className="text-[#4A3B32] mb-1 block font-bold" style={{ fontFamily: 'Playfair Display' }}>
                Rating Bintang
              </label>
              <select 
                className="w-full bg-[#F4ECD8] border-b-2 border-[#8B5A2B] focus:border-[#4A3B32] outline-none px-3 py-2 cursor-pointer text-[#4A3B32] font-bold" 
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
              <div className="h-full flex flex-col items-center justify-center text-[#8B5A2B] italic text-center opacity-70 py-10">
                <span className="text-4xl mb-2 animate-pulse">🍃</span>
                <p>Memuat jejak para pengembara...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8B5A2B] italic text-center opacity-70 py-10">
                <span className="text-4xl mb-2">🍃</span>
                <p>Belum ada ulasan.<br/>Jadilah daun pertama yang gugur meninggalkan cerita!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  key={r.id} 
                  className="bg-white p-5 rounded-xl rounded-br-[2rem] shadow-sm border-l-4 border-[#3B5E3C]"
                >
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-[#4A3B32] text-lg" style={{ fontFamily: 'Playfair Display' }}>
                      {r.name || "Pengembara Anonim"}
                    </strong>
                    <span className="text-yellow-600 tracking-widest text-sm">
                      {'★'.repeat(r.rating)}
                    </span>
                  </div>
                  <p className="mt-1 text-[#4A3B32] leading-relaxed">{r.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

    </motion.div>
  );
}