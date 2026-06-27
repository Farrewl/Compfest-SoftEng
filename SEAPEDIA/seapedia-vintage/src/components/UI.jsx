import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { ADMIN: 'Admin', SELLER: 'Seller', BUYER: 'Buyer', DRIVER: 'Driver' };

// 1. REUSABLE NAVBAR (Memenuhi syarat Navigasi Guest vs Logged-In & Responsif)
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, user, activeRole, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="bg-[#4A3B32] text-[#F4ECD8] shadow-lg sticky top-0 z-50 rounded-b-3xl border-b-4 border-[#8B5A2B]"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider text-[#D4A373] hover:scale-105 transition-transform" style={{ fontFamily: 'Playfair Display' }}>
          🌿 SEAPEDIA
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex gap-4 items-center">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-4">
              {/* TAMPILAN PROFIL PENGGUNA YANG SUDAH LOGIN */}
              <Link to="/dashboard" className="flex items-center gap-3 bg-[#F4ECD8]/10 px-4 py-1.5 rounded-full border border-[#8B5A2B]/50 hover:bg-[#F4ECD8]/20 transition-colors">
                <span className="text-xl">👤</span>
                <span className="font-bold text-[#F4ECD8]">{user.username}</span>
                <span className="text-xs bg-[#8B5A2B] text-[#F4ECD8] px-2 py-0.5 rounded-full font-bold">{ROLE_LABELS[activeRole] || activeRole}</span>
              </Link>
              
              <button onClick={handleLogout} className="px-4 py-1.5 border border-red-400 text-red-400 font-bold rounded-tl-xl rounded-br-xl hover:bg-red-400 hover:text-white transition-colors">
                Keluar
              </button>
            </div>
          ) : (
            /* TAMPILAN TAMU */
            <Link to="/login" className="px-5 py-2 bg-[#8B5A2B] font-bold text-[#F4ECD8] rounded-tl-xl rounded-br-xl hover:bg-[#D4A373] hover:text-[#4A3B32] transition-colors shadow-md">
              Masuk / Daftar
            </Link>
          )}
        </div>

        {/* Tombol Hamburger (Mobile) */}
        <button className="md:hidden text-[#F4ECD8] text-2xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#4A3B32] border-t border-[#8B5A2B] overflow-hidden rounded-b-3xl"
          >
            <div className="flex flex-col p-4 gap-4 text-center">
              {isLoggedIn && user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-[#D4A373] font-bold">Profil: {user.username} ({ROLE_LABELS[activeRole] || activeRole})</Link>
                  <button onClick={handleLogout} className="text-red-400 font-bold">Keluar</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-[#D4A373] font-bold">Masuk / Daftar</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// 2. REUSABLE BUTTON
export const RootButton = ({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) => {
  const baseStyle = "px-6 py-2 rounded-tl-2xl rounded-br-2xl font-bold transition-colors duration-300 shadow-md flex justify-center items-center w-full md:w-auto";
  const variants = {
    primary: "bg-[#8B5A2B] text-[#F4ECD8] hover:bg-[#4A3B32]",
    secondary: "bg-transparent border-2 border-[#8B5A2B] text-[#4A3B32] hover:bg-[#8B5A2B] hover:text-[#F4ECD8]"
  };
  
  return (
    <motion.button 
      whileHover={disabled ? {} : { scale: 1.03 }} whileTap={disabled ? {} : { scale: 0.95 }} 
      type={type} onClick={onClick} disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ fontFamily: 'Playfair Display' }}
    >
      {children}
    </motion.button>
  );
};

// 3. REUSABLE INPUT
export const OrganicInput = ({ label, type = "text", placeholder, value, onChange, required = false }) => (
  <div className="flex flex-col mb-4">
    <label className="text-[#4A3B32] mb-1 font-bold" style={{ fontFamily: 'Playfair Display' }}>
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <input 
      type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
      className="bg-[#F4ECD8] border-b-2 border-[#8B5A2B] focus:border-[#4A3B32] outline-none px-3 py-2 text-[#4A3B32] transition-colors rounded-tr-lg w-full"
    />
  </div>
);

// 4. REUSABLE CARD
export const OrganicCard = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(139, 90, 43, 0.3)" }}
    className={`bg-white/80 backdrop-blur-sm border-2 border-[#8B5A2B]/30 p-6 rounded-tl-[2rem] rounded-br-[2rem] shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

// 5. REUSABLE FOOTER
export const Footer = () => (
  <footer className="bg-[#4A3B32] text-[#F4ECD8] py-8 text-center rounded-t-[3rem] mt-auto border-t-4 border-[#8B5A2B] z-10 relative">
    <p style={{ fontFamily: 'Playfair Display' }} className="opacity-80 tracking-widest text-sm">
      © 2026 SEAPEDIA. Berakar Kuat, Tumbuh Bersama.
    </p>
  </footer>
);