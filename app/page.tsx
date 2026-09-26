'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchBar, POPULAR_DESTINATIONS } from '@/components/SearchBar';
import { CategoryBar } from '@/components/CategoryBar';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { Property } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, MapPin, RefreshCw, AlertCircle, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const { user, demoLogin } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stays');
  const [searchParams, setSearchParams] = useState<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});

  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  // Fetch properties from backend
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First get all properties to compute category counts
      const allProps = await api.getProperties();
      setAllProperties(allProps);

      // Now query with active filters
      const filtered = await api.getProperties({
        category: selectedCategory === 'All Stays' ? undefined : selectedCategory,
        city: searchParams.city,
        guests: searchParams.guests,
        check_in: searchParams.checkIn,
        check_out: searchParams.checkOut,
      });
      setProperties(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties. Ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedCategory, searchParams]);

  // Compute category counts
  const categoryCounts = allProperties.reduce((acc, curr) => {
    acc['All Stays'] = (acc['All Stays'] || 0) + 1;
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSelectDestinationChip = (cityName: string) => {
    setSearchParams((prev) => ({
      ...prev,
      city: prev.city?.toLowerCase() === cityName.toLowerCase() ? undefined : cityName,
    }));
  };

  const handleResetFilters = () => {
    setSelectedCategory('All Stays');
    setSearchParams({});
  };

  const searchSummary = {
    city: searchParams.city,
    dates: searchParams.checkIn && searchParams.checkOut
      ? `${searchParams.checkIn.slice(5)} to ${searchParams.checkOut.slice(5)}`
      : undefined,
    guests: searchParams.guests ? `${searchParams.guests} guests` : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Demo helper banner for quick testing */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-rose-400">
              <Sparkles className="w-3.5 h-3.5" /> StayNest Demo:
            </span>
            <span className="text-gray-300">
              {user ? (
                <>Logged in as <strong className="text-white">{user.name}</strong> ({user.role})</>
              ) : (
                'Select a demo persona to test:'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <button
              onClick={() => demoLogin('guest')}
              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition text-[11px]"
            >
              Guest (Aarav)
            </button>
            <button
              onClick={() => demoLogin('host')}
              className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition text-[11px]"
            >
              Host (Priya)
            </button>
            <button
              onClick={() => demoLogin('admin')}
              className="px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition text-[11px]"
            >
              Admin (Ops)
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        onSearchClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
        searchSummary={searchSummary}
      />

      {/* Expandable Search Drawer */}
      <SearchBar
        isOpen={isSearchBarOpen}
        onClose={() => setIsSearchBarOpen(false)}
        initialValues={searchParams}
        onSearch={(params) => setSearchParams(params)}
      />

      {/* Popular Indian Destinations Quick Chips Bar */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1 mr-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Destinations:
            </span>
            {POPULAR_DESTINATIONS.map((dest) => {
              const isActive = searchParams.city?.toLowerCase() === dest.name.toLowerCase();
              return (
                <button
                  key={dest.name}
                  onClick={() => handleSelectDestinationChip(dest.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {dest.name}
                </button>
              );
            })}

            {searchParams.city && (
              <button
                onClick={() => setSearchParams((prev) => ({ ...prev, city: undefined }))}
                className="text-xs text-rose-600 hover:underline font-bold ml-2 whitespace-nowrap"
              >
                Clear city
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        categoryCounts={categoryCounts}
      />

      {/* Main Content & Property Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Results Info Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {searchParams.city ? `Stays in ${searchParams.city}` : selectedCategory}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Showing {properties.length} {properties.length === 1 ? 'stay' : 'stays'} available
              {searchParams.checkIn && searchParams.checkOut && ` for ${searchParams.checkIn} - ${searchParams.checkOut}`}
            </p>
          </div>

          {(selectedCategory !== 'All Stays' || searchParams.city || searchParams.guests || searchParams.checkIn) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset all
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchProperties}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300 my-8">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No matching stays found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
              Try adjusting your destination, dates, or category filters to discover more properties across India.
            </p>
            <button
              onClick={handleResetFilters}
              className="py-2.5 px-6 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold shadow-md transition"
            >
              Show all 40+ stays
            </button>
          </div>
        ) : (
          /* Property Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
