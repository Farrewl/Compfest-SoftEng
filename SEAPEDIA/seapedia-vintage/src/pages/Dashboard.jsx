import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OrganicCard, RootButton } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { ADMIN: 'Admin', SELLER: 'Seller', BUYER: 'Buyer', DRIVER: 'Driver' };
const ALL_NON_ADMIN_ROLES = ['BUYER', 'SELLER', 'DRIVER'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn, activeRole, addRole, switchRole } = useAuth();
  const [newRole, setNewRole] = useState('');
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <OrganicCard className="max-w-md text-center border-red-500/40 bg-white/95">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-red-700 mb-2" style={{ fontFamily: 'Playfair Display' }}>Akses Ditolak</h2>
          <p className="text-[#492828] mb-6 text-sm">Anda harus masuk terlebih dahulu.</p>
          <RootButton onClick={() => navigate('/login')} className="w-full">Ke Gerbang Masuk</RootButton>
        </OrganicCard>
      </div>
    );
  }

  // Role apa yang belum dimiliki user (untuk form tambah peran)
  const unownedRoles = ALL_NON_ADMIN_ROLES.filter(role => !user.roles.includes(role));

  const handleAddNewRole = async (e) => {
    e.preventDefault();
    if (!newRole) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await addRole(newRole);
      setNewRole('');
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Gagal menambah peran, coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchRole = async (role) => {
    if (role === activeRole) {
      setShowRoleSwitcher(false);
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await switchRole(role);
      setShowRoleSwitcher(false);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Gagal beralih peran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSpecificContent = () => {
    switch (activeRole) {
      case 'SELLER': return (
        <div>
          <h3 className="text-xl font-bold text-[#656D3F]" style={{ fontFamily: 'Playfair Display' }}>🌾 Gudang & Manajemen Produk</h3>
          <p className="text-sm mt-2 mb-4 text-[#492828]">Kelola profil toko dan daftar produk Anda di sini.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <RootButton onClick={() => navigate('/seller/store')} className="text-sm">🏪 Profil Toko</RootButton>
            <RootButton variant="secondary" onClick={() => navigate('/seller/products')} className="text-sm">🪴 Kelola Produk</RootButton>
          </div>
        </div>
      );
      case 'BUYER': return (<div><h3 className="text-xl font-bold text-[#84934A]" style={{ fontFamily: 'Playfair Display' }}>🛒 Keranjang Pengembara</h3><p className="text-sm mt-2 text-[#492828]">Area checkout dan daftar belanja akan hadir di Level 3.</p></div>);
      case 'DRIVER': return (<div><h3 className="text-xl font-bold text-[#492828]" style={{ fontFamily: 'Playfair Display' }}>🐎 Papan Tugas Pengiriman</h3><p className="text-sm mt-2 text-[#492828]">Area navigasi logistik kurir akan hadir di Level 5.</p></div>);
      default: return <p>Peran tidak valid.</p>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto p-4 mt-8 mb-20 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: SETTING PROFIL & TAMBAH PERAN */}
        <div className="md:col-span-1 space-y-6">
          <OrganicCard className="bg-white/95 border-l-4 border-[#84934A]">
            <div className="text-center pb-6 border-b-2 border-[#84934A]/20">
              <div className="w-20 h-20 bg-[#84934A]/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-[#84934A]/30 text-4xl">🧝🏽‍♂️</div>
              <h2 className="text-xl font-bold text-[#492828]" style={{ fontFamily: 'Playfair Display' }}>{user.username}</h2>
              <p className="text-xs text-[#84934A] font-mono">{user.email}</p>
            </div>

            <div className="py-4 border-b-2 border-[#84934A]/20">
              <p className="text-xs font-bold text-[#84934A] uppercase tracking-wider mb-2">Semua Peran Anda:</p>
              <div className="flex flex-wrap gap-2">
                {user.roles.map(r => (
                  <span key={r} className={`px-3 py-1 text-xs font-bold rounded-full border ${activeRole === r ? 'bg-[#84934A] text-[#ECECEC] border-[#84934A]' : 'bg-transparent text-[#492828] border-[#84934A]/30'}`}>
                    {ROLE_LABELS[r] || r} {activeRole === r && '• Aktif'}
                  </span>
                ))}
              </div>
            </div>

            {/* FORM TAMBAH PERAN JIKA MASIH ADA ROLE YANG BELUM DIMILIKI */}
            {unownedRoles.length > 0 && (
              <form onSubmit={handleAddNewRole} className="py-4 border-b-2 border-[#84934A]/20">
                <p className="text-xs font-bold text-[#656D3F] uppercase tracking-wider mb-2">Tambahkan Peran Baru:</p>
                {errorMessage && <p className="text-red-600 text-xs font-bold mb-2">{errorMessage}</p>}
                <div className="flex gap-2">
                  <select 
                    className="flex-grow bg-[#ECECEC] border border-[#84934A]/50 text-xs p-2 outline-none text-[#492828] font-bold rounded"
                    value={newRole} onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="" disabled>-- Pilih Peran --</option>
                    {unownedRoles.map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                  </select>
                  <button type="submit" disabled={isSubmitting} className="bg-[#656D3F] text-white px-3 py-1 text-xs font-bold rounded hover:bg-[#2A432A] transition-colors disabled:opacity-50">
                    {isSubmitting ? '...' : 'Tambah'}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4">
              <p className="text-xs font-bold text-[#84934A] uppercase tracking-wider mb-1">Pundi Saldo Keuangan:</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                <span className="text-xl font-bold text-[#84934A] font-mono">
                  {user.walletBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </OrganicCard>

          {/* TUKAR PERAN AKTIF - langsung lewat API, tanpa logout-login ulang */}
          {user.roles.length > 1 && (
            !showRoleSwitcher ? (
              <RootButton variant="secondary" className="w-full text-xs" onClick={() => setShowRoleSwitcher(true)}>
                🔄 Tukar Peran Aktif
              </RootButton>
            ) : (
              <OrganicCard className="bg-white/95 p-4">
                <p className="text-xs font-bold text-[#84934A] mb-3 uppercase tracking-wider">Pilih peran aktif:</p>
                {errorMessage && <p className="text-red-600 text-xs font-bold mb-2">{errorMessage}</p>}
                <div className="flex flex-col gap-2">
                  {user.roles.map(r => (
                    <button
                      key={r}
                      onClick={() => handleSwitchRole(r)}
                      disabled={isSubmitting}
                      className={`text-xs font-bold p-2 rounded border-2 transition-colors disabled:opacity-50 ${
                        r === activeRole ? 'bg-[#84934A] text-[#ECECEC] border-[#84934A]' : 'border-[#84934A]/30 text-[#492828] hover:border-[#84934A]'
                      }`}
                    >
                      {ROLE_LABELS[r] || r} {r === activeRole && '(sedang aktif)'}
                    </button>
                  ))}
                  <button onClick={() => setShowRoleSwitcher(false)} className="text-xs text-[#84934A] underline mt-1">Batal</button>
                </div>
              </OrganicCard>
            )
          )}
        </div>

        {/* KOLOM KANAN: KONTEN DASHBOARD */}
        <div className="md:col-span-2">
          <OrganicCard className="bg-white/90 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b-2 border-[#84934A]/20 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-[#492828]" style={{ fontFamily: 'Playfair Display' }}>Ruang Kerja Privat</h2>
                <span className="px-4 py-1 text-xs font-extrabold uppercase bg-[#492828] text-[#ECECEC] rounded-tl-xl rounded-br-xl shadow-sm">
                  Aktif: {ROLE_LABELS[activeRole] || activeRole}
                </span>
              </div>
              {renderRoleSpecificContent()}
            </div>
          </OrganicCard>
        </div>

      </div>
    </motion.div>
  );
}