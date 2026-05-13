// Stats Types
export type LeadsStats = {
  total: number;
  newToday: number;
  conversionRate: number;
  converted: number;
  lost: number;
};

export type CustomersStats = {
  total: number;
};

export type BookingsStats = {
  total: number;
  confirmed: number;
};

export type PaymentsStats = {
  totalCollected: number;
  pendingCount: number;
  thisMonthRevenue: number;
};

export type FollowUpsStats = {
  dueToday: number;
  pending: number;
};

export type DashboardStats = {
  leads: LeadsStats;
  customers: CustomersStats;
  bookings: BookingsStats;
  payments: PaymentsStats;
  followUps: FollowUpsStats;

  // Agent specific
  myLeads?: number;
  myConversions?: number;
  conversionRate?: number;
  myTodayFollowUps?: number;
  myPendingFollowUps?: number;
};

// Charts
// Backend sends stageId (not name/status) — matches groupBy(['stageId'])
export type LeadsByStage = {
  stageId: string;
  count: number;
};

export type LeadsBySource = {
  source: string;
  count: number;
};

export type DashboardCharts = {
  leadsByStatus: LeadsByStage[]; // array of { stageId, count }
  leadsBySource: LeadsBySource[];
};

// Lists
export type RecentLead = {
  id: string;
  name: string;
  phone: string;
  destination?: string;
  priority: string;

  // Backend returns LeadStage relation — field is `title`, not `name`
  stage?: {
    id: string;
    title: string;
  };
};

export type TopAgent = {
  id: string;
  name: string;
  conversions: number;
};

export type DashboardFollowUp = {
  id: string;
  type: string;
  dueAt: string;
  status: string;
  lead?: { name?: string };
  customer?: { name?: string };
};

export type AgentPerformance = {
  id: string;
  name: string;
  totalLeads: number;
  converted: number;
  conversionRate: number;
  pendingFollowUps: number;
};

// Final API Response
export type DashboardResponse = {
  stats: DashboardStats;
  charts: DashboardCharts;
  recentLeads: RecentLead[];
  topAgents: TopAgent[];
  upcomingFollowUps: DashboardFollowUp[];
  agentPerformance: AgentPerformance[];
};