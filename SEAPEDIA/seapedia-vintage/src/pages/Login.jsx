import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OrganicCard, OrganicInput, RootButton } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'SELLER', label: 'Seller' },
  { value: 'DRIVER', label: 'Driver' },
];

const extractErrorMessage = (err) =>
  err?.response?.data?.errors?.[0]?.message ||
  err?.response?.data?.message ||
  'Terjadi kesalahan, coba lagi.';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, selectRole } = useAuth();

  // State untuk melacak tahapan form: 'login' | 'register' | 'role_selection'
  const [step, setStep] = useState('login');

  // State input form login/register
  const [formData, setFormData] = useState({ username: '', password: '', email: '', role: 'BUYER' });
  const [selectedRole, setSelectedRole] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setErrorMessage('Username dan kata sandi wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ username: formData.username, password: formData.password });
      if (result.requiresRoleSelection) {
        // Akun ini punya >1 role - tahan dulu, jangan langsung ke dashboard.
        setPendingToken(result.pendingToken);
        setAvailableRoles(result.roles);
        setStep('role_selection');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setErrorMessage('Semua kolom registrasi wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      alert('Registrasi Berhasil! Silakan masuk menggunakan akun baru Anda.');
      setStep('login');
      setFormData({ username: '', password: '', email: '', role: 'BUYER' });
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleFinalize = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setErrorMessage('Harap pilih salah satu peran untuk sesi ini!');
      return;
    }

    setIsSubmitting(true);
    try {
      await selectRole({ pendingToken, role: selectedRole });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="min-h-[75vh] flex items-center justify-center p-6"
    >
      <OrganicCard className="w-full max-w-md bg-white/90 backdrop-blur-md">
        <AnimatePresence mode="wait">
          
          {/* TAHAPAN 1: FORM LOGIN */}
          {step === 'login' && (
            <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleLoginSubmit}>
              <h2 className="text-3xl font-bold text-[#4A3B32] mb-2 text-center" style={{ fontFamily: 'Playfair Display' }}>
                Gerbang Masuk
              </h2>
              <p className="text-sm text-center text-[#8B5A2B] mb-6">Masuk untuk mengelola peran dan transaksi Anda</p>
              
              {errorMessage && <p className="text-red-600 text-sm font-bold text-center mb-4">{errorMessage}</p>}
              
              <OrganicInput label="Username" placeholder="Masukkan username" value={formData.username} onChange={(e) => handleChange(e, 'username')} />
              <OrganicInput label="Kata Sandi" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleChange(e, 'password')} />
              
              <RootButton type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? 'Memeriksa...' : 'Masuk Aplikasi'}
              </RootButton>
              
              <p className="text-sm text-center text-[#4A3B32] mt-6">
                Belum memiliki akun?{' '}
                <button type="button" onClick={() => { setStep('register'); setErrorMessage(''); }} className="font-bold text-[#8B5A2B] underline hover:text-[#4A3B32]">
                  Daftar di Sini
                </button>
              </p>

              <p className="text-xs text-center text-[#8B5A2B]/70 mt-4">
                Coba akun demo: <span className="font-mono">pengembara_akar</span> / <span className="font-mono">Pengembara123!</span>
              </p>
            </motion.form>
          )}

          {/* TAHAPAN 2: FORM REGISTRASI */}
          {step === 'register' && (
            <motion.form key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRegisterSubmit}>
              <h2 className="text-3xl font-bold text-[#4A3B32] mb-2 text-center" style={{ fontFamily: 'Playfair Display' }}>
                Daftar Akun Baru
              </h2>
              <p className="text-sm text-center text-[#8B5A2B] mb-6">Bergabunglah dalam ekosistem SEAPEDIA</p>
              
              {errorMessage && <p className="text-red-600 text-sm font-bold text-center mb-4">{errorMessage}</p>}
              
              <OrganicInput label="Username" placeholder="Buat username unik" value={formData.username} onChange={(e) => handleChange(e, 'username')} />
              <OrganicInput label="Email" type="email" placeholder="contoh@seapedia.com" value={formData.email} onChange={(e) => handleChange(e, 'email')} />
              <OrganicInput label="Kata Sandi" type="password" placeholder="Minimal 6 karakter" value={formData.password} onChange={(e) => handleChange(e, 'password')} />

              <div className="mb-4">
                <label className="text-[#4A3B32] mb-2 block font-bold" style={{ fontFamily: 'Playfair Display' }}>
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: opt.value })}
                      className={`p-3 rounded-tl-lg rounded-br-lg border-2 text-xs font-bold transition-all duration-300 ${
                        formData.role === opt.value
                          ? 'bg-[#8B5A2B] border-[#8B5A2B] text-[#F4ECD8] shadow-md'
                          : 'border-[#8B5A2B]/30 text-[#4A3B32] bg-white/50 hover:border-[#8B5A2B]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#8B5A2B] mt-2">Peran lain bisa ditambahkan nanti dari Dashboard.</p>
              </div>
              
              <RootButton type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Mendaftarkan...' : 'Selesaikan Registrasi'}
              </RootButton>
              
              <p className="text-sm text-center text-[#4A3B32] mt-6">
                Sudah punya akun?{' '}
                <button type="button" onClick={() => { setStep('login'); setErrorMessage(''); }} className="font-bold text-[#8B5A2B] underline hover:text-[#4A3B32]">
                  Masuk Kembali
                </button>
              </p>
            </motion.form>
          )}

          {/* TAHAPAN 3: PEMILIHAN PERAN (Syarat Utama Level 1) */}
          {step === 'role_selection' && (
            <motion.form key="roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRoleFinalize} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#4A3B32]" style={{ fontFamily: 'Playfair Display' }}>
                  Pilih Peran Sesi Ini
                </h2>
                <p className="text-sm text-[#8B5A2B] mt-2 leading-relaxed">
                  Akun Anda terdeteksi memiliki lebih dari satu peran non-admin. Harap pilih salah satu peran untuk mengaktifkan halaman rute privat.
                </p>
              </div>
              
              {errorMessage && <p className="text-red-600 text-sm font-bold text-center mb-2">{errorMessage}</p>}
              
              <div className="grid grid-cols-1 gap-3">
                {availableRoles.map(role => (
                  <button
                    key={role} 
                    type="button" 
                    onClick={() => { setSelectedRole(role); setErrorMessage(""); }}
                    className={`p-4 rounded-tl-[1.5rem] rounded-br-[1.5rem] font-bold border-2 transition-all duration-300 text-left pl-6 ${
                      selectedRole === role 
                      ? 'bg-[#8B5A2B] border-[#8B5A2B] text-[#F4ECD8] shadow-md scale-[1.02]' 
                      : 'border-[#8B5A2B]/30 text-[#4A3B32] hover:border-[#8B5A2B] bg-white/50'
                    }`}
                    style={{ fontFamily: 'Playfair Display' }}
                  >
                    Masuk Sebagai Peran: <span className="underline decoration-wavy underline-offset-4">{role}</span>
                  </button>
                ))}
              </div>

              <RootButton type="submit" className="w-full mt-6" variant={selectedRole ? 'primary' : 'secondary'} disabled={isSubmitting}>
                {isSubmitting ? 'Mengaktifkan...' : selectedRole ? `Aktifkan Peran ${selectedRole}` : 'Pilih Peran Terlebih Dahulu'}
              </RootButton>
            </motion.form>
          )}

        </AnimatePresence>
      </OrganicCard>
    </motion.div>
  );
}