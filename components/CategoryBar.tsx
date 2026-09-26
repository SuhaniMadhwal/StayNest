'use client';

import React from 'react';
import {
  Compass,
  Crown,
  Mountain,
  Palmtree,
  Landmark,
  Building2,
  Trees,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'All Stays', label: 'All Stays', icon: Compass },
  { id: 'Luxury Villas', label: 'Luxury Villas', icon: Crown },
  { id: 'Mountain Cabins', label: 'Mountain Cabins', icon: Mountain },
  { id: 'Beachfront', label: 'Beachfront', icon: Palmtree },
  { id: 'Heritage Havens', label: 'Heritage Havens', icon: Landmark },
  { id: 'City Penthouses', label: 'City Penthouses', icon: Building2 },
  { id: 'Nature Cottages', label: 'Nature Cottages', icon: Trees },
];

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-2 pb-2 px-1 flex-shrink-0 transition-all border-b-2 text-xs font-semibold ${
                  isSelected
                    ? 'border-gray-900 text-gray-900 font-bold scale-105'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition ${
                  isSelected ? 'bg-rose-50 text-rose-600' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span>{cat.label}</span>
                  {typeof count === 'number' && count > 0 && (
                    <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-gray-100 text-gray-600">
                      {count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
