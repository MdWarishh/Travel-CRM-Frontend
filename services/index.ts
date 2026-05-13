import api from '@/lib/api';
import { Payment, Vendor, FollowUp, Itinerary, User, PaginatedResponse, ApiResponse } from '@/types';
import type { DashboardResponse } from '@/types/dashboard.types';

// ─── Payments ─────────────────────────────────────────────────
export const paymentsService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get('/payments', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Payment>) => {
    const res = await api.post<ApiResponse<Payment>>('/payments', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Payment>) => {
    const res = await api.put<ApiResponse<Payment>>(`/payments/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => { await api.delete(`/payments/${id}`); },
  createInvoice: async (data: { paymentId: string; amount: number; notes?: string }) => {
    const res = await api.post('/payments/invoices/create', data);
    return res.data.data;
  },
  getInvoice: async (id: string) => {
    const res = await api.get(`/payments/invoices/${id}`);
    return res.data.data;
  },
};

// ─── Vendors ──────────────────────────────────────────────────
export const vendorsService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get<PaginatedResponse<Vendor>>('/vendors', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Vendor>>(`/vendors/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Vendor>) => {
    const res = await api.post<ApiResponse<Vendor>>('/vendors', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Vendor>) => {
    const res = await api.put<ApiResponse<Vendor>>(`/vendors/${id}`, data);
    return res.data.data;
  },
  toggleStatus: async (id: string) => {
    const res = await api.patch<ApiResponse<Vendor>>(`/vendors/${id}/toggle-status`);
    return res.data.data;
  },
  delete: async (id: string) => { await api.delete(`/vendors/${id}`); },
};

// ─── Follow-ups ───────────────────────────────────────────────
export const followupsService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get<PaginatedResponse<FollowUp>>('/follow-ups', { params });
    return res.data;
  },
  getToday: async () => {
    const res = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/today');
    return res.data.data;
  },
  create: async (data: Partial<FollowUp>) => {
    const res = await api.post<ApiResponse<FollowUp>>('/follow-ups', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<FollowUp>) => {
    const res = await api.put<ApiResponse<FollowUp>>(`/follow-ups/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => { await api.delete(`/follow-ups/${id}`); },
};

// ─── Itineraries ──────────────────────────────────────────────


// ─── Dashboard ────────────────────────────────────────────────
export const dashboardService = {
  getData: async (): Promise<DashboardResponse> => {
    const res = await api.get<ApiResponse<DashboardResponse>>('/dashboard');
    return res.data.data;
  },
};

// ─── Users ────────────────────────────────────────────────────
export const usersService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get<PaginatedResponse<User>>('/users', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<User> & { password: string }) => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<User>) => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },
  toggleStatus: async (id: string) => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
    return res.data.data;
  },
  delete: async (id: string) => { await api.delete(`/users/${id}`); },
};

// ─── Notifications ────────────────────────────────────────────
export const notificationsService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },
  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.patch('/notifications/mark-all-read');
  },
  delete: async (id: string) => { await api.delete(`/notifications/${id}`); },
};

// ─── Reports ──────────────────────────────────────────────────
export const reportsService = {
  getLeadReport: async (params?: Record<string, string>) => {
    const res = await api.get('/reports/leads', { params });
    return res.data.data;
  },
  getConversionReport: async (params?: Record<string, string>) => {
    const res = await api.get('/reports/conversions', { params });
    return res.data.data;
  },
  getBookingReport: async (params?: Record<string, string>) => {
    const res = await api.get('/reports/bookings', { params });
    return res.data.data;
  },
  getPaymentReport: async (params?: Record<string, string>) => {
    const res = await api.get('/reports/payments', { params });
    return res.data.data;
  },
  getAgentPerformance: async (params?: Record<string, string>) => {
    const res = await api.get('/reports/agent-performance', { params });
    return res.data.data;
  },
};