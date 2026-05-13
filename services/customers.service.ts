import api from '@/lib/api';
import {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerTimeline,
  CustomerNote,
  CustomerCommunication,
  CommunicationTemplate,
  CustomerActivity,
  SendWhatsAppPayload,
  SendEmailPayload,
  CreateTemplatePayload,
  CustomerListParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types/customer.types';

const BASE = '/customers';

// ─────────────────────────────────────────────
// CUSTOMERS — CRUD
// ─────────────────────────────────────────────

export const customersService = {
  getAll: async (params?: CustomerListParams) => {
    const res = await api.get<PaginatedResponse<Customer>>(BASE, { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Customer>>(`${BASE}/${id}`);
    return res.data.data;
  },

  create: async (data: CreateCustomerPayload) => {
    const res = await api.post<ApiResponse<Customer>>(BASE, data);
    return res.data.data;
  },

  createFromLead: async (leadId: string) => {
    const res = await api.post<ApiResponse<Customer>>(`${BASE}/from-lead/${leadId}`);
    return res.data.data;
  },

  update: async (id: string, data: UpdateCustomerPayload) => {
    const res = await api.put<ApiResponse<Customer>>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`${BASE}/${id}`);
  },

  // ─────────────────────────────────────────────
  // TIMELINE
  // ─────────────────────────────────────────────

  getTimeline: async (id: string) => {
    const res = await api.get<ApiResponse<CustomerTimeline>>(`${BASE}/${id}/timeline`);
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // COMMUNICATIONS
  // ─────────────────────────────────────────────

  getCommunications: async (id: string) => {
    const res = await api.get<ApiResponse<CustomerCommunication[]>>(`${BASE}/${id}/communications`);
    return res.data.data;
  },

  sendWhatsApp: async (payload: SendWhatsAppPayload) => {
    const res = await api.post<ApiResponse<{ whatsappUrl: string; phone: string; communication: CustomerCommunication }>>(
      `${BASE}/whatsapp/send`,
      payload
    );
    return res.data.data;
  },

  sendEmail: async (payload: SendEmailPayload) => {
    const res = await api.post<ApiResponse<{ email: string; communication: CustomerCommunication }>>(
      `${BASE}/email/send`,
      payload
    );
    return res.data.data;
  },

  sharePdf: async (id: string, payload: { documentUrl: string; channel: string; entityType: string }) => {
    const res = await api.post<ApiResponse<{ success: boolean }>>(`${BASE}/${id}/pdf/share`, payload);
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // NOTES
  // ─────────────────────────────────────────────

  getNotes: async (id: string) => {
    const res = await api.get<ApiResponse<CustomerNote[]>>(`${BASE}/${id}/notes`);
    return res.data.data;
  },

  addNote: async (id: string, data: { content: string; type?: CustomerNote['type'] }) => {
    const res = await api.post<ApiResponse<CustomerNote>>(`${BASE}/${id}/notes`, data);
    return res.data.data;
  },

  updateNote: async (id: string, noteId: string, data: { content?: string; type?: CustomerNote['type'] }) => {
    const res = await api.put<ApiResponse<CustomerNote>>(`${BASE}/${id}/notes/${noteId}`, data);
    return res.data.data;
  },

  deleteNote: async (id: string, noteId: string) => {
    await api.delete(`${BASE}/${id}/notes/${noteId}`);
  },

  // ─────────────────────────────────────────────
  // ACTIVITY LOG
  // ─────────────────────────────────────────────

  getActivity: async (id: string) => {
    const res = await api.get<ApiResponse<CustomerActivity[]>>(`${BASE}/${id}/activity`);
    return res.data.data;
  },

  // ─────────────────────────────────────────────
  // COMMUNICATION TEMPLATES
  // ─────────────────────────────────────────────

  getTemplates: async (type?: 'WHATSAPP' | 'EMAIL') => {
    const res = await api.get<ApiResponse<CommunicationTemplate[]>>(`${BASE}/templates`, {
      params: type ? { type } : {},
    });
    return res.data.data;
  },

  createTemplate: async (data: CreateTemplatePayload) => {
    const res = await api.post<ApiResponse<CommunicationTemplate>>(`${BASE}/templates`, data);
    return res.data.data;
  },

  updateTemplate: async (templateId: string, data: Partial<CreateTemplatePayload>) => {
    const res = await api.put<ApiResponse<CommunicationTemplate>>(
      `${BASE}/templates/${templateId}`,
      data
    );
    return res.data.data;
  },

  deleteTemplate: async (templateId: string) => {
    await api.delete(`${BASE}/templates/${templateId}`);
  },
};