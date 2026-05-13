// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type DealStatus = 'PENDING' | 'CONNECTED' | 'COMPLETED' | 'REJECTED';
export type DealPaymentStatus = 'PENDING' | 'PARTIAL' | 'RECEIVED';
export type TicketPaymentType = 'RECEIVED' | 'PAID';
export type TicketPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD';
export type SourceChannel = 'EMAIL' | 'WHATSAPP' | 'PHONE' | 'WALK_IN' | 'ONLINE';
export type TicketClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';
export type BuyerPaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';
export type ImportSource = 'EMAIL' | 'CSV' | 'MANUAL';
export type ImportStatus = 'PENDING' | 'MAPPED' | 'SKIPPED';
export type ImportType = 'SELLER' | 'BUYER';
export type GroupBy = 'month' | 'day';

// ─────────────────────────────────────────────────────────────────────────────
// CORE ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

export interface TicketCreatedBy {
  id: string;
  name: string;
  role: string;
}

export interface TicketSeller {
  id: string;
  brokerName: string;
  phone: string;
  email?: string;

  fromCity: string;
  toCity: string;
  departureTime: string;   // HH:MM
  arrivalTime: string;     // HH:MM
  travelDate: string;      // ISO date

  seatsAvailable: number;
  pricePerSeat: number;
  totalValue?: number;

  // Airline & booking
  airline?: string;
  flightNumber?: string;
  bookingRef?: string;
  ticketClass?: TicketClass;
  pnr?: string;

  // Purchase tracking
  purchasePrice?: number;
  purchasedFrom?: string;
  purchasedAt?: string;

  // Source
  sourceChannel?: SourceChannel;
  emailSource?: string;

  notes?: string;
  isActive: boolean;

  createdById: string;
  createdBy: TicketCreatedBy;
  deals?: Array<{ id: string; status: DealStatus }>;

  createdAt: string;
  updatedAt: string;
}

export interface TicketBuyer {
  id: string;
  brokerName: string;
  phone: string;
  email?: string;

  fromCity: string;
  toCity: string;
  preferredTimeFrom: string;  // HH:MM
  preferredTimeTo: string;    // HH:MM
  travelDate: string;         // ISO date

  seatsRequired: number;
  budgetPerSeat: number;

  // Passenger details
  passengerCount?: number;
  passengerNames?: string;

  // Payment tracking
  agreedPricePerSeat?: number;
  totalCollected?: number;
  paymentMethod?: TicketPaymentMethod;
  paymentStatus?: BuyerPaymentStatus;
  paymentDate?: string;
  paymentRef?: string;

  // Source
  sourceChannel?: SourceChannel;
  emailSource?: string;

  notes?: string;
  isActive: boolean;

  createdById: string;
  createdBy: TicketCreatedBy;
  deals?: Array<{ id: string; status: DealStatus }>;

  createdAt: string;
  updatedAt: string;
}

export interface TicketPayment {
  id: string;
  dealId: string;
  type: TicketPaymentType;
  amount: number;
  method?: TicketPaymentMethod;
  reference?: string;
  paidAt: string;
  notes?: string;
  recordedById: string;
  recordedBy: { id: string; name: string };
  createdAt: string;
}

export interface TicketDeal {
  id: string;
  sellerId: string;
  seller: TicketSeller;
  buyerId: string;
  buyer: TicketBuyer;

  status: DealStatus;

  // Financial
  seatsBooked?: number;
  sellerCostPerSeat?: number;
  buyerPricePerSeat?: number;
  commission?: number;

  // Computed P&L
  totalRevenue?: number;
  totalCost?: number;
  grossProfit?: number;

  // Payment
  paymentStatus?: DealPaymentStatus;
  paymentReceivedAt?: string;
  paymentRef?: string;

  // Booking confirmation
  bookingConfirmed: boolean;
  confirmationRef?: string;
  ticketsSent: boolean;
  ticketsSentAt?: string;

  adminNotes?: string;
  managedById?: string;
  managedBy?: TicketCreatedBy;

  payments: TicketPayment[];

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCH ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface TicketMatch {
  seller: TicketSeller;
  buyer: TicketBuyer;
  margin: number;     // seller.pricePerSeat - buyer.budgetPerSeat (negative = profit opportunity)
  feasible: boolean;  // margin <= 0
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

export interface TicketDashboardStats {
  overview: {
    totalSellers: number;
    totalBuyers: number;
    matchesFound: number;
    feasibleMatches: number;
  };
  deals: {
    total: number;
    completed: number;
    pending: number;
    connected: number;
    rejected: number;
    today: number;
    thisMonth: number;
  };
  financials: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalCommission: number;
    cashReceived: number;
    cashPaid: number;
    netCash: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export interface RevenueTimelineEntry {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  deals: number;
  seats: number;
}

export interface RevenueRouteEntry {
  route: string;
  revenue: number;
  profit: number;
  deals: number;
}

export interface RevenueReport {
  timeline: RevenueTimelineEntry[];
  byRoute: RevenueRouteEntry[];
  totals: {
    revenue: number;
    cost: number;
    profit: number;
    deals: number;
    seats: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP
// ─────────────────────────────────────────────────────────────────────────────

export interface WhatsAppLinkResponse {
  whatsappUrl: string;
  message: string;
  targetPhone: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK IMPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportedTicketRecord {
  id: string;
  importedById: string;
  importedBy: { id: string; name: string };
  rawData: Record<string, unknown>;
  mappedTo?: ImportType;
  referenceId?: string;
  source?: ImportSource;
  sourceEmail?: string;
  importBatch?: string;
  status: ImportStatus;
  notes?: string;
  createdAt: string;
}

export interface BulkImportResult {
  batchId: string;
  success: number;
  failed: number;
  errors: Array<{ record: Record<string, unknown>; error: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentPermission {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string; role: string };

  canViewSellers: boolean;
  canAddSellers: boolean;
  canEditSellers: boolean;
  canDeleteSellers: boolean;

  canViewBuyers: boolean;
  canAddBuyers: boolean;
  canEditBuyers: boolean;
  canDeleteBuyers: boolean;

  canViewDeals: boolean;
  canAddDeals: boolean;
  canEditDeals: boolean;
  canDeleteDeals: boolean;

  canViewReports: boolean;
  canImportData: boolean;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS (Create / Update)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSellerPayload {
  brokerName: string;
  phone: string;
  email?: string;
  fromCity: string;
  toCity: string;
 departureTime?: string;   
arrivalTime?: string;  
  travelDate: string;
  seatsAvailable: number;
  pricePerSeat: number;
  airline?: string;
  flightNumber?: string;
  bookingRef?: string;
  ticketClass?: TicketClass;
  pnr?: string;
  purchasePrice?: number;
  purchasedFrom?: string;
  purchasedAt?: string;
  sourceChannel?: SourceChannel;
  emailSource?: string;
  notes?: string;
}

export type UpdateSellerPayload = Partial<CreateSellerPayload> & { isActive?: boolean };

export interface CreateBuyerPayload {
  brokerName: string;
  phone: string;
  email?: string;
  fromCity: string;
  toCity: string;
  preferredTimeFrom: string;
  preferredTimeTo: string;
  travelDate: string;
  seatsRequired: number;
  budgetPerSeat: number;
  passengerCount?: number;
  passengerNames?: string;
  agreedPricePerSeat?: number;
  totalCollected?: number;
  paymentMethod?: TicketPaymentMethod;
  paymentStatus?: BuyerPaymentStatus;
  paymentDate?: string;
  paymentRef?: string;
  sourceChannel?: SourceChannel;
  emailSource?: string;
  notes?: string;
}

export type UpdateBuyerPayload = Partial<CreateBuyerPayload> & { isActive?: boolean };

export interface CreateDealPayload {
  sellerId: string;
  buyerId: string;
  seatsBooked?: number;
  sellerCostPerSeat?: number;
  buyerPricePerSeat?: number;
  commission?: number;
  paymentStatus?: DealPaymentStatus;
  paymentRef?: string;
  adminNotes?: string;
}

export interface UpdateDealPayload {
  status?: DealStatus;
  seatsBooked?: number;
  sellerCostPerSeat?: number;
  buyerPricePerSeat?: number;
  commission?: number;
  totalRevenue?: number;
  totalCost?: number;
  grossProfit?: number;
  paymentStatus?: DealPaymentStatus;
  paymentReceivedAt?: string;
  paymentRef?: string;
  bookingConfirmed?: boolean;
  confirmationRef?: string;
  ticketsSent?: boolean;
  adminNotes?: string;
}

export interface CreatePaymentPayload {
  type: TicketPaymentType;
  amount: number;
  method?: TicketPaymentMethod;
  reference?: string;
  paidAt?: string;
  notes?: string;
}

export interface BulkImportPayload {
  type: ImportType;
  source: ImportSource;
  sourceEmail?: string;
  importBatch?: string;
  records: Record<string, unknown>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export type ActiveView = 'main' | 'reports' | 'import' | 'permissions';
export type AdminTab = 'matches' | 'deals';

export interface TicketFilters {
  fromCity?: string;
  toCity?: string;
  dateFrom?: string;
  dateTo?: string;
  airline?: string;
  status?: DealStatus;
  paymentStatus?: string;
}