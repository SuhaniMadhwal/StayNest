'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminStats } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Users,
  Home,
  Calendar,
  DollarSign,
  MapPin,
  PieChart,
  Lock,
  ExternalLink,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, openAuthModal, demoLogin, isLoading: isAuthLoading } = useAuth();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'bookings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setIsLoading(true);
    try {
      const [statsData, usersData, propsData, bookingsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProperties(),
        api.getAdminBookings(),
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setPropertiesList(propsData);
      setBookingsList(bookingsData);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 flex-1 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  // Guard: Not an admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center flex-1">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal Restricted</h2>
          <p className="text-sm text-gray-500 mb-6">
            This console is strictly restricted to system administrators with security clearance. Regular guests and hosts cannot access this area.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => demoLogin('admin')}
              className="w-full sm:w-auto py-3 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition text-sm"
            >
              Sign in as Demo Admin (Ops)
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto py-3 px-6 rounded-full border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Log in with credentials
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Header */}
        <div className="pb-8 border-b border-gray-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-100 text-indigo-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Console
              </span>
              <span className="text-xs text-gray-400">• Authenticated as {user.name}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              StayNest Platform Operations
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API: 127.0.0.1:8000 (Active)
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-8 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <PieChart className="w-4 h-4" /> Overview & Metrics
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'properties'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Home className="w-4 h-4" /> Properties ({propertiesList.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" /> Bookings ({bookingsList.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" /> Users ({usersList.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-10">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center justify-between text-indigo-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</span>
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-extrabold text-indigo-950">
                  ₹{stats.total_revenue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-indigo-600/80 mt-1">From confirmed bookings</p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
                  <Home className="w-5 h-5 text-gray-700" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{stats.total_properties}</p>
                <p className="text-xs text-gray-400 mt-1">Across {stats.active_cities} Indian cities</p>
              </div>

              <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100">
                <div className="flex items-center justify-between text-rose-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                  <Calendar className="w-5 h-5 text-rose-500" />
                </div>
                <p className="text-3xl font-extrabold text-rose-700">{stats.total_bookings}</p>
                <p className="text-xs text-rose-500/80 mt-1">Processed across platform</p>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between text-emerald-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Registered Accounts</span>
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-extrabold text-emerald-800">{stats.total_users}</p>
                <p className="text-xs text-emerald-600/80 mt-1">Guests, Hosts, & Admins</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" /> Listings by Category
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats.category_distribution).map(([cat, count]) => (
                  <div key={cat} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
                    <p className="text-xs font-bold text-gray-600 truncate">{cat}</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{count}</p>
                    <p className="text-[10px] text-gray-400">active stays</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Properties */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">All Properties ({propertiesList.length})</h2>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Nightly Price</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Host</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {propertiesList.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">#{p.id}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs truncate">{p.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-600">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{p.city}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{p.price_per_night.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-gray-700">★ {p.rating.toFixed(2)}</td>
                      <td className="py-3 px-4 text-xs text-gray-600">{p.host_name}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/properties/${p.id}`}
                          target="_blank"
                          className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">All Reservations ({bookingsList.length})</h2>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Nights</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {bookingsList.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-gray-700">#{b.id}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{b.property_title}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{b.guest_name}</div>
                        <div className="text-xs text-gray-400">{b.guest_email}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">{b.check_in} → {b.check_out}</td>
                      <td className="py-3 px-4 text-xs text-gray-700">{b.nights}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">₹{b.total_price.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Registered Users ({usersList.length})</h2>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Bookings Made</th>
                    <th className="py-3 px-4">Properties Hosted</th>
                    <th className="py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">#{u.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-700'
                            : u.role === 'host'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-gray-700">{u.bookings_count}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-gray-700">{u.properties_count}</td>
                      <td className="py-3 px-4 text-xs text-gray-400">{u.created_at?.slice(0, 10) || 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
