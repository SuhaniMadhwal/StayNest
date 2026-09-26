'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:underline">Help Centre</a></li>
              <li><a href="#" className="hover:underline">AirCover Protection</a></li>
              <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
              <li><a href="#" className="hover:underline">Disability support</a></li>
              <li><a href="#" className="hover:underline">Cancellation options</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">Hosting</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/host" className="hover:underline">StayNest your home</Link></li>
              <li><a href="#" className="hover:underline">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:underline">Hosting resources</a></li>
              <li><a href="#" className="hover:underline">Community forum</a></li>
              <li><a href="#" className="hover:underline">Hosting responsibly</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">Popular Destinations</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><span className="text-gray-700">Goa Villas & Beach Stays</span></li>
              <li><span className="text-gray-700">Manali Pine Chalets</span></li>
              <li><span className="text-gray-700">Jaipur Heritage Haveli</span></li>
              <li><span className="text-gray-700">Udaipur Lakeside Mansions</span></li>
              <li><span className="text-gray-700">Mumbai Sky Penthouses</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">StayNest</h4>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">
              Premium vacation rentals, heritage sanctuaries, and boutique nature cottages across India.
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-rose-500" /> English (IN)
              </span>
              <span>•</span>
              <span>₹ INR</span>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © 2026 StayNest, Inc. • Privacy • Terms • Sitemap • Company details
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            Crafted with <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 mx-0.5" /> for travelers exploring India
          </div>
        </div>
      </div>
    </footer>
  );
};
