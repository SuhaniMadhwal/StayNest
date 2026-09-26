'use client';

import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, X, Sparkles } from 'lucide-react';

export const POPULAR_DESTINATIONS = [
  { name: 'Goa', state: 'Beach & Nightlife', tag: 'Beachfront' },
  { name: 'Manali', state: 'Himachal Pradesh', tag: 'Mountains' },
  { name: 'Jaipur', state: 'Rajasthan', tag: 'Heritage' },
  { name: 'Udaipur', state: 'City of Lakes', tag: 'Palaces' },
  { name: 'Dehradun', state: 'Uttarakhand', tag: 'Valleys' },
  { name: 'Rishikesh', state: 'Yoga Capital', tag: 'Riverside' },
  { name: 'Mumbai', state: 'Maharashtra', tag: 'Penthouses' },
  { name: 'Delhi', state: 'NCR', tag: 'Culture' },
];

interface SearchBarProps {
  onSearch: (params: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
  isOpen: boolean;
  onClose: () => void;
  initialValues?: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isOpen,
  onClose,
  initialValues,
}) => {
  const [city, setCity] = useState(initialValues?.city || '');
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || '');
  const [guests, setGuests] = useState(initialValues?.guests || 1);
  const [activeTab, setActiveTab] = useState<'where' | 'dates' | 'who' | null>(null);

  // Today string in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      city: city.trim() ? city.trim() : undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests > 1 ? guests : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setCity('');
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    onSearch({});
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Top title and close */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-rose-600">
              Find Your Nest
            </span>
            <span className="text-xs text-gray-400">• Verified stays across India</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Fields Grid */}
        <div className="bg-gray-50 p-2 sm:p-3 rounded-3xl border border-gray-200 shadow-inner grid grid-cols-1 md:grid-cols-4 gap-2">
          
          {/* Destination */}
          <div 
            onClick={() => setActiveTab('where')}
            className={`p-3 rounded-2xl cursor-pointer transition ${
              activeTab === 'where' ? 'bg-white shadow-md' : 'hover:bg-white/60'
            }`}
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800">
              Where
            </label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Indian destinations"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Check in */}
          <div 
            onClick={() => setActiveTab('dates')}
            className={`p-3 rounded-2xl cursor-pointer transition ${
              activeTab === 'dates' ? 'bg-white shadow-md' : 'hover:bg-white/60'
            }`}
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800">
              Check in
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) {
                    setCheckOut('');
                  }
                }}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Check out */}
          <div 
            onClick={() => setActiveTab('dates')}
            className={`p-3 rounded-2xl cursor-pointer transition ${
              activeTab === 'dates' ? 'bg-white shadow-md' : 'hover:bg-white/60'
            }`}
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800">
              Check out
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Who / Guests + Search button */}
          <div 
            onClick={() => setActiveTab('who')}
            className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between ${
              activeTab === 'who' ? 'bg-white shadow-md' : 'hover:bg-white/60'
            }`}
          >
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800">
                Who
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-900">
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition transform active:scale-95 text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>

        </div>

        {/* Tab specific dropdown contents */}
        {activeTab === 'where' && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-lg animate-in fade-in duration-150">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Popular Indian Destinations
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setCity(dest.name);
                    setActiveTab('dates');
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border transition ${
                    city.toLowerCase() === dest.name.toLowerCase()
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-sm text-gray-900">{dest.name}</span>
                  <span className="text-xs text-gray-500">{dest.state}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'who' && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-lg animate-in fade-in duration-150 max-w-sm ml-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-gray-900">Guests</p>
                <p className="text-xs text-gray-500">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={guests <= 1}
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  -
                </button>
                <span className="font-bold text-sm w-4 text-center">{guests}</span>
                <button
                  type="button"
                  disabled={guests >= 16}
                  onClick={() => setGuests(guests + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Clear Filter Option */}
        {(city || checkIn || checkOut || guests > 1) && (
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-rose-600 underline font-medium transition"
            >
              Clear search filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
