// ─────────────────────────────────────────────────────────────────────────────
// types/vendors.ts
// ─────────────────────────────────────────────────────────────────────────────

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

export type VendorServiceType =
  | 'HOTEL'
  | 'TRANSPORT'
  | 'TOUR_OPERATOR'
  | 'VISA'
  | 'GUIDE'
  | 'AIRLINE'
  | 'ACTIVITY'
  | 'OTHER';

// ── Core Vendor ───────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  types: VendorServiceType[];
  serviceType: VendorServiceType; // legacy
  city?: string;
  country?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  commissionPercentage?: number;
  commissionRate?: number; // legacy
  negotiatedRates?: string;
  availabilityNotes?: string;
  notes?: string;
  status: VendorStatus;
  isActive: boolean;
  isPreferred: boolean;
  createdAt: string;
  updatedAt: string;
  // Stats (injected by getAllVendors)
  totalBookings?: number;
  totalRevenue?: number;
  lastUsedDate?: string | null;
}

// ── Vendor Note ───────────────────────────────────────────────────────────────

export interface VendorNote {
  id: string;
  vendorId: string;
  content: string;
  createdById?: string;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

// ── Vendor Booking (inside detail) ───────────────────────────────────────────

export interface VendorBooking {
  bookingItemId: string;
  bookingId?: string;
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  date: string;
  amount?: number;
  status: string;
  paymentStatus?: string;
  type: string;
  referenceNumber?: string;
  notes?: string;
}

// ── Vendor Payment History ────────────────────────────────────────────────────

export interface VendorPaymentRecord {
  id: string;
  amount: number;
  mode: string;
  note?: string;
  paidAt: string;
  bookingId: string;
}

// ── Vendor Summary ────────────────────────────────────────────────────────────

export interface VendorSummary {
  totalBookings: number;
  totalRevenue: number;
  lastUsedDate: string | null;
  activeBookingsCount: number;
  pendingPaymentsAmount: number;
  totalPaid: number;
}

// ── Vendor Performance ────────────────────────────────────────────────────────

export interface VendorPerformance {
  totalBookings: number;
  lastUsedDate: string | null;
  cancellationRate: number;
  reliabilityScore: number;
  cancelledCount: number;
  activeCount: number;
}

// ── Vendor Payments Tab ───────────────────────────────────────────────────────

export interface VendorPayments {
  totalPaid: number;
  pendingAmount: number;
  history: VendorPaymentRecord[];
}

// ── Full Vendor Detail (from GET /vendors/:id) ────────────────────────────────

export interface VendorDetail extends Vendor {
  summary: VendorSummary;
  bookings: VendorBooking[];
  payments: VendorPayments;
  performance: VendorPerformance;
  vendorNotes: VendorNote[];  // renamed from notes to avoid conflict with Vendor.notes (string)
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export interface VendorDashboardStats {
  total: number;
  preferred: number;
  blacklisted: number;
  active: number;
}

// ── Suggest Result ────────────────────────────────────────────────────────────

export interface VendorSuggest {
  id: string;
  name: string;
  types: VendorServiceType[];
  city?: string;
  contactPerson?: string;
  phone?: string;
  commissionPercentage?: number;
  isPreferred: boolean;
}

// ── Query Params ──────────────────────────────────────────────────────────────

export interface VendorQueryParams {
  page?: string | number;
  limit?: string | number;
  search?: string;
  type?: VendorServiceType | '';
  city?: string;
  status?: VendorStatus | '';
  isPreferred?: string | boolean;
  sortBy?: 'name' | 'city' | 'createdAt' | 'usage' | 'revenue';
  
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateVendorPayload {
  name: string;
  types: VendorServiceType[];
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  commissionPercentage?: number;
  negotiatedRates?: string;
  availabilityNotes?: string;
  notes?: string;
  status?: VendorStatus;
  isPreferred?: boolean;
}

export interface UpdateVendorPayload extends Partial<CreateVendorPayload> {}

export interface ChangeVendorStatusPayload {
  status: VendorStatus;
}

export interface AddVendorNotePayload {
  content: string;
}

export interface UpdateVendorNotePayload {
  content: string;
}

export interface SuggestVendorParams {
  city?: string;
  type?: VendorServiceType;
  limit?: number;
}

// ── Paginated / API Response helpers ─────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}