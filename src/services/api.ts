// ============================================================================
// ExpenseTrack - Unified Production API Client
// Handles JWT authentication, request intercepting, and typed REST calls
// ============================================================================

import { Expense, Location, Category } from '../types';

// Dynamic API base URL: defaults to relative '/api' for monolithic/same-origin deployments,
// or uses VITE_API_URL if frontend is hosted on a separate domain (e.g. Vercel/Netlify).
const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const TOKEN_KEY = 'expensetrack_jwt_token';

// Token Management
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed saving auth token:', e);
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed removing auth token:', e);
  }
}

// Internal Fetch Helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear token
  if (response.status === 401) {
    removeStoredToken();
    // Dispatch custom event for session expiry
    window.dispatchEvent(new CustomEvent('expensetrack:unauthorized'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// ----------------------------------------------------------------------
// Auth API
// ----------------------------------------------------------------------
export const authAPI = {
  async register(data: { name: string; email: string; password: string; companyName?: string; role?: string; currency?: string }) {
    const res = await request<{ success: boolean; token: string; user: any; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await request<{ success: boolean; token: string; user: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getMe() {
    return request<{ success: boolean; user: any }>('/auth/me');
  },

  async updateProfile(data: { name?: string; companyName?: string; currency?: string; role?: string; avatarUrl?: string }) {
    return request<{ success: boolean; message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    removeStoredToken();
  }
};

// ----------------------------------------------------------------------
// Locations API
// ----------------------------------------------------------------------
export const locationsAPI = {
  async getAll(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await request<{ success: boolean; data: Location[] }>(`/locations${query}`);
    return res.data;
  },

  async getById(id: string) {
    const res = await request<{ success: boolean; data: Location }>(`/locations/${id}`);
    return res.data;
  },

  async create(data: Partial<Location>) {
    const res = await request<{ success: boolean; data: Location; message: string }>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async update(id: string, data: Partial<Location>) {
    const res = await request<{ success: boolean; data: Location; message: string }>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async delete(id: string) {
    return request<{ success: boolean; message: string }>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }
};

// ----------------------------------------------------------------------
// Expenses API
// ----------------------------------------------------------------------
export const expensesAPI = {
  async getAll(params: {
    search?: string;
    category?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.location && params.location !== 'All') query.append('location', params.location);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const res = await request<{ success: boolean; data: Expense[]; pagination: any }>(`/expenses${qs ? `?${qs}` : ''}`);
    return res;
  },

  async getById(id: string) {
    const res = await request<{ success: boolean; data: Expense }>(`/expenses/${id}`);
    return res.data;
  },

  async create(data: Partial<Expense>) {
    const res = await request<{ success: boolean; data: Expense; message: string }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async update(id: string, data: Partial<Expense>) {
    const res = await request<{ success: boolean; data: Expense; message: string }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async delete(id: string) {
    return request<{ success: boolean; message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  async bulkDelete(ids: string[]) {
    return request<{ success: boolean; message: string }>('/expenses/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }
};

// ----------------------------------------------------------------------
// Dashboard API
// ----------------------------------------------------------------------
export const dashboardAPI = {
  async getSummary() {
    const res = await request<{ success: boolean; data: any }>('/dashboard/summary');
    return res.data;
  },

  async getMonthly() {
    const res = await request<{ success: boolean; data: { month: string; key: string; total: number }[] }>('/dashboard/monthly');
    return res.data;
  },

  async getCategories() {
    const res = await request<{ success: boolean; data: { name: string; total: number; count: number; percentage: number }[] }>('/dashboard/categories');
    return res.data;
  },

  async getLocations() {
    const res = await request<{ success: boolean; data: any[] }>('/dashboard/locations');
    return res.data;
  }
};

// ----------------------------------------------------------------------
// Reports API
// ----------------------------------------------------------------------
export const reportsAPI = {
  async getExpensesReport(filters: { location?: string; category?: string; startDate?: string; endDate?: string } = {}) {
    const query = new URLSearchParams();
    if (filters.location && filters.location !== 'All') query.append('location', filters.location);
    if (filters.category && filters.category !== 'All') query.append('category', filters.category);
    if (filters.startDate) query.append('startDate', filters.startDate);
    if (filters.endDate) query.append('endDate', filters.endDate);

    const qs = query.toString();
    const res = await request<{ success: boolean; summary: any; data: Expense[] }>(`/reports/expenses${qs ? `?${qs}` : ''}`);
    return res;
  },

  async getLocationComparison() {
    const res = await request<{ success: boolean; data: any[] }>('/reports/location-comparison');
    return res.data;
  },

  async getCategoryAnalysis() {
    const res = await request<{ success: boolean; data: any[] }>('/reports/category-analysis');
    return res.data;
  }
};

// ----------------------------------------------------------------------
// Categories API
// ----------------------------------------------------------------------
export const categoriesAPI = {
  async getAll() {
    const res = await request<{ success: boolean; data: Category[] }>('/categories');
    return res.data;
  },

  async create(data: { name: string; budgetLimit?: number; color?: string }) {
    const res = await request<{ success: boolean; data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  }
};
