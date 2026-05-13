// services/invoice.service.ts

import api from '@/lib/api';
import { ApiResponse } from '@/types/customer.types';
import {
  CompanySettings,
  UpdateCompanySettingsPayload,
  GstInvoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceQuery,
  InvoiceListResponse,
  InvoiceDashboard,
  InvoicePayment,
  RecordPaymentPayload,
  CustomerOption,
  VendorOption,
  BookingOption,
  InvoiceStatus,
} from '@/types/invoice';

export const invoiceService = {
  // ─────────────────────────────────────────────
  // COMPANY SETTINGS
  // ─────────────────────────────────────────────

  getCompanySettings: async (): Promise<CompanySettings> => {
    const res = await api.get<ApiResponse<CompanySettings>>('/invoices/settings/company');
    return res.data.data;
  },

  updateCompanySettings: async (data: UpdateCompanySettingsPayload): Promise<CompanySettings> => {
    const res = await api.put<ApiResponse<CompanySettings>>('/invoices/settings/company', data);
    return res.data.data;
  },

  resetInvoiceNumbering: async (resetTo = 0): Promise<CompanySettings> => {
    const res = await api.post<ApiResponse<CompanySettings>>('/invoices/settings/reset-numbering', { resetTo });
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────

  getDashboard: async (): Promise<InvoiceDashboard> => {
    const res = await api.get<ApiResponse<InvoiceDashboard>>('/invoices/dashboard');
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // INVOICES CRUD
  // ─────────────────────────────────────────────

  getAll: async (params?: InvoiceQuery): Promise<InvoiceListResponse> => {
    const res = await api.get<{
      success: boolean;
      data: GstInvoice[];
      pagination: InvoiceListResponse['pagination'];
      stats: InvoiceListResponse['stats'];
    }>('/invoices', { params });

    return {
      invoices: res.data.data,
      pagination: res.data.pagination,
      stats: res.data.stats,
    };
  },

  getById: async (id: string): Promise<GstInvoice> => {
    const res = await api.get<ApiResponse<GstInvoice>>(`/invoices/${id}`);
    return res.data.data;
  },

  getByNumber: async (invoiceNumber: string): Promise<GstInvoice> => {
    const res = await api.get<ApiResponse<GstInvoice>>(`/invoices/number/${invoiceNumber}`);
    return res.data.data;
  },

  create: async (data: CreateInvoicePayload): Promise<GstInvoice> => {
    const res = await api.post<ApiResponse<GstInvoice>>('/invoices', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateInvoicePayload): Promise<GstInvoice> => {
    const res = await api.put<ApiResponse<GstInvoice>>(`/invoices/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  // invoice.service.ts mein add karo
updateStatus: async (id: string, status: InvoiceStatus): Promise<GstInvoice> => {
  const res = await api.patch<ApiResponse<GstInvoice>>(`/invoices/${id}/status`, { status });
  return res.data.data;
},

  markAsSent: async (id: string): Promise<GstInvoice> => {
    const res = await api.post<ApiResponse<GstInvoice>>(`/invoices/${id}/send`);
    return res.data.data;
  },

  duplicate: async (id: string): Promise<GstInvoice> => {
    const res = await api.post<ApiResponse<GstInvoice>>(`/invoices/${id}/duplicate`);
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // PAYMENTS
  // ─────────────────────────────────────────────

  getPayments: async (invoiceId: string): Promise<InvoicePayment[]> => {
    const res = await api.get<ApiResponse<InvoicePayment[]>>(`/invoices/${invoiceId}/payments`);
    return res.data.data;
  },

  recordPayment: async (
    invoiceId: string,
    data: RecordPaymentPayload
  ): Promise<{ invoice: GstInvoice; payment: InvoicePayment }> => {
    const res = await api.post<ApiResponse<{ invoice: GstInvoice; payment: InvoicePayment }>>(
      `/invoices/${invoiceId}/payments`,
      data
    );
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // LINKED
  // ─────────────────────────────────────────────

  getByCustomer: async (customerId: string): Promise<GstInvoice[]> => {
    const res = await api.get<ApiResponse<GstInvoice[]>>(`/invoices/customer/${customerId}`);
    return res.data.data;
  },

  getByBooking: async (bookingId: string): Promise<GstInvoice[]> => {
    const res = await api.get<ApiResponse<GstInvoice[]>>(`/invoices/booking/${bookingId}`);
    return res.data.data;
  },

  // NEW: fetch invoices for a vendor
  getByVendor: async (vendorId: string): Promise<GstInvoice[]> => {
    const res = await api.get<ApiResponse<GstInvoice[]>>(`/invoices/vendor/${vendorId}`);
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // SEARCH HELPERS (used in invoice form dropdowns)
  // ─────────────────────────────────────────────

  // Search customers for the invoice form dropdown
 searchCustomers: async (search: string): Promise<CustomerOption[]> => {
  const res = await api.get<ApiResponse<CustomerOption[]>>('/customers', {
    params: { search, limit: 20 },
  });
  return res.data.data ?? [];
},

  // Search vendors for the invoice form dropdown  NEW
  searchVendors: async (search: string): Promise<VendorOption[]> => {
    const res = await api.get<ApiResponse<{ data: VendorOption[] }>>('/vendors', {
      params: { search, limit: 20 },
    });
    // vendors service returns paginated response
    const raw = res.data as unknown as { data: VendorOption[] };
    return raw?.data ?? [];
  },

  // Search bookings for the invoice form dropdown  NEW
  searchBookings: async (customerId?: string, search?: string): Promise<BookingOption[]> => {
    const res = await api.get<ApiResponse<{ data: BookingOption[] }>>('/bookings', {
      params: {
        ...(customerId && { customerId }),
        ...(search && { search }),
        limit: 20,
      },
    });
    const raw = res.data as unknown as { data: BookingOption[] };
    return raw?.data ?? [];
  },
};