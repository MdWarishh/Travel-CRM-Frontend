// types/invoice.ts

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';
export type GstType = 'CGST_SGST' | 'IGST' | 'NONE';
export type InvoiceNumberFormat = 'SIMPLE' | 'YEARLY';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD';
export type DiscountType = 'PERCENT' | 'FLAT';

// ─────────────────────────────────────────────
// COMPANY SETTINGS
// ─────────────────────────────────────────────

export interface CompanySettings {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  tagline?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  gstin?: string | null;
  pan?: string | null;
  stateCode?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  upiQrImageUrl?: string | null;
  invoiceNumberFormat: InvoiceNumberFormat;
  invoicePrefix: string;
  lastInvoiceNumber: number;
  defaultTerms?: string | null;
  defaultNotes?: string | null;
  defaultGstRate: number;
  defaultGstType: GstType;
  createdAt: string;
  updatedAt: string;
}

export type UpdateCompanySettingsPayload = Partial<
  Omit<CompanySettings, 'id' | 'createdAt' | 'updatedAt' | 'lastInvoiceNumber'>
>;

// ─────────────────────────────────────────────
// INVOICE ITEM
// ─────────────────────────────────────────────

export interface GstInvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  hsn?: string | null;
  quantity: number;
  unit?: string | null;
  price: number;
  total: number;
  position: number;
  createdAt: string;
}

export interface InvoiceItemInput {
  description: string;
  hsn?: string;
  quantity: number;
  unit?: string;
  price: number;
}

// ─────────────────────────────────────────────
// INVOICE PAYMENT
// ─────────────────────────────────────────────

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  mode: PaymentMode;
  transactionId?: string | null;
  note?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface RecordPaymentPayload {
  amount: number;
  mode: PaymentMode;
  transactionId?: string;
  note?: string;
  paidAt?: string;
}

// ─────────────────────────────────────────────
// LINKED ENTITY STUBS
// ─────────────────────────────────────────────

export interface CustomerStub {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface BookingStub {
  id: string;
  totalAmount?: number | null;
  travelStart?: string | null;
  travelEnd?: string | null;
}

export interface VendorStub {
  id: string;
  name: string;
  phone?: string | null;
  serviceType?: string | null;
}

// ─────────────────────────────────────────────
// INVOICE
// ─────────────────────────────────────────────

export interface GstInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // Links
  customerId?: string | null;
  bookingId?: string | null;
  vendorId?: string | null;    // NEW

  // Billing info
  billingName: string;
  billingAddress?: string | null;
  billingState?: string | null;
  billingPhone?: string | null;
  billingEmail?: string | null;
  customerGstin?: string | null;

  // Dates
  issueDate: string;
  dueDate?: string | null;

  // Amounts
  subtotal: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountAmount?: number | null;

  // GST
  gstRate: number;
  gstType: GstType;
  cgstRate?: number | null;
  sgstRate?: number | null;
  igstRate?: number | null;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  notes?: string | null;
  terms?: string | null;
  companySnapshot?: CompanySettings | null;

  // Relations
  items: GstInvoiceItem[];
  payments: InvoicePayment[];
  customer?: CustomerStub | null;
  booking?: BookingStub | null;
  vendor?: VendorStub | null;    // NEW
  createdBy?: { id: string; name: string } | null;

  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// CREATE / UPDATE PAYLOADS
// ─────────────────────────────────────────────

export interface CreateInvoicePayload {
  customerId?: string | null;
  bookingId?: string | null;
  vendorId?: string | null;    // NEW
  billingName: string;
  billingAddress?: string;
  billingState?: string;
  billingPhone?: string;
  billingEmail?: string;
  customerGstin?: string;
  issueDate?: string;
  dueDate?: string;
  items: InvoiceItemInput[];
  discountType?: DiscountType;
  discountValue?: number;
  gstRate: number;
  gstType: GstType;
  notes?: string;
  terms?: string;
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload & { status: InvoiceStatus }>;

// ─────────────────────────────────────────────
// LIST / QUERY
// ─────────────────────────────────────────────

export interface InvoiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  bookingId?: string;
  vendorId?: string;    // NEW
  fromDate?: string;
  toDate?: string;
  sort?: 'newest' | 'oldest' | 'amount_high' | 'amount_low';
}

export interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalDue: number;
  breakdown: {
    status: InvoiceStatus;
    _count: { id: number };
    _sum: { totalAmount: number };
  }[];
}

export interface InvoiceListResponse {
  invoices: GstInvoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: InvoiceStats;
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export interface InvoiceDashboard {
  thisMonth: { total: number; paid: number; count: number };
  lastMonth: { total: number; count: number };
  overdueCount: number;
  recentInvoices: GstInvoice[];
}

// ─────────────────────────────────────────────
// CUSTOMER SELECT (for invoice form)
// ─────────────────────────────────────────────

export interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

// ─────────────────────────────────────────────
// VENDOR SELECT (for invoice form)  NEW
// ─────────────────────────────────────────────

export interface VendorOption {
  id: string;
  name: string;
  phone?: string | null;
  serviceType?: string | null;
  city?: string | null;
}

// ─────────────────────────────────────────────
// BOOKING SELECT (for invoice form)  NEW
// ─────────────────────────────────────────────

export interface BookingOption {
  id: string;
  totalAmount?: number | null;
  travelStart?: string | null;
  travelEnd?: string | null;
  customer?: { name: string } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}