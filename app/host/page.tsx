'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Property, HostStats } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Plus,
  DollarSign,
  Calendar,
  Star,
  Layers,
  MapPin,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';

export default function HostDashboardPage() {
  const { user, openAuthModal, demoLogin, isLoading: isAuthLoading } = useAuth();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<HostStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal for creating / editing a listing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Property form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Luxury Villas');
  const [city, setCity] = useState('Goa');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('18000');
  const [maxGuests, setMaxGuests] = useState('6');
  const [bedrooms, setBedrooms] = useState('3');
  const [beds, setBeds] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [amenitiesInput, setAmenitiesInput] = useState('Private Pool, High-speed WiFi, Air Conditioning, Chef on Request, Free Parking');
  const [imagesInput, setImagesInput] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80');

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [propsData, bookingsData, statsData] = await Promise.all([
        api.getHostProperties(),
        api.getHostBookings(),
        api.getHostStats(),
      ]);
      setProperties(propsData);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load host portal data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'host' || user.role === 'admin')) {
      fetchData();
    }
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingPropertyId(null);
    setTitle('');
    setCategory('Luxury Villas');
    setCity('Goa');
    setLocation('Anjuna, North Goa');
    setDescription('Stunning private pool villa with bespoke tropical garden and contemporary Indian architecture.');
    setPrice('22000');
    setMaxGuests('6');
    setBedrooms('3');
    setBeds('3');
    setBathrooms('3');
    setAmenitiesInput('Private Pool, High-speed WiFi, Air Conditioning, Chef on Request, Free Parking, Power Backup');
    setImagesInput('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setTitle(prop.title);
    setCategory(prop.category);
    setCity(prop.city);
    setLocation(prop.location);
    setDescription(prop.description);
    setPrice(prop.price_per_night.toString());
    setMaxGuests(prop.guests.toString());
    setBedrooms(prop.bedrooms.toString());
    setBeds(prop.beds.toString());
    setBathrooms(prop.bathrooms.toString());
    setAmenitiesInput(prop.amenities.join(', '));
    setImagesInput(prop.images.join('\n'));
    setIsModalOpen(true);
  };

  const handleDeleteProperty = async (propId: number) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.deleteProperty(propId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
    }
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amenitiesList = amenitiesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const imagesList = imagesInput
        .split(/[\n,]/)
        .map((img) => img.trim())
        .filter(Boolean);

      const payload = {
        title,
        category,
        city,
        location,
        description,
        price_per_night: parseFloat(price),
        guests: parseInt(maxGuests, 10),
        bedrooms: parseInt(bedrooms, 10),
        beds: parseInt(beds, 10),
        bathrooms: parseInt(bathrooms, 10),
        amenities: amenitiesList,
        images: imagesList.length > 0 ? imagesList : [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
      };

      if (editingPropertyId) {
        await api.updateProperty(editingPropertyId, payload);
      } else {
        await api.createProperty(payload);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 flex-1 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  // Not a host view
  if (!user || (user.role !== 'host' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center flex-1">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Host Dashboard Access</h2>
          <p className="text-sm text-gray-500 mb-6">
            Log in as a verified Host to manage your property listings, view incoming reservations, and monitor revenue analytics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => demoLogin('host')}
              className="w-full sm:w-auto py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition text-sm"
            >
              Sign in as Demo Host (Priya)
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700">
                Host Portal
              </span>
              <span className="text-xs text-gray-400">• Welcome back, {user.name}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Host Management
            </h1>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold shadow-md hover:shadow-lg transition transform active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add New Property</span>
          </button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
                <Layers className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{stats.total_listings}</p>
              <p className="text-xs text-gray-400 mt-1">Active on StayNest</p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-700">
                ₹{stats.total_earnings.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-emerald-600/80 mt-1">Earned to date</p>
            </div>

            <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Bookings</span>
                <Calendar className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-3xl font-extrabold text-rose-700">{stats.total_bookings}</p>
              <p className="text-xs text-rose-500/80 mt-1">Confirmed guest stays</p>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Rating</span>
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-amber-700">{stats.average_rating.toFixed(2)}</p>
              <p className="text-xs text-amber-600/80 mt-1">From guest reviews</p>
            </div>
          </div>
        )}

        {/* Listings Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Properties ({properties.length})</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-sm text-gray-500">Loading your listings...</div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-gray-50 border border-dashed border-gray-300">
              <Home className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">You haven&apos;t added any properties yet.</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Add your first villa or cabin to start receiving bookings.</p>
              <button
                onClick={handleOpenAddModal}
                className="py-2.5 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition"
              >
                + Add Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/95 text-gray-900 shadow-sm backdrop-blur-sm">
                      {p.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-1">{p.title}</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                          <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                          <span>{p.rating.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {p.location || p.city}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {p.guests} guests • {p.bedrooms} bed • {p.bathrooms} bath
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-3">
                        ₹{p.price_per_night.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-500">/ night</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs font-semibold">
                      <Link
                        href={`/properties/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(p.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings Received */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings Received ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-gray-50 border border-gray-200 text-sm text-gray-500">
              No bookings received on your properties yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">Booking ID</th>
                    <th className="py-3.5 px-4">Property</th>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4">Guests</th>
                    <th className="py-3.5 px-4">Revenue</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-gray-700">#{b.id}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{b.property_title}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{b.guest_name}</div>
                        <div className="text-xs text-gray-400">{b.guest_email}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-700">
                        {b.check_in} to {b.check_out} ({b.nights}n)
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">{b.guests}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        ₹{b.total_price.toLocaleString('en-IN')}
                      </td>
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
          )}
        </div>

      </main>

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPropertyId ? 'Edit Property Listing' : 'Create New Property Listing'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProperty} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Villa Solarium - Private Pool Estate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-sm bg-white"
                  >
                    <option value="Luxury Villas">Luxury Villas</option>
                    <option value="Mountain Cabins">Mountain Cabins</option>
                    <option value="Beachfront">Beachfront</option>
                    <option value="Heritage Havens">Heritage Havens</option>
                    <option value="City Penthouses">City Penthouses</option>
                    <option value="Nature Cottages">Nature Cottages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City / Destination
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-sm bg-white"
                  >
                    <option value="Goa">Goa</option>
                    <option value="Manali">Manali</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Udaipur">Udaipur</option>
                    <option value="Dehradun">Dehradun</option>
                    <option value="Rishikesh">Rishikesh</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Specific Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Candolim, North Goa"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the atmosphere, architecture, highlights and special amenities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Baths
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Private Pool, High-speed WiFi, Air Conditioning, Chef on Request"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Image URLs (one per line or comma-separated)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="https://images.unsplash.com/..."
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-md transition"
                >
                  {isSubmitting ? 'Saving...' : editingPropertyId ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
