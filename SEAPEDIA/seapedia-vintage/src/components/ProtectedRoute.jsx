import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrganicCard } from './UI';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, activeRole, isCheckingSession } = useAuth();
  const location = useLocation();

  // Tunggu pengecekan sesi awal selesai dulu, supaya user yang sebenarnya
  // sudah login tidak sempat "kelihatan" ter-redirect ke /login saat reload.
  if (isCheckingSession) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#8B5A2B] italic animate-pulse">Memeriksa sesi...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <OrganicCard className="max-w-md text-center border-red-500/40 bg-white/95">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-red-700 mb-2" style={{ fontFamily: 'Playfair Display' }}>
            Akses Ditolak
          </h2>
          <p className="text-[#4A3B32] mb-2 text-sm">
            Halaman ini hanya untuk role: {allowedRoles.join(', ')}.
          </p>
          <p className="text-[#8B5A2B] text-xs font-bold">Role aktif Anda saat ini: {activeRole}</p>
        </OrganicCard>
      </div>
    );
  }

  return children;
}
