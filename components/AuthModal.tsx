'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Sparkles, UserCheck, ShieldCheck, Home } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register, demoLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('guest');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please provide your name');
          setLoading(false);
          return;
        }
        await register(name, email, password, role);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: 'guest' | 'host' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(demoRole);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">
            {authModalMode === 'login' ? 'Log in or sign up' : 'Create your account'}
          </h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Welcome Message */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Welcome to StayNest</h3>
            <p className="text-sm text-gray-500 mt-1">
              Discover unique stays and experiences across India.
            </p>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Demo Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('guest')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-sm transition group"
              >
                <UserCheck className="w-4 h-4 text-rose-500 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-gray-800">Guest</span>
                <span className="text-[10px] text-gray-400">demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('host')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-sm transition group"
              >
                <Home className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-gray-800">Host</span>
                <span className="text-[10px] text-gray-400">demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-sm transition group"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-gray-800">Admin</span>
                <span className="text-[10px] text-gray-400">demo</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider absolute">
              or use credentials
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black text-sm transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black text-sm transition"
              />
            </div>

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black text-sm transition bg-white"
                >
                  <option value="guest">Guest (Book unique stays)</option>
                  <option value="host">Host (List your properties)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition transform active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {loading ? 'Please wait...' : authModalMode === 'login' ? 'Continue' : 'Create Account'}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {authModalMode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="font-semibold text-gray-900 underline hover:text-rose-500 transition"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-semibold text-gray-900 underline hover:text-rose-500 transition"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
