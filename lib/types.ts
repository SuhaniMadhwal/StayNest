export interface User {
  id: number;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  avatar?: string;
  bio?: string;
}

export interface Review {
  id: number;
  property_id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Property {
  id: number;
  title: string;
  category: string;
  city: string;
  location: string;
  description: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  host_id?: number;
  host_name?: string;
  host_avatar?: string;
  host_rating?: number;
  host_is_superhost?: boolean;
  is_favorite?: boolean;
  reviews?: Review[];
}

export interface Booking {
  id: number;
  user_id: number;
  property_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_price: number;
  status: 'confirmed' | 'cancelled';
  created_at?: string;
  property?: Property;
  user_name?: string;
  user_email?: string;
  property_title?: string;
  guest_name?: string;
  guest_email?: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  property_id: number;
  property?: Property;
}

export interface HostStats {
  total_listings: number;
  total_bookings: number;
  total_earnings: number;
  average_rating: number;
}

export interface AdminStats {
  total_users: number;
  total_properties: number;
  total_bookings: number;
  total_revenue: number;
  active_cities: number;
  category_distribution: Record<string, number>;
}
