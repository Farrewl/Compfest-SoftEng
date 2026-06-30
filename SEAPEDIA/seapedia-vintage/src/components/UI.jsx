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
      className="bg-[#492828] text-[#ECECEC] sticky top-0 z-50 rounded-b-3xl border-b-4 border-[#84934A] shadow-[0_4px_14px_rgba(73,40,40,0.3),inset_0_-2px_0_0_#C2A14D]"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider text-[#C2A14D] hover:scale-105 transition-transform" style={{ fontFamily: 'Playfair Display' }}>
          🌿 SEAPEDIA
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex gap-4 items-center">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-4">
              {/* TAMPILAN PROFIL PENGGUNA YANG SUDAH LOGIN */}
              <Link to="/dashboard" className="flex items-center gap-3 bg-[#ECECEC]/10 px-4 py-1.5 rounded-full border border-[#84934A]/50 hover:bg-[#ECECEC]/20 transition-colors">
                <span className="text-xl">👤</span>
                <span className="font-bold text-[#ECECEC]">{user.username}</span>
                <span className="text-xs bg-[#84934A] text-[#ECECEC] px-2 py-0.5 rounded-full font-bold">{ROLE_LABELS[activeRole] || activeRole}</span>
              </Link>
              
              <button onClick={handleLogout} className="px-4 py-1.5 border border-red-400 text-red-400 font-bold rounded-tl-xl rounded-br-xl hover:bg-red-400 hover:text-white transition-colors">
                Keluar
              </button>
            </div>
          ) : (
            /* TAMPILAN TAMU */
            <Link to="/login" className="px-5 py-2 bg-[#84934A] font-bold text-[#ECECEC] rounded-tl-xl rounded-br-xl hover:bg-[#C2A14D] hover:text-[#492828] transition-colors shadow-md">
              Masuk / Daftar
            </Link>
          )}
        </div>

        {/* Tombol Hamburger (Mobile) */}
        <button className="md:hidden text-[#ECECEC] text-2xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#492828] border-t border-[#84934A] overflow-hidden rounded-b-3xl"
          >
            <div className="flex flex-col p-4 gap-4 text-center">
              {isLoggedIn && user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-[#C2A14D] font-bold">Profil: {user.username} ({ROLE_LABELS[activeRole] || activeRole})</Link>
                  <button onClick={handleLogout} className="text-red-400 font-bold">Keluar</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-[#C2A14D] font-bold">Masuk / Daftar</Link>
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
    primary: "bg-[#84934A] text-[#ECECEC] hover:bg-[#492828]",
    secondary: "bg-transparent border-2 border-[#84934A] text-[#492828] hover:bg-[#84934A] hover:text-[#ECECEC]"
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
    <label className="text-[#492828] mb-1 font-bold" style={{ fontFamily: 'Playfair Display' }}>
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <input 
      type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
      className="bg-[#ECECEC] border-b-2 border-[#84934A] focus:border-[#492828] outline-none px-3 py-2 text-[#492828] transition-colors rounded-tr-lg w-full"
    />
  </div>
);

// 4. REUSABLE CARD
export const OrganicCard = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(132, 147, 74, 0.35)" }}
    className={`bg-white/80 backdrop-blur-sm border-2 border-[#84934A]/30 p-6 rounded-tl-[2rem] rounded-br-[2rem] shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

// 5. REUSABLE FOOTER
export const Footer = () => (
  <footer className="bg-[#492828] text-[#ECECEC] py-8 text-center rounded-t-[3rem] mt-auto border-t-4 border-[#84934A] shadow-[inset_0_2px_0_0_#C2A14D] z-10 relative">
    <p style={{ fontFamily: 'Playfair Display' }} className="opacity-80 tracking-widest text-sm">
      🍃 © 2026 SEAPEDIA. 🍃
    </p>
  </footer>
);