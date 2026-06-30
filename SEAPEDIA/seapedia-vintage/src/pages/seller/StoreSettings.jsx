import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OrganicCard, OrganicInput, RootButton } from '../../components/UI';
import { getMyStore, upsertMyStore } from '../../api/stores';

const extractErrorMessage = (err) =>
  err?.response?.data?.errors?.[0]?.message ||
  err?.response?.data?.message ||
  'Terjadi kesalahan, coba lagi.';

export default function StoreSettings() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyStore();
        if (res.data.data) {
          setStore(res.data.data);
          setFormData({ name: res.data.data.name, description: res.data.data.description || '' });
        }
      } catch {
        // Belum punya toko - form dibiarkan kosong, anggap "buka toko baru"
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await upsertMyStore(formData);
      const wasNew = !store;
      setStore(res.data.data);
      setSuccessMessage(wasNew ? 'Toko berhasil dibuat! Sekarang Anda bisa menambah produk.' : 'Profil toko berhasil diperbarui!');
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-[#84934A] italic animate-pulse">Memuat profil toko...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto p-4 mt-8 mb-20 max-w-2xl">
      <RootButton variant="secondary" onClick={() => navigate('/dashboard')} className="mb-8 text-sm">
        ← Kembali ke Dashboard
      </RootButton>

      <OrganicCard className="bg-white/95">
        <div className="mb-6 text-center">
          <span className="text-5xl block mb-2">🏪</span>
          <h2 className="text-2xl font-bold text-[#492828]" style={{ fontFamily: 'Playfair Display' }}>
            {store ? 'Profil Toko Anda' : 'Buka Toko Baru'}
          </h2>
          {store && (
            <p className="text-xs text-[#84934A] mt-2">
              {store._count?.products ?? 0} produk terdaftar &bull; dibuat {new Date(store.createdAt).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>

        {errorMessage && <p className="text-red-600 text-sm font-bold text-center mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-[#656D3F] text-sm font-bold text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <OrganicInput
            label="Nama Toko"
            placeholder="mis. Toko Hutan Akar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="text-[#492828] mb-1 block font-bold" style={{ fontFamily: 'Playfair Display' }}>
              Deskripsi Toko
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ceritakan toko Anda secara singkat..."
              rows={4}
              className="bg-[#ECECEC] border-b-2 border-[#84934A] focus:border-[#492828] outline-none px-3 py-2 text-[#492828] transition-colors rounded-tr-lg w-full resize-none"
            />
          </div>

          <RootButton type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : store ? 'Simpan Perubahan' : 'Buka Toko'}
          </RootButton>
        </form>

        {store && (
          <div className="mt-6 pt-6 border-t-2 border-[#84934A]/20 text-center">
            <RootButton variant="secondary" className="w-full text-sm" onClick={() => navigate('/seller/products')}>
              🌾 Kelola Produk Saya
            </RootButton>
          </div>
        )}
      </OrganicCard>
    </motion.div>
  );
}
