'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Property, Review } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Users,
  Bed,
  Bath,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  X,
  MessageSquare
} from 'lucide-react';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, openAuthModal, favorites, toggleFavorite } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(tomorrowStr);
  const [guests, setGuests] = useState<number>(2);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProperty = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProperty(id);
      setProperty(data);
      if (data.guests && guests > data.guests) {
        setGuests(data.guests);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="aspect-[16/9] bg-gray-200 rounded-3xl w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'This listing does not exist or has been removed.'}</p>
          <Link
            href="/"
            className="py-3 px-6 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-600 transition"
          >
            Return to Explore Stays
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate pricing
  const calculatePricing = () => {
    if (!checkIn || !checkOut) return null;
    const cIn = new Date(checkIn);
    const cOut = new Date(checkOut);
    const diffTime = cOut.getTime() - cIn.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (nights <= 0) return null;

    const nightlyTotal = property.price_per_night * nights;
    const cleaningFee = Math.round(nightlyTotal * 0.05);
    const serviceFee = Math.round(nightlyTotal * 0.08);
    const taxes = Math.round((nightlyTotal + cleaningFee + serviceFee) * 0.12);
    const total = nightlyTotal + cleaningFee + serviceFee + taxes;

    return {
      nights,
      nightlyTotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
    };
  };

  const pricing = calculatePricing();

  const handleReserve = async () => {
    setBookingError(null);
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!pricing || pricing.nights <= 0) {
      setBookingError('Please select valid check-in and check-out dates.');
      return;
    }

    setIsBookingLoading(true);
    try {
      const res = await api.createBooking({
        property_id: property.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
      });
      setBookingSuccess(res);
    } catch (err: any) {
      setBookingError(err.message || 'Reservation failed. Selected dates may be unavailable.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.addReview(property.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      await fetchProperty();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isFav = favorites.includes(property.id) || property.is_favorite;

  // Image gallery slice
  const mainImage = property.images[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';
  const sideImages = property.images.slice(1, 5);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Back navigation & Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> All Stays
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Listing link copied to clipboard!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 text-sm font-semibold text-gray-700 transition"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>

            <button
              onClick={() => toggleFavorite(property.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 text-sm font-semibold text-gray-700 transition"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-700'
                }`}
              />
              <span>{isFav ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Title and Location */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {property.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-700">
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
              <span>{property.rating ? property.rating.toFixed(2) : '5.0'}</span>
              <span className="text-gray-500 font-normal">
                ({property.review_count} {property.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 text-rose-500" /> {property.location || property.city}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
              {property.category}
            </span>
          </div>
        </div>

        {/* Airbnb-style 5-Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden mb-10 h-[380px] sm:h-[480px]">
          {/* Main Hero Image */}
          <div className="md:col-span-2 h-full relative group">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:brightness-95 transition"
            />
          </div>

          {/* 4 Grid Images */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {sideImages.length > 0 ? (
              sideImages.map((img, index) => (
                <div key={index} className="relative h-full overflow-hidden group">
                  <img
                    src={img}
                    alt={`${property.title} - photo ${index + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative h-full overflow-hidden bg-gray-100">
                  <img
                    src={mainImage}
                    alt="Property detail"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content & Reservation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details, Host, Amenities, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hosted By Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Entire home hosted by {property.host_name || 'Priya Sen'}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>{property.guests} guests</span>
                  <span>•</span>
                  <span>{property.bedrooms} bedrooms</span>
                  <span>•</span>
                  <span>{property.beds} beds</span>
                  <span>•</span>
                  <span>{property.bathrooms} bathrooms</span>
                </div>
              </div>

              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-100 flex-shrink-0">
                <img
                  src={property.host_avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'}
                  alt={property.host_name || 'Host'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Superhost Standard</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Experienced, highly rated hosts who are committed to providing great stays for guests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Exceptional Location</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    95% of recent guests gave the location a 5-star rating.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Free Cancellation</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cancel anytime before check-in for a full refund under StayNest flexible policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this space</h3>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-gray-900 text-gray-900" />
                <h3 className="text-xl font-bold text-gray-900">
                  {property.rating ? property.rating.toFixed(2) : '5.0'} • {property.reviews?.length || 0} reviews
                </h3>
              </div>

              {/* Reviews List */}
              <div className="space-y-6 mb-8">
                {property.reviews && property.reviews.length > 0 ? (
                  property.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                            alt={rev.user_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{rev.user_name}</p>
                            <p className="text-xs text-gray-400">{rev.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded-full border border-gray-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed pl-13">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to review this stay!</p>
                )}
              </div>

              {/* Leave a Review Form */}
              <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100">
                <h4 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-500" /> Leave a Review
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Share your experience with future StayNest travelers.
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Rating
                    </label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="5">5 - Excellent Stay</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Review Comments
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="What made your stay special? How was the host?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="py-2.5 px-5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* Right Column: Sticky Reservation Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 shadow-2xl border border-gray-200">
              
              {/* Header Price */}
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{property.price_per_night.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-500 text-sm ml-1 font-normal">night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-900">
                  <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                  <span>{property.rating ? property.rating.toFixed(2) : '5.0'}</span>
                </div>
              </div>

              {/* Date & Guest Inputs */}
              <div className="border border-gray-300 rounded-2xl overflow-hidden divide-y divide-gray-300 mb-4 bg-gray-50">
                <div className="grid grid-cols-2 divide-x divide-gray-300">
                  <div className="p-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Check-in
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut && e.target.value >= checkOut) {
                          const nextDay = new Date(e.target.value);
                          nextDay.setDate(nextDay.getDate() + 1);
                          setCheckOut(nextDay.toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none mt-1"
                    />
                  </div>

                  <div className="p-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Checkout
                    </label>
                    <input
                      type="date"
                      min={checkIn || todayStr}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none mt-1"
                    />
                  </div>
                </div>

                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    Guests (Max {property.guests})
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none mt-1 cursor-pointer"
                  >
                    {Array.from({ length: property.guests }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Booking Error */}
              {bookingError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                  {bookingError}
                </div>
              )}

              {/* Reserve Button */}
              <button
                type="button"
                onClick={handleReserve}
                disabled={isBookingLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition transform active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {isBookingLoading
                  ? 'Confirming Reservation...'
                  : user
                  ? 'Reserve Stay'
                  : 'Log in to Reserve'}
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-2">
                You won&apos;t be charged yet
              </p>

              {/* Price Calculation Breakdown */}
              {pricing && pricing.nights > 0 && (
                <div className="mt-6 space-y-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="underline">
                      ₹{property.price_per_night.toLocaleString('en-IN')} × {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span>₹{pricing.nightlyTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee (5%)</span>
                    <span>₹{pricing.cleaningFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline">StayNest service fee (8%)</span>
                    <span>₹{pricing.serviceFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline">Taxes (12% GST)</span>
                    <span>₹{pricing.taxes.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total before taxes & fees</span>
                    <span>₹{pricing.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </main>

      {/* Booking Confirmation Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900">Reservation Confirmed!</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Your booking #{bookingSuccess.id} at <strong>{property.title}</strong> has been secured in the database.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm space-y-2 mb-6 border border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Dates</span>
                <span className="font-semibold text-gray-900">
                  {bookingSuccess.check_in} to {bookingSuccess.check_out} ({bookingSuccess.nights} nights)
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Guests</span>
                <span className="font-semibold text-gray-900">{bookingSuccess.guests} Guests</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Paid</span>
                <span className="font-bold text-emerald-600">₹{bookingSuccess.total_price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Status</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700">
                  {bookingSuccess.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setBookingSuccess(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Close
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md transition text-sm flex items-center justify-center gap-1"
              >
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
