'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Property } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { favorites, toggleFavorite } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isFav = favorites.includes(property.id) || property.is_favorite;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(property.id);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const currentImage = property.images && property.images.length > 0
    ? property.images[currentImageIndex]
    : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group flex flex-col cursor-pointer">
      {/* Image Container with Slider */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-200">
        <Link href={`/properties/${property.id}`} className="block w-full h-full">
          <img
            src={currentImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-115 active:scale-90 transition z-10"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-6 h-6 transition-colors drop-shadow-md ${
              isFav
                ? 'fill-rose-500 text-rose-500 stroke-[1.5]'
                : 'fill-black/30 text-white stroke-[2] hover:fill-black/50'
            }`}
          />
        </button>

        {/* Superhost / Category Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {property.host_is_superhost && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 text-gray-900 shadow-sm backdrop-blur-sm">
              <Award className="w-3 h-3 text-rose-500" /> Superhost
            </span>
          )}
        </div>

        {/* Slider Navigation Arrows (visible on hover) */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none">
              {property.images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Details */}
      <Link href={`/properties/${property.id}`} className="mt-3 block">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[80%]">
            {property.location || property.city}
          </h3>
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
            <span>{property.rating ? property.rating.toFixed(2) : 'New'}</span>
          </div>
        </div>

        <p className="text-gray-500 text-xs truncate mt-0.5 font-medium">
          {property.title}
        </p>

        <p className="text-gray-400 text-xs mt-0.5">
          {property.category} • {property.guests} guests
        </p>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-bold text-gray-900 text-sm sm:text-base">
            ₹{property.price_per_night.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 text-xs">night</span>
        </div>
      </Link>
    </div>
  );
};
