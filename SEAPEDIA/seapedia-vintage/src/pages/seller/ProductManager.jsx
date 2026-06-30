import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OrganicCard, OrganicInput, RootButton } from '../../components/UI';
import { listMyProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', imageEmoji: '🧭' };
const EMOJI_OPTIONS = ['🧭', '⌚', '📷', '👜', '👗', '📚', '🎩', '🏺', '🍯', '🪴', '💍', '🎻'];

const extractErrorMessage = (err) =>
  err?.response?.data?.errors?.[0]?.message ||
  err?.response?.data?.message ||
  'Terjadi kesalahan, coba lagi.';

export default function ProductManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try {
      const res = await listMyProducts();
      setProducts(res.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageEmoji: product.imageEmoji,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto p-4 mt-8 mb-20 max-w-5xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <RootButton variant="secondary" onClick={() => navigate('/dashboard')} className="text-sm">
          ← Kembali ke Dashboard
        </RootButton>
        <RootButton onClick={openCreateForm} className="text-sm">
          + Tambah Produk
        </RootButton>
      </div>

      {error && <p className="text-red-600 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <OrganicCard className="bg-white/95">
              <h3 className="text-xl font-bold text-[#492828] mb-4" style={{ fontFamily: 'Playfair Display' }}>
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <form onSubmit={handleSubmit}>
                <OrganicInput
                  label="Nama Produk"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <div className="flex flex-col mb-4">
                  <label className="text-[#492828] mb-1 font-bold" style={{ fontFamily: 'Playfair Display' }}>
                    Deskripsi
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    className="bg-[#ECECEC] border-b-2 border-[#84934A] focus:border-[#492828] outline-none px-3 py-2 text-[#492828] rounded-tr-lg w-full resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <OrganicInput
                    label="Harga (Rp)"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                  <OrganicInput
                    label="Stok"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="text-[#492828] mb-2 block font-bold" style={{ fontFamily: 'Playfair Display' }}>
                    Ikon Produk
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, imageEmoji: emoji })}
                        className={`text-2xl w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                          form.imageEmoji === emoji
                            ? 'border-[#84934A] bg-[#84934A]/10 scale-110'
                            : 'border-[#84934A]/20 hover:border-[#84934A]/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <RootButton type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? 'Menyimpan...' : editingId ? 'Update Produk' : 'Tambah Produk'}
                  </RootButton>
                  <RootButton type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Batal
                  </RootButton>
                </div>
              </form>
            </OrganicCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <p className="text-center text-[#84934A] italic py-10">Memuat produk...</p>
      ) : products.length === 0 ? (
        <OrganicCard className="text-center py-12 bg-white/80">
          <span className="text-5xl block mb-3">🪴</span>
          <p className="text-[#492828]">Belum ada produk. Tambahkan produk pertama Anda!</p>
        </OrganicCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <OrganicCard key={product.id} className={`bg-white/90 ${!product.isActive ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-4xl">{product.imageEmoji}</span>
                {!product.isActive && (
                  <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full font-bold">Nonaktif</span>
                )}
              </div>
              <h4 className="font-bold text-[#492828] mb-1" style={{ fontFamily: 'Playfair Display' }}>
                {product.name}
              </h4>
              <p className="text-sm text-[#492828]/70 mb-2 line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold text-[#84934A] mb-1">
                {product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-[#656D3F] font-bold mb-3">Stok: {product.stock}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(product)}
                  className="flex-1 text-xs font-bold py-2 rounded border-2 border-[#84934A]/40 text-[#492828] hover:border-[#84934A] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="flex-1 text-xs font-bold py-2 rounded border-2 border-red-400/50 text-red-600 hover:border-red-500 hover:bg-red-50 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </OrganicCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
