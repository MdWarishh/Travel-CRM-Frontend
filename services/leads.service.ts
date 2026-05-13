import api from '@/lib/api';
import type {
  PipelineColumn, PipelineLead, LeadStage,
  LeadActivity, FollowUp, LeadTask, LeadMeeting,
  LeadQuotation, LeadInvoice, LeadLabel,
  CreateLeadData, CreateStageData,
} from '@/types/leads.types';

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leadsService = {
  // Pipeline — main board
  getPipeline: async (): Promise<PipelineColumn[]> => {
    const res = await api.get('/leads/pipeline');
    return res.data.data;
  },

  // CRUD
  getAll: async (params?: Record<string, any>): Promise<{ leads: PipelineLead[]; pagination: any }> => {
    const res = await api.get('/leads', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<PipelineLead> => {
    const res = await api.get(`/leads/${id}`);
    return res.data.data;
  },

  create: async (data: CreateLeadData): Promise<PipelineLead> => {
    const res = await api.post('/leads', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateLeadData>): Promise<PipelineLead> => {
    const res = await api.put(`/leads/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  // Stage change
  changeStage: async (leadId: string, stageId: string) => {
    const res = await api.patch(`/leads/${leadId}/stage`, { stageId });
    return res.data.data;
  },

  // Rating update (PATCH /leads/:id/rating)
  updateRating: async (leadId: string, rating: number): Promise<{ id: string; rating: number }> => {
    const res = await api.patch(`/leads/${leadId}/rating`, { rating });
    return res.data.data;
  },

  // Assign
  assign: async (leadId: string, assignedToId: string): Promise<PipelineLead> => {
    const res = await api.patch(`/leads/${leadId}/assign`, { assignedToId });
    return res.data.data;
  },

  // Convert to customer
  convertToCustomer: async (leadId: string) => {
    const res = await api.post(`/leads/${leadId}/convert`);
    return res.data.data;
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  addNote: async (leadId: string, content: string) => {
    const res = await api.post(`/leads/${leadId}/notes`, { content });
    return res.data.data;
  },

  deleteNote: async (leadId: string, noteId: string) => {
    await api.delete(`/leads/${leadId}/notes/${noteId}`);
  },

  // ── Follow-ups ─────────────────────────────────────────────────────────────
  getFollowUps: async (leadId: string): Promise<FollowUp[]> => {
    const res = await api.get(`/leads/${leadId}/followups`);
    return res.data.data;
  },

  createFollowUp: async (leadId: string, data: any): Promise<FollowUp> => {
    const res = await api.post(`/leads/${leadId}/followups`, data);
    return res.data.data;
  },

  updateFollowUp: async (leadId: string, followUpId: string, data: any): Promise<FollowUp> => {
    const res = await api.patch(`/leads/${leadId}/followups/${followUpId}`, data);
    return res.data.data;
  },

  deleteFollowUp: async (leadId: string, followUpId: string): Promise<void> => {
    await api.delete(`/leads/${leadId}/followups/${followUpId}`);
  },

  // ── Tasks ──────────────────────────────────────────────────────────────────
  getTasks: async (leadId: string): Promise<LeadTask[]> => {
    const res = await api.get(`/leads/${leadId}/tasks`);
    return res.data.data;
  },

  createTask: async (leadId: string, data: any): Promise<LeadTask> => {
    const res = await api.post(`/leads/${leadId}/tasks`, data);
    return res.data.data;
  },

  updateTask: async (leadId: string, taskId: string, data: any): Promise<LeadTask> => {
    const res = await api.patch(`/leads/${leadId}/tasks/${taskId}`, data);
    return res.data.data;
  },

  deleteTask: async (leadId: string, taskId: string): Promise<void> => {
    await api.delete(`/leads/${leadId}/tasks/${taskId}`);
  },

  // ── Meetings ───────────────────────────────────────────────────────────────
  getMeetings: async (leadId: string): Promise<LeadMeeting[]> => {
    const res = await api.get(`/leads/${leadId}/meetings`);
    return res.data.data;
  },

  createMeeting: async (leadId: string, data: any): Promise<LeadMeeting> => {
    const res = await api.post(`/leads/${leadId}/meetings`, data);
    return res.data.data;
  },

  updateMeeting: async (leadId: string, meetingId: string, data: any): Promise<LeadMeeting> => {
    const res = await api.patch(`/leads/${leadId}/meetings/${meetingId}`, data);
    return res.data.data;
  },

  deleteMeeting: async (leadId: string, meetingId: string): Promise<void> => {
    await api.delete(`/leads/${leadId}/meetings/${meetingId}`);
  },

  // ── Labels ─────────────────────────────────────────────────────────────────
  getAllLabels: async (): Promise<LeadLabel[]> => {
    const res = await api.get('/leads/labels');
    return res.data.data;
  },

  addLabel: async (leadId: string, labelId: string) => {
    const res = await api.post(`/leads/${leadId}/labels`, { labelId });
    return res.data.data;
  },

  removeLabel: async (leadId: string, labelId: string) => {
    await api.delete(`/leads/${leadId}/labels/${labelId}`);
  },

  // ── Activities ─────────────────────────────────────────────────────────────
  getActivities: async (leadId: string): Promise<LeadActivity[]> => {
    const res = await api.get(`/leads/${leadId}/activities`);
    return res.data.data;
  },

  // ── Quotations ─────────────────────────────────────────────────────────────
  getQuotations: async (leadId: string): Promise<LeadQuotation[]> => {
    const res = await api.get(`/leads/${leadId}/quotations`);
    return res.data.data;
  },

  createQuotation: async (leadId: string, data: any): Promise<LeadQuotation> => {
    const res = await api.post(`/leads/${leadId}/quotations`, data);
    return res.data.data;
  },

  updateQuotation: async (leadId: string, quotationId: string, data: any): Promise<LeadQuotation> => {
    const res = await api.patch(`/leads/${leadId}/quotations/${quotationId}`, data);
    return res.data.data;
  },

  deleteQuotation: async (leadId: string, quotationId: string): Promise<void> => {
    await api.delete(`/leads/${leadId}/quotations/${quotationId}`);
  },

  // ── Lead Invoices ──────────────────────────────────────────────────────────
  getLeadInvoices: async (leadId: string): Promise<LeadInvoice[]> => {
    const res = await api.get(`/leads/${leadId}/invoices`);
    return res.data.data;
  },

  createLeadInvoice: async (leadId: string, data: any): Promise<LeadInvoice> => {
    const res = await api.post(`/leads/${leadId}/invoices`, data);
    return res.data.data;
  },

  updateLeadInvoice: async (leadId: string, invoiceId: string, data: any): Promise<LeadInvoice> => {
    const res = await api.patch(`/leads/${leadId}/invoices/${invoiceId}`, data);
    return res.data.data;
  },

  deleteLeadInvoice: async (leadId: string, invoiceId: string): Promise<void> => {
    await api.delete(`/leads/${leadId}/invoices/${invoiceId}`);
  },
};

// ─── Lead Stages ──────────────────────────────────────────────────────────────
export const leadStagesService = {
  getAll: async (): Promise<LeadStage[]> => {
    const res = await api.get('/lead-stages');
    return res.data.data;
  },

  create: async (data: CreateStageData): Promise<LeadStage> => {
    const res = await api.post('/lead-stages', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateStageData>): Promise<LeadStage> => {
    const res = await api.put(`/lead-stages/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lead-stages/${id}`);
  },

  reorder: async (orderedIds: string[]): Promise<LeadStage[]> => {
    const res = await api.put('/lead-stages/reorder', { orderedIds });
    return res.data.data;
  },
};