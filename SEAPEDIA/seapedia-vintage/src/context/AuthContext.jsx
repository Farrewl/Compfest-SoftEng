import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user = { id, username, email, roles: [], activeRole, walletBalance } | null
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Saat aplikasi pertama dibuka, cek apakah cookie sesi dari kunjungan
  // sebelumnya masih berlaku - supaya user tidak perlu login ulang tiap refresh.
  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.getMe();
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    })();
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data);
      return res.data.data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    return res.data;
  }, []);

  const login = useCallback(async (payload) => {
    const res = await authApi.login(payload);
    if (!res.data.requiresRoleSelection) {
      setUser(res.data.data);
    }
    return res.data;
  }, []);

  const selectRole = useCallback(async (payload) => {
    const res = await authApi.selectRole(payload);
    setUser(res.data.data);
    return res.data;
  }, []);

  const switchRole = useCallback(async (role) => {
    const res = await authApi.switchRole(role);
    setUser(res.data.data);
    return res.data;
  }, []);

  const addRole = useCallback(async (role) => {
    const res = await authApi.addRole(role);
    setUser(res.data.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoggedIn: Boolean(user),
    activeRole: user?.activeRole ?? null,
    roles: user?.roles ?? [],
    isCheckingSession,
    register,
    login,
    selectRole,
    switchRole,
    addRole,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return ctx;
}
