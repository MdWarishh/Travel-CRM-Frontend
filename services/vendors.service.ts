// services/vendors.service.ts
// Pattern mirrors user.service.ts exactly

import api from '@/lib/api';
import {
  Vendor,
  VendorDetail,
  VendorDashboardStats,
  VendorSuggest,
  VendorNote,
  CreateVendorPayload,
  UpdateVendorPayload,
  ChangeVendorStatusPayload,
  AddVendorNotePayload,
  UpdateVendorNotePayload,
  SuggestVendorParams,
  VendorQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/vendors';

// ═════════════════════════════════════════════════════════════════════════════
// VENDORS
// ═════════════════════════════════════════════════════════════════════════════

export const vendorsService = {
  // List with filters, search, pagination, sort
  getAll: async (params?: VendorQueryParams): Promise<PaginatedResponse<Vendor>> => {
    const res = await api.get<PaginatedResponse<Vendor>>('/vendors', { params });
    return res.data;
  },

  // Full profile — summary cards + all tabs data
  getById: async (id: string): Promise<VendorDetail> => {
    const res = await api.get<ApiResponse<VendorDetail>>(`/vendors/${id}`);
    return res.data.data;
  },

  create: async (data: CreateVendorPayload): Promise<Vendor> => {
    const res = await api.post<ApiResponse<Vendor>>('/vendors', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateVendorPayload): Promise<Vendor> => {
    const res = await api.put<ApiResponse<Vendor>>(`/vendors/${id}`, data);
    return res.data.data;
  },

  // Change status: ACTIVE | INACTIVE | BLACKLISTED
  changeStatus: async (id: string, data: ChangeVendorStatusPayload): Promise<Vendor> => {
    const res = await api.patch<ApiResponse<Vendor>>(`/vendors/${id}/status`, data);
    return res.data.data;
  },

  // Toggle preferred flag
  togglePreferred: async (id: string): Promise<Vendor> => {
    const res = await api.patch<ApiResponse<Vendor>>(`/vendors/${id}/toggle-preferred`);
    return res.data.data;
  },

  // Legacy toggle active/inactive
  toggleStatus: async (id: string): Promise<Vendor> => {
    const res = await api.patch<ApiResponse<Vendor>>(`/vendors/${id}/toggle-status`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },

  // Dashboard summary stats
  getStats: async (): Promise<VendorDashboardStats> => {
    const res = await api.get<ApiResponse<VendorDashboardStats>>('/vendors/stats');
    return res.data.data;
  },

  // Auto-suggest for booking forms
  suggest: async (params?: SuggestVendorParams): Promise<VendorSuggest[]> => {
    const res = await api.get<ApiResponse<VendorSuggest[]>>('/vendors/suggest', { params });
    return res.data.data;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// VENDOR NOTES
// ═════════════════════════════════════════════════════════════════════════════

export const vendorNotesService = {
  add: async (vendorId: string, data: AddVendorNotePayload): Promise<VendorNote> => {
    const res = await api.post<ApiResponse<VendorNote>>(`/vendors/${vendorId}/notes`, data);
    return res.data.data;
  },

  update: async (vendorId: string, noteId: string, data: UpdateVendorNotePayload): Promise<VendorNote> => {
    const res = await api.put<ApiResponse<VendorNote>>(`/vendors/${vendorId}/notes/${noteId}`, data);
    return res.data.data;
  },

  delete: async (vendorId: string, noteId: string): Promise<void> => {
    await api.delete(`/vendors/${vendorId}/notes/${noteId}`);
  },
};