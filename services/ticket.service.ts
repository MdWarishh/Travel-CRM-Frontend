import api from '@/lib/api';
import { ApiResponse } from '@/types';
import {
  TicketSeller, TicketBuyer, TicketDeal, TicketMatch,
  TicketDashboardStats, WhatsAppLinkResponse, RevenueReport,
  TicketPayment, BulkImportResult, AgentPermission,
  CreateSellerPayload, UpdateSellerPayload,
  CreateBuyerPayload, UpdateBuyerPayload,
  CreateDealPayload, UpdateDealPayload,
  CreatePaymentPayload, BulkImportPayload,
} from '@/types/ticket.types';

const BASE = '/tickets';

// ─── Stats ────────────────────────────────────────────────────────────────────
export const ticketStatsService = {
  get: async (): Promise<TicketDashboardStats> => {
    const res = await api.get<ApiResponse<TicketDashboardStats>>(`${BASE}/stats`);
    return res.data.data;
  },
};

// ─── Matches ──────────────────────────────────────────────────────────────────
export const ticketMatchService = {
  getMatches: async (): Promise<TicketMatch[]> => {
    const res = await api.get<ApiResponse<TicketMatch[]>>(`${BASE}/matches`);
    return res.data.data;
  },
};

// ─── Sellers ──────────────────────────────────────────────────────────────────
export const ticketSellerService = {
  getAll: async (filters?: Record<string, string>): Promise<TicketSeller[]> => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const res = await api.get<ApiResponse<TicketSeller[]>>(`${BASE}/sellers${params ? `?${params}` : ''}`);
    return res.data.data;
  },
  getById: async (id: string): Promise<TicketSeller> => {
    const res = await api.get<ApiResponse<TicketSeller>>(`${BASE}/sellers/${id}`);
    return res.data.data;
  },
  create: async (data: CreateSellerPayload): Promise<{ seller: TicketSeller; matches: TicketMatch[] }> => {
    const res = await api.post<ApiResponse<{ seller: TicketSeller; matches: TicketMatch[] }>>(`${BASE}/sellers`, data);
    return res.data.data;
  },
  update: async (id: string, data: UpdateSellerPayload): Promise<TicketSeller> => {
    const res = await api.patch<ApiResponse<TicketSeller>>(`${BASE}/sellers/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/sellers/${id}`);
  },
};

// ─── Buyers ───────────────────────────────────────────────────────────────────
export const ticketBuyerService = {
  getAll: async (filters?: Record<string, string>): Promise<TicketBuyer[]> => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const res = await api.get<ApiResponse<TicketBuyer[]>>(`${BASE}/buyers${params ? `?${params}` : ''}`);
    return res.data.data;
  },
  getById: async (id: string): Promise<TicketBuyer> => {
    const res = await api.get<ApiResponse<TicketBuyer>>(`${BASE}/buyers/${id}`);
    return res.data.data;
  },
  create: async (data: CreateBuyerPayload): Promise<{ buyer: TicketBuyer; matches: TicketMatch[] }> => {
    const res = await api.post<ApiResponse<{ buyer: TicketBuyer; matches: TicketMatch[] }>>(`${BASE}/buyers`, data);
    return res.data.data;
  },
  update: async (id: string, data: UpdateBuyerPayload): Promise<TicketBuyer> => {
    const res = await api.patch<ApiResponse<TicketBuyer>>(`${BASE}/buyers/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/buyers/${id}`);
  },
};

// ─── Deals ────────────────────────────────────────────────────────────────────
export const ticketDealService = {
  getAll: async (filters?: Record<string, string>): Promise<TicketDeal[]> => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const res = await api.get<ApiResponse<TicketDeal[]>>(`${BASE}/deals${params ? `?${params}` : ''}`);
    return res.data.data;
  },
  getById: async (id: string): Promise<TicketDeal> => {
    const res = await api.get<ApiResponse<TicketDeal>>(`${BASE}/deals/${id}`);
    return res.data.data;
  },
  connect: async (data: CreateDealPayload): Promise<TicketDeal> => {
    const res = await api.post<ApiResponse<TicketDeal>>(`${BASE}/deals`, data);
    return res.data.data;
  },
  update: async (id: string, data: UpdateDealPayload): Promise<TicketDeal> => {
    const res = await api.patch<ApiResponse<TicketDeal>>(`${BASE}/deals/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/deals/${id}`);
  },
  getWhatsAppLink: async (id: string, targetRole: 'seller' | 'buyer' = 'seller'): Promise<WhatsAppLinkResponse> => {
    const res = await api.get<ApiResponse<WhatsAppLinkResponse>>(`${BASE}/deals/${id}/whatsapp?targetRole=${targetRole}`);
    return res.data.data;
  },
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const ticketPaymentService = {
  getByDeal: async (dealId: string): Promise<TicketPayment[]> => {
    const res = await api.get<ApiResponse<TicketPayment[]>>(`${BASE}/deals/${dealId}/payments`);
    return res.data.data;
  },
  add: async (dealId: string, data: CreatePaymentPayload): Promise<TicketPayment> => {
    const res = await api.post<ApiResponse<TicketPayment>>(`${BASE}/deals/${dealId}/payments`, data);
    return res.data.data;
  },
  delete: async (paymentId: string): Promise<void> => {
    await api.delete(`${BASE}/payments/${paymentId}`);
  },
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const ticketReportService = {
  getRevenue: async (params?: { dateFrom?: string; dateTo?: string; groupBy?: 'month' | 'day' }): Promise<RevenueReport> => {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await api.get<ApiResponse<RevenueReport>>(`${BASE}/reports/revenue${q ? `?${q}` : ''}`);
    return res.data.data;
  },
};

// ─── Import ───────────────────────────────────────────────────────────────────
export const ticketImportService = {
  bulkImport: async (data: BulkImportPayload): Promise<BulkImportResult> => {
    const res = await api.post<ApiResponse<BulkImportResult>>(`${BASE}/import`, data);
    return res.data.data;
  },
  getHistory: async () => {
    const res = await api.get(`${BASE}/import/history`);
    return res.data.data;
  },
};

// ─── Agent Permissions ────────────────────────────────────────────────────────
export const ticketPermissionService = {
  getAll: async (): Promise<AgentPermission[]> => {
    const res = await api.get<ApiResponse<AgentPermission[]>>(`${BASE}/permissions`);
    return res.data.data;
  },
  getForUser: async (userId: string): Promise<AgentPermission> => {
    const res = await api.get<ApiResponse<AgentPermission>>(`${BASE}/permissions/${userId}`);
    return res.data.data;
  },
  upsert: async (data: Partial<AgentPermission> & { userId: string }): Promise<AgentPermission> => {
    const res = await api.post<ApiResponse<AgentPermission>>(`${BASE}/permissions`, data);
    return res.data.data;
  },
};