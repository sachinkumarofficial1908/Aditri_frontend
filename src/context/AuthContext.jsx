import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import { ENV } from '../utils/env';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ENV.authUserKey)); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ENV.authTokenKey);
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => { localStorage.removeItem(ENV.authTokenKey); localStorage.removeItem(ENV.authUserKey); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token, user: userData } = res.data;
    localStorage.setItem(ENV.authTokenKey, token);
    localStorage.setItem(ENV.authUserKey, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem(ENV.authTokenKey, token);
    localStorage.setItem(ENV.authUserKey, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const completeOAuthLogin = useCallback(({ token, user: userData }) => {
    localStorage.setItem(ENV.authTokenKey, token);
    localStorage.setItem(ENV.authUserKey, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await authAPI.updateProfile(data);
    const userData = res.data.user;
    localStorage.setItem(ENV.authUserKey, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem(ENV.authTokenKey);
    localStorage.removeItem(ENV.authUserKey);
    setUser(null);
    if (typeof window !== 'undefined') {
      const loginUrl = ENV.loginPath || '/login';
      window.history.replaceState(null, '', loginUrl);
      window.location.replace(loginUrl);
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      completeOAuthLogin,
      updateProfile,
      logout,
      isAdmin,
      isSupervisor,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
