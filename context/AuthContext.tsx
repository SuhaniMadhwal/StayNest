'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { api, getAuthToken, setAuthToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'guest' | 'host' | 'admin') => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  favorites: number[];
  toggleFavorite: (propertyId: number) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [favorites, setFavorites] = useState<number[]>([]);

  const fetchFavorites = async () => {
    try {
      const favList = await api.getMyFavorites();
      setFavorites(favList.map((f: any) => f.property_id));
    } catch {
      // ignore if not logged in
    }
  };

  const refreshUser = async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setFavorites([]);
      setIsLoading(false);
      return;
    }
    try {
      setToken(existingToken);
      const userData = await api.getMe();
      setUser(userData);
      await fetchFavorites();
    } catch (err) {
      setAuthToken(null);
      setUser(null);
      setToken(null);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAuthToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    closeAuthModal();
    await fetchFavorites();
  };

  const demoLogin = async (role: 'guest' | 'host' | 'admin') => {
    const res = await api.demoLogin(role);
    setAuthToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    closeAuthModal();
    await fetchFavorites();
  };

  const register = async (name: string, email: string, password: string, role = 'guest') => {
    const res = await api.register({ name, email, password, role });
    setAuthToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    closeAuthModal();
    await fetchFavorites();
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setFavorites([]);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const toggleFavorite = async (propertyId: number): Promise<boolean> => {
    if (!user) {
      openAuthModal('login');
      return false;
    }
    try {
      const res = await api.toggleFavorite(propertyId);
      if (res.favorited) {
        setFavorites((prev) => [...prev, propertyId]);
        return true;
      } else {
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
        return false;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        demoLogin,
        register,
        logout,
        favorites,
        toggleFavorite,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
