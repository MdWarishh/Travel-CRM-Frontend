import api from '@/lib/api';
import { ApiResponse } from '@/types';
import {
  UnifiedPayment,
  UnifiedPaymentsListResponse,
  UnifiedPaymentsQueryParams,
  UnifiedPaymentSummary,
  CreateUnifiedPaymentData,
  UpdateUnifiedPaymentData,
  CustomerPaymentProfile,
  VendorPaymentProfile,
  ExportUnifiedPaymentsParams,
} from '@/types/payment';

const BASE = '/unified-payments';

export const unifiedPaymentService = {

  // ─── List + Summary (combined response) ─────

  getAll: async (params?: UnifiedPaymentsQueryParams) => {
    const res = await api.get<UnifiedPaymentsListResponse>(BASE, { params });
    return res.data; // { data, pagination, summary }
  },

  // ─── Single ───────────────────────────────────

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<UnifiedPayment>>(`${BASE}/${id}`);
    return res.data.data;
  },

  // ─── Summary Cards only ───────────────────────

  getSummary: async () => {
    const res = await api.get<ApiResponse<UnifiedPaymentSummary>>(`${BASE}/summary`);
    return res.data.data;
  },

  // ─── Manual Create ────────────────────────────

  create: async (data: CreateUnifiedPaymentData) => {
    const res = await api.post<ApiResponse<UnifiedPayment>>(BASE, data);
    return res.data.data;
  },

  // ─── Update (manual only) ─────────────────────

  update: async (id: string, data: UpdateUnifiedPaymentData) => {
    const res = await api.put<ApiResponse<UnifiedPayment>>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  // ─── Delete (ADMIN, manual only) ─────────────

  delete: async (id: string) => {
    await api.delete(`${BASE}/${id}`);
  },

  // ─── Customer Payment Profile ─────────────────

  getCustomerProfile: async (customerId: string) => {
    const res = await api.get<ApiResponse<CustomerPaymentProfile>>(
      `${BASE}/customer/${customerId}`
    );
    return res.data.data;
  },

  // ─── Vendor Payment Profile ───────────────────

  getVendorProfile: async (vendorId: string) => {
    const res = await api.get<ApiResponse<VendorPaymentProfile>>(
      `${BASE}/vendor/${vendorId}`
    );
    return res.data.data;
  },

  // ─── Export ───────────────────────────────────

  exportCsv: async (params?: ExportUnifiedPaymentsParams) => {
    const res = await api.get(`${BASE}/export`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportExcel: async (params?: ExportUnifiedPaymentsParams) => {
    const res = await api.get<ApiResponse<Record<string, unknown>[]>>(`${BASE}/export`, {
      params: { ...params, format: 'excel' },
    });
    return res.data.data;
  },
};