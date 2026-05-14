// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type UnifiedPaymentType = 'INCOMING' | 'OUTGOING';

export type UnifiedPaymentSource = 'BOOKING' | 'INVOICE' | 'TICKET' | 'MANUAL';

export type UnifiedPaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'PARTIAL'
  | 'UNPAID'
  | 'REFUNDED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CHEQUE'
  | 'CARD';

// ─────────────────────────────────────────────
// LINKED ENTITIES (nested)
// ─────────────────────────────────────────────

export interface UnifiedPaymentCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface UnifiedPaymentVendor {
  id: string;
  name: string;
  phone?: string | null;
  serviceType: string;
}

export interface UnifiedPaymentBooking {
  id: string;
  status: string;
  travelStart?: string | null;
  travelEnd?: string | null;
}

export interface UnifiedPaymentInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
}

export interface UnifiedPaymentDeal {
  id: string;
  status: string;
  totalRevenue?: number | null;
  totalCost?: number | null;
  grossProfit?: number | null;
  seller: {
    fromCity: string;
    toCity: string;
    airline?: string | null;
    travelDate: string;
  };
  buyer: {
    brokerName: string;
    phone: string;
  };
}

export interface UnifiedPaymentCreatedBy {
  id: string;
  name: string;
  role: string;
}

// ─────────────────────────────────────────────
// MAIN MODEL
// ─────────────────────────────────────────────

export interface UnifiedPayment {
  id: string;
  type: UnifiedPaymentType;
  source: UnifiedPaymentSource;
  sourceId?: string | null;

  customerId?: string | null;
  customer?: UnifiedPaymentCustomer | null;

  vendorId?: string | null;
  vendor?: UnifiedPaymentVendor | null;

  bookingId?: string | null;
  booking?: UnifiedPaymentBooking | null;

  invoiceId?: string | null;
  invoice?: UnifiedPaymentInvoice | null;

  dealId?: string | null;
  deal?: UnifiedPaymentDeal | null;

  amount: number;
  method: PaymentMethod;
  status: UnifiedPaymentStatus;
  reference?: string | null;
  note?: string | null;
  paidAt: string;

  createdById?: string | null;
  createdBy?: UnifiedPaymentCreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────

export interface UnifiedPaymentSummary {
  totalIncoming: number;
  totalOutgoing: number;
  netProfit: number;
  totalPending: number;
  bySource: {
    source: UnifiedPaymentSource;
    total: number;
    count: number;
  }[];
}

// ─────────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────────

export interface UnifiedPaymentsQueryParams {
  page?: number;
  limit?: number;
  type?: UnifiedPaymentType;
  source?: UnifiedPaymentSource;
  status?: UnifiedPaymentStatus;
  method?: PaymentMethod;
  customerId?: string;
  vendorId?: string;
  bookingId?: string;
  dealId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: 'latest' | 'oldest' | 'highest' | 'lowest';
}

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

export interface UnifiedPaymentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UnifiedPaymentsListResponse {
  success: boolean;
  data: UnifiedPayment[];
  pagination: UnifiedPaymentPagination;
  summary: UnifiedPaymentSummary;
}

// ─────────────────────────────────────────────
// CREATE / UPDATE
// ─────────────────────────────────────────────

export interface CreateUnifiedPaymentData {
  type: UnifiedPaymentType;
  customerId?: string;
  vendorId?: string;
  bookingId?: string;
  invoiceId?: string;
  dealId?: string;
  amount: number;
  method?: PaymentMethod;
  status?: UnifiedPaymentStatus;
  reference?: string;
  note?: string;
  paidAt?: string;
}

export interface UpdateUnifiedPaymentData {
  type?: UnifiedPaymentType;
  amount?: number;
  method?: PaymentMethod;
  status?: UnifiedPaymentStatus;
  reference?: string;
  note?: string;
  paidAt?: string;
  customerId?: string;
  vendorId?: string;
}

// ─────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────

export interface CustomerPaymentProfile {
  customer: UnifiedPaymentCustomer;
  totalPaid: number;
  totalPending: number;
  totalPayments: number;
  payments: UnifiedPayment[];
}

export interface VendorPaymentProfile {
  vendor: UnifiedPaymentVendor;
  totalPaid: number;
  totalPending: number;
  totalPayments: number;
  payments: UnifiedPayment[];
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export interface ExportUnifiedPaymentsParams {
  format?: 'csv' | 'excel';
  type?: UnifiedPaymentType;
  source?: UnifiedPaymentSource;
  status?: UnifiedPaymentStatus;
  method?: PaymentMethod;
  customerId?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentsResponse {
  totalCost: number;
  totalPaid: number;
  remainingAmount: number;
}

// Alias for backward compatibility
export type CreatePaymentData = CreateUnifiedPaymentData & {
  paidAmount?: number;
  dueAmount?: number;
  transactionId?: string;
  notes?: string;
  mode?: PaymentMethod;
};

// ─────────────────────────────────────────────
// ALIASES (for component compatibility)
// ─────────────────────────────────────────────

// Payment alias
export type Payment = UnifiedPayment & {
  paidAmount?: number;
  dueAmount?: number;
  transactionId?: string;
  notes?: string | null;   
  mode: PaymentMethod;
  status: PaymentStatus;
  booking?: UnifiedPaymentBooking & { paymentStatus?: string } | null;
};

// PaymentStatus alias
export type PaymentStatus = 
  | 'PAID' 
  | 'PARTIALLY_PAID' 
  | 'UNPAID' 
  | 'REFUNDED';

// PaymentMode alias  
export type PaymentMode = PaymentMethod;

// PaymentsQueryParams alias
export type PaymentsQueryParams = UnifiedPaymentsQueryParams & {
  mode?: PaymentMode;
  status?: PaymentStatus;
};

// CommunicationChannel
export type CommunicationChannel = 'WHATSAPP' | 'EMAIL';