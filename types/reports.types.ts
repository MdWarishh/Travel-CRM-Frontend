// types/reports.types.ts
// Shapes match EXACTLY what the backend returns — verified against report.service.js

export interface ReportDateParams {
  from?: string;
  to?: string;
}

export interface ReportApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ─────────────────────────────────────────────
// LEAD REPORT
// GET /reports/leads
// Returns: { total, byStatus, bySource, byPriority, byAgent }
//   byStatus  → { stageId: string|null, count: number }
//   bySource  → { source: string, count: number }
//   byPriority→ { priority: string, count: number }
//   byAgent   → { agentId, agentName, count }
// ─────────────────────────────────────────────
export interface LeadQueryParams extends ReportDateParams {
  source?: string;
  assignedToId?: string;
}

export interface LeadByStatus {
  stageId: string | null;
  count: number;
}

export interface LeadBySource {
  source: string;
  count: number;
}

export interface LeadByPriority {
  priority: string;
  count: number;
}

export interface LeadByAgent {
  agentId: string;
  agentName: string;
  count: number;
}

export interface LeadReport {
  total: number;
  byStatus: LeadByStatus[];
  bySource: LeadBySource[];
  byPriority: LeadByPriority[];
  byAgent: LeadByAgent[];
}

// ─────────────────────────────────────────────
// CONVERSION REPORT
// GET /reports/conversions
// Returns: { total, converted, lost, conversionRate, byAgent }
//   byAgent → { agentId, agentName, converted, lost }
// ─────────────────────────────────────────────
export interface ConversionByAgent {
  agentId: string;
  agentName: string;
  converted: number;
  lost: number;
}

export interface ConversionReport {
  total: number;
  converted: number;
  lost: number;
  conversionRate: string | number;
  byAgent: ConversionByAgent[];
}

// ─────────────────────────────────────────────
// BOOKING REPORT
// GET /reports/bookings
// Returns: { total, byStatus, totalRevenue, bookings }
//   byStatus → { status, count }
//   bookings → raw records with customer + itinerary included
// ─────────────────────────────────────────────
export interface BookingQueryParams extends ReportDateParams {
  status?: string;
}

export interface BookingByStatus {
  status: string;
  count: number;
}

export interface BookingReportItem {
  id: string;
  status: string;
  totalAmount?: number | null;
  createdAt?: string;
  customer?: { id: string; name: string } | null;
  itinerary?: { id: string; title: string; destination?: string | null } | null;
}

export interface BookingReport {
  total: number;
  totalRevenue: number;
  byStatus: BookingByStatus[];
  bookings: BookingReportItem[];
}

// ─────────────────────────────────────────────
// PAYMENT REPORT
// GET /reports/payments
// Returns: { total, totalAmount, totalCollected, totalDue, byStatus, byMode }
//   byStatus → { status, count, amount }
//   byMode   → { mode, count, collected }
// ─────────────────────────────────────────────
export interface PaymentQueryParams extends ReportDateParams {
  mode?: string;
  status?: string;
}

export interface PaymentByStatus {
  status: string;
  count: number;
  amount: number;
}

export interface PaymentByMode {
  mode: string;
  count: number;
  collected: number;
}

export interface PaymentReport {
  total: number;
  totalAmount: number;
  totalCollected: number;
  totalDue: number;
  byStatus: PaymentByStatus[];
  byMode: PaymentByMode[];
}

// ─────────────────────────────────────────────
// AGENT PERFORMANCE
// GET /reports/agent-performance
// Returns: array of agent objects
// ─────────────────────────────────────────────
export interface AgentPerformance {
  id: string;
  name: string;
  email: string;
  role: string;
  totalLeads: number;
  converted: number;
  lost: number;
  pendingFollowUps: number;
  completedFollowUps: number;
  conversionRate: string | number;
}

export interface CustomerByCity {
  city: string;
  count: number;
}

export interface CustomerMonthlyTrend {
  month: string;
  total: number;
}

export interface CustomerReportSummary {
  total: number;
  newThisPeriod: number;
  repeatCustomers: number;
  retentionRate: string | number;
}

export interface CustomerReport {
  summary: CustomerReportSummary;
  byCity: CustomerByCity[];
  monthlyTrend: CustomerMonthlyTrend[];
}

export interface DashboardKpis {
  totalRevenue: number;
  totalProfit: number;
  totalExpenses: number;
  netProfitMargin: string | number;
  conversionRate: string | number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalLeads: number;
  convertedLeads: number;
  totalCustomers: number;
}

export interface DashboardCharts {
  monthlyRevenue:    { month: string; revenue: number }[];
  profitVsExpense:   { month: string; revenue: number; expense: number; profit: number }[];
  leadsVsConversion: { month: string; leads: number; converted: number }[];
}

export interface DashboardReport {
  kpis:   DashboardKpis;
  charts: DashboardCharts;
}

export interface FlightMatchingSummary {
  totalListings: number;
  totalBuyers: number;
  totalDeals: number;
  completedDeals: number;
  rejectedDeals: number;
  pendingDeals: number;
  matchRate: string | number;
  completionRate: string | number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
}

export interface FlightDealByStatus {
  status: string;
  count: number;
}

export interface FlightMatchingReport {
  summary: FlightMatchingSummary;
  byStatus: FlightDealByStatus[];
}

export interface PLSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  profitMargin: string | number;
  bookingRevenue: number;
  flightRevenue: number;
  bookingExpenses: number;
  flightExpenses: number;
}

export interface MonthlyPL {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface ProfitLossReport {
  summary: PLSummary;
  monthlyPL: MonthlyPL[];
}

export interface VendorReportSummary {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
}

export interface VendorByType {
  type: string;
  count: number;
}

export interface VendorByCity {
  city: string;
  count: number;
}

export interface TopVendor {
  vendorId: string;
  vendorName: string;
  serviceType: string;
  city: string;
  usageCount: number;
  totalRevenue: number;
}

export interface VendorReport {
  summary: VendorReportSummary;
  byType: VendorByType[];
  byCity: VendorByCity[];
  topVendors: TopVendor[];
}