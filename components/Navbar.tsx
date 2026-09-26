'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Home, Menu, User as UserIcon, Shield, Sparkles, LogOut, Heart, Calendar } from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
  searchSummary?: {
    city?: string;
    dates?: string;
    guests?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchClick, searchSummary }) => {
  const { user, openAuthModal, logout, demoLogin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-rose-500 hover:opacity-90 transition flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Home className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                StayNest
              </span>
            </div>
          </Link>

          {/* Middle Compact Search Bar / Pill */}
          <div 
            onClick={onSearchClick}
            className="flex items-center border border-gray-200 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition cursor-pointer divide-x divide-gray-200 text-sm font-medium text-gray-700 bg-white"
          >
            <div className="px-3 text-gray-900 font-semibold truncate max-w-[120px]">
              {searchSummary?.city || 'Anywhere in India'}
            </div>
            <div className="px-3 text-gray-600 truncate max-w-[110px] hidden md:block">
              {searchSummary?.dates || 'Any week'}
            </div>
            <div className="pl-3 flex items-center gap-2">
              <span className="text-gray-500 hidden sm:inline">
                {searchSummary?.guests || 'Add guests'}
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
                <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Host Link */}
            {user?.role === 'host' ? (
              <Link
                href="/host"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Host Dashboard
              </Link>
            ) : user?.role === 'admin' ? (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (!user) openAuthModal('register');
                  else window.location.href = '/host';
                }}
                className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Switch to hosting
              </button>
            )}

            {/* User Dropdown Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 border border-gray-200 rounded-full hover:shadow-md transition bg-white"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-600 font-semibold text-xs border border-gray-200">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Menu Popup */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-sm animate-in fade-in duration-150">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium transition"
                        >
                          <Calendar className="w-4 h-4 text-gray-400" /> My Trips & Bookings
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium transition"
                        >
                          <Heart className="w-4 h-4 text-gray-400" /> Wishlists / Favorites
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        {(user.role === 'host' || user.role === 'admin') && (
                          <Link
                            href="/host"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium transition"
                          >
                            <Home className="w-4 h-4 text-emerald-600" /> Host Dashboard
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-indigo-700 font-medium transition"
                          >
                            <Shield className="w-4 h-4 text-indigo-600" /> Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium transition text-left"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-semibold text-gray-900 transition"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openAuthModal('register');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition"
                      >
                        Sign up
                      </button>
                      
                      <div className="border-t border-gray-100 my-1" />
                      <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-500" /> Quick Demo Logins
                      </div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          demoLogin('guest');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700 text-xs transition"
                      >
                        • Guest Demo (Aarav)
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          demoLogin('host');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700 text-xs transition"
                      >
                        • Host Demo (Priya)
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          demoLogin('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700 text-xs transition"
                      >
                        • Admin Demo (Ops)
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
