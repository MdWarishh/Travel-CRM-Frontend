// services/reports.service.ts

import api from '@/lib/api';
import {
  LeadReport,
  LeadQueryParams,
  ConversionReport,
  BookingReport,
  BookingQueryParams,
  PaymentReport,
  PaymentQueryParams,
  AgentPerformance,
  ReportDateParams,
  ReportApiResponse,
} from '@/types/reports.types';

export const reportsService = {
  // GET /reports/leads?from=&to=&source=&assignedToId=
  getLeadReport: async (params?: LeadQueryParams): Promise<LeadReport> => {
    const res = await api.get<ReportApiResponse<LeadReport>>('/reports/leads', { params });
    return res.data.data;
  },

  // GET /reports/conversions?from=&to=
  getConversionReport: async (params?: ReportDateParams): Promise<ConversionReport> => {
    const res = await api.get<ReportApiResponse<ConversionReport>>('/reports/conversions', { params });
    return res.data.data;
  },

  // GET /reports/bookings?from=&to=&status=
  getBookingReport: async (params?: BookingQueryParams): Promise<BookingReport> => {
    const res = await api.get<ReportApiResponse<BookingReport>>('/reports/bookings', { params });
    return res.data.data;
  },

  // GET /reports/payments?from=&to=&mode=&status=
  getPaymentReport: async (params?: PaymentQueryParams): Promise<PaymentReport> => {
    const res = await api.get<ReportApiResponse<PaymentReport>>('/reports/payments', { params });
    return res.data.data;
  },

  // GET /reports/agent-performance?from=&to=
  getAgentPerformance: async (params?: ReportDateParams): Promise<AgentPerformance[]> => {
    const res = await api.get<ReportApiResponse<AgentPerformance[]>>('/reports/agent-performance', { params });
    return res.data.data;
  },
};