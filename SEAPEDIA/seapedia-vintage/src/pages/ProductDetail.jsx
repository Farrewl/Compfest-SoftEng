import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootButton, OrganicCard } from '../components/UI';

// Data dummy yang sama dengan di Home, ditambah deskripsi cerita produk
const DUMMY_PRODUCTS = [
  { id: 1, name: "Bibit Jati Emas Kuno", price: "Rp 50.000", store: "Toko Hutan", description: "Bibit pohon jati kualitas terbaik yang telah disemai dengan metode tradisional kuno. Memastikan pertumbuhan akar yang kuat dan kayu yang kokoh untuk menopang kehidupan berabad-abad." },
  { id: 2, name: "Pupuk Organik Akar", price: "Rp 35.000", store: "Tani Makmur", description: "Campuran daun kering, humus, dan rempah alam rahasia yang diracik khusus untuk mempercepat pertumbuhan akar tanaman hias maupun pohon keras secara alami." },
  { id: 3, name: "Pot Tanah Liat Vintage", price: "Rp 75.000", store: "Kriya Alam", description: "Pot tanah liat buatan tangan dengan ukiran motif akar pohon. Membantu menjaga kelembapan tanah dengan sirkulasi udara yang natural, peninggalan pengrajin masa lampau." },
  { id: 4, name: "Kompas Kuningan Tua", price: "Rp 150.000", store: "Antik Navigator", description: "Alat navigasi kuningan asli peninggalan pelaut abad ke-19. Masih berfungsi dengan baik, memandu jalan kembali ke akar bagi pengembara yang tersesat." },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mencari produk berdasarkan ID dari URL
  const product = DUMMY_PRODUCTS.find(p => p.id === parseInt(id));

  // Jika tamu iseng mengetik ID yang tidak ada di URL
  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#8B5A2B]">
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>Jejak Tidak Ditemukan</h2>
        <RootButton onClick={() => navigate('/')}>Back</RootButton>
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
        ← Kembali ke Katalog
      </RootButton>

      <OrganicCard className="flex flex-col md:flex-row gap-10 items-center md:items-stretch p-8">
        {/* Gambar Ilustrasi Vintage */}
        <div className="w-full md:w-1/2 h-72 md:h-auto bg-[#8B5A2B]/10 rounded-2xl flex items-center justify-center border-2 border-[#8B5A2B]/30 shadow-inner">
          <motion.span 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-9xl drop-shadow-lg"
          >
            🪴
          </motion.span>
        </div>

        {/* Detail Informasi (Read-Only Requirement) */}
        <div className="w-full md:w-1/2 flex flex-col h-full">
          <h1 className="text-3xl md:text-4xl text-[#4A3B32] font-bold mb-2" style={{ fontFamily: 'Playfair Display' }}>
            {product.name}
          </h1>
          <p className="text-lg text-[#3B5E3C] font-semibold mb-6 border-b-2 border-[#8B5A2B]/20 pb-4">
            Disediakan oleh: {product.store}
          </p>
          
          <div className="mb-8 flex-grow">
            <h3 className="text-[#8B5A2B] font-bold mb-2 text-xl" style={{ fontFamily: 'Playfair Display' }}>Kisah Produk</h3>
            <p className="text-[#4A3B32] leading-relaxed text-justify opacity-90">
              {product.description}
            </p>
          </div>

          {/* Harga & Informasi Transaksi */}
          <div className="mt-auto bg-[#F4ECD8] p-6 rounded-tl-[2rem] rounded-br-[2rem] border-l-4 border-[#8B5A2B] shadow-md">
            <p className="text-sm text-[#4A3B32] mb-1 font-bold">Harga Penukaran</p>
            <p className="text-3xl text-[#8B5A2B] font-bold mb-6">{product.price}</p>
            
            {/* Peringatan Read-Only (Tamu tidak bisa beli) */}
            <div className="text-center p-4 bg-white/70 border-2 border-[#8B5A2B]/30 rounded-xl border-dashed">
              <p className="text-sm text-[#4A3B32]">
                Buku catatan transaksi terkunci.<br/>Harap <button onClick={() => navigate('/login')} className="font-bold text-[#8B5A2B] underline hover:text-[#4A3B32]">Masuk atau Daftar</button> terlebih dahulu untuk melakukan pemesanan.
              </p>
            </div>
          </div>
        </div>
      </OrganicCard>
    </motion.div>
  );
}