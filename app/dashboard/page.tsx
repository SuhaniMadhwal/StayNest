'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Booking, Property } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon,
  Calendar,
  Heart,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Home
} from 'lucide-react';

export default function DashboardPage() {
  const { user, openAuthModal, logout, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'trips' | 'favorites' | 'profile'>('trips');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [bookingsData, favsData] = await Promise.all([
        api.getMyBookings(),
        api.getMyFavorites(),
      ]);
      setBookings(bookingsData);
      setFavorites(favsData.map((f: any) => f.property).filter(Boolean));
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.cancelBooking(bookingId);
      setActionMessage('Booking cancelled successfully.');
      setTimeout(() => setActionMessage(null), 4000);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 flex-1 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center flex-1">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">
            Access your trips, saved favorite stays, and manage your account profile.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="py-3 px-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            Log in to StayNest
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter((b) => b.check_out >= todayStr && b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.check_out < todayStr || b.status === 'cancelled');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* User Greeting & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-200 shadow-sm flex-shrink-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-600 border border-rose-100">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'host' && (
              <Link
                href="/host"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
              >
                <Home className="w-4 h-4" /> Host Portal
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
              >
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Action alert message */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex border-b border-gray-200 gap-8 mb-8">
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'trips'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Trips & Bookings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'favorites'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlists</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* Tab 1: Trips / Bookings */}
        {activeTab === 'trips' && (
          <div className="space-y-10">
            {/* Upcoming Reservations */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" /> Upcoming Reservations
              </h2>

              {upcomingBookings.length === 0 ? (
                <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-4">No upcoming stays booked yet.</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition"
                  >
                    Start searching stays <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-6 rounded-3xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 mb-1">
                            Confirmed #{b.id}
                          </span>
                          <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                            {b.property?.title || 'StayNest Property'}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {b.property?.location || b.property?.city}
                          </p>
                        </div>

                        {b.property?.images && b.property.images.length > 0 && (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <img
                              src={b.property.images[0]}
                              alt="Property"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-gray-400 font-medium">Dates</p>
                          <p className="font-bold text-gray-800">{b.check_in} → {b.check_out}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Nights & Guests</p>
                          <p className="font-bold text-gray-800">{b.nights} nights • {b.guests} guests</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Total Price</p>
                          <p className="font-bold text-emerald-600">₹{b.total_price.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Booked on</p>
                          <p className="font-medium text-gray-700">{b.created_at?.slice(0, 10) || 'Recent'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {b.property?.id && (
                          <Link
                            href={`/properties/${b.property.id}`}
                            className="text-xs font-semibold text-rose-600 hover:underline"
                          >
                            View Property details →
                          </Link>
                        )}
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past or Cancelled Reservations */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Past & Cancelled Stays</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{b.property?.title || 'Past Stay'}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {b.check_in} to {b.check_out} • ₹{b.total_price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {b.property?.id && (
                        <Link
                          href={`/properties/${b.property.id}`}
                          className="text-xs font-bold text-gray-700 hover:text-black underline"
                        >
                          Book Again
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Favorites */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Your Saved Stays</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 text-base">No favorites saved yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                  Click the heart icon on any listing to save your favorite stays and plan your dream vacation.
                </p>
                <Link
                  href="/"
                  className="py-2.5 px-6 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-semibold transition"
                >
                  Explore Stays
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Account Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</p>
                <p className="font-semibold text-gray-900 mt-1">{user.name}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</p>
                <p className="font-semibold text-gray-900 mt-1">{user.email}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Account Role</p>
                <p className="font-semibold text-gray-900 mt-1 capitalize">{user.role}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Bio / About</p>
                <p className="font-semibold text-gray-900 mt-1">{user.bio || 'StayNest Traveler'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={logout}
                className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Log Out of Account
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
