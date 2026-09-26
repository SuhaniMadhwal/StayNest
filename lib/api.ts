const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('staynest_token');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('staynest_token', token);
  } else {
    localStorage.removeItem('staynest_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errorData = await res.json();
      errorDetail = errorData.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  demoLogin: (role: string) => request<any>(`/auth/demo/${role}`, { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Properties
  getProperties: (params?: {
    category?: string;
    city?: string;
    guests?: number;
    check_in?: string;
    check_out?: string;
    min_price?: number;
    max_price?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.category && params.category !== 'All Stays') searchParams.append('category', params.category);
      if (params.city) searchParams.append('city', params.city);
      if (params.guests) searchParams.append('guests', params.guests.toString());
      if (params.check_in) searchParams.append('check_in', params.check_in);
      if (params.check_out) searchParams.append('check_out', params.check_out);
      if (params.min_price) searchParams.append('min_price', params.min_price.toString());
      if (params.max_price) searchParams.append('max_price', params.max_price.toString());
    }
    const qs = searchParams.toString();
    return request<any[]>(`/properties${qs ? `?${qs}` : ''}`);
  },
  getProperty: (id: number | string) => request<any>(`/properties/${id}`),
  createProperty: (data: any) => request<any>('/properties', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (id: number, data: any) => request<any>(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProperty: (id: number) => request<any>(`/properties/${id}`, { method: 'DELETE' }),

  // Reviews
  addReview: (propertyId: number, data: { rating: number; comment: string }) =>
    request<any>(`/properties/${propertyId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data: { property_id: number; check_in: string; check_out: string; guests: number }) =>
    request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getMyBookings: () => request<any[]>('/bookings/my'),
  cancelBooking: (id: number) => request<any>(`/bookings/${id}/cancel`, { method: 'PUT' }),

  // Favorites
  toggleFavorite: (propertyId: number) => request<{ favorited: boolean; property_id: number }>(`/favorites/${propertyId}`, { method: 'POST' }),
  getMyFavorites: () => request<any[]>('/favorites/my'),

  // Host
  getHostProperties: () => request<any[]>('/host/properties'),
  getHostBookings: () => request<any[]>('/host/bookings'),
  getHostStats: () => request<any>('/host/stats'),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: () => request<any[]>('/admin/users'),
  getAdminProperties: () => request<any[]>('/admin/properties'),
  getAdminBookings: () => request<any[]>('/admin/bookings'),
};
