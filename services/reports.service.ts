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
  CustomerReport,
  DashboardReport,
  FlightMatchingReport,
  ProfitLossReport,
  VendorReport,
} from '@/types/reports.types';

export const reportsService = {

  getDashboard: async (params?: ReportDateParams): Promise<DashboardReport> => {
  const res = await api.get<ReportApiResponse<DashboardReport>>('/reports/dashboard', { params });
  return res.data.data;
},

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

  getFlightMatchingReport: async (params?: ReportDateParams): Promise<FlightMatchingReport> => {
  const res = await api.get<ReportApiResponse<FlightMatchingReport>>('/reports/flight-matching', { params });
  return res.data.data;
},

  // GET /reports/agent-performance?from=&to=
  getAgentPerformance: async (params?: ReportDateParams): Promise<AgentPerformance[]> => {
    const res = await api.get<ReportApiResponse<AgentPerformance[]>>('/reports/agent-performance', { params });
    return res.data.data;
  },

  getCustomerReport: async (params?: ReportDateParams): Promise<CustomerReport> => {
  const res = await api.get<ReportApiResponse<CustomerReport>>('/reports/customers', { params });
  return res.data.data;
},

getProfitLossReport: async (params?: ReportDateParams): Promise<ProfitLossReport> => {
  const res = await api.get<ReportApiResponse<ProfitLossReport>>('/reports/profit-loss', { params });
  return res.data.data;
},
getVendorReport: async (params?: ReportDateParams): Promise<VendorReport> => {
  const res = await api.get<ReportApiResponse<VendorReport>>('/reports/vendors', { params });
  return res.data.data;
},
};