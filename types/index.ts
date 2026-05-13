// ─── Enums ────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VENDOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type LeadStatus =
  | 'NEW' | 'CONTACTED' | 'FOLLOW_UP_PENDING'
  | 'QUALIFIED' | 'QUOTED' | 'NEGOTIATION'
  | 'CONVERTED' | 'LOST';

export type LeadPriority = 'HOT' | 'WARM' | 'COLD';
export type LeadSource =
  | 'WEBSITE' | 'MANUAL' | 'WHATSAPP' | 'FACEBOOK'
  | 'INSTAGRAM' | 'MESSENGER' | 'PHONE' | 'OTHER';

export type BookingStatus = 'PENDING' | 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD';
export type FollowUpType = 'CALL' | 'MESSAGE' | 'MEETING' | 'EMAIL';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'MISSED';
export type ItineraryStatus = 'DRAFT' | 'FINALIZED' | 'SENT' | 'ARCHIVED';
export type VendorServiceType =
  | 'HOTEL' | 'TRANSPORT' | 'TOUR_OPERATOR' | 'VISA'
  | 'GUIDE' | 'AIRLINE' | 'ACTIVITY' | 'OTHER';

// ─── Models ───────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  profileImage?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  destination?: string;
  estimatedBudget?: number;
  travelDate?: string;
  numberOfTravelers?: number;
  notes?: string;
  assignedToId?: string;
  assignedTo?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  leadNotes?: LeadNote[];
  followUps?: FollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  passportNumber?: string;
  passportExpiry?: string;
  travelPreferences?: string;
  notes?: string;
  assignedToId?: string;
  assignedTo?: Pick<User, 'id' | 'name' | 'email'>;
  bookings?: Booking[];
  followUps?: FollowUp[];
  _count?: { bookings: number; payments: number };
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  leadId?: string;
  lead?: Pick<Lead, 'id' | 'name' | 'phone'>;
  customerId?: string;
  customer?: Pick<Customer, 'id' | 'name' | 'phone'>;
  assignedToId?: string;
  assignedTo?: Pick<User, 'id' | 'name'>;
  type: FollowUpType;
  status: FollowUpStatus;
  dueAt: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  id: string;
  itineraryId: string;
  dayNumber: number;
  date?: string;
  title?: string;
  destination?: string;
  hotel?: string;
  meals?: string;
  transfers?: string;
  sightseeing?: string;
  activities?: string;
  notes?: string;
  createdAt: string;
}

export interface Itinerary {
  id: string;
  title: string;
  customerId: string;
  customer?: Pick<Customer, 'id' | 'name' | 'phone' | 'email'>;
  createdById?: string;
  createdBy?: Pick<User, 'id' | 'name'>;
  status: ItineraryStatus;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  destination?: string;
  totalPrice?: number;
  inclusions?: string;
  exclusions?: string;
  notes?: string;
  days?: ItineraryDay[];
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  serviceType: VendorServiceType;
  address?: string;
  city?: string;
  country?: string;
  commissionRate?: number;
  negotiatedRates?: string;
  availabilityNotes?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  type: string;
  description?: string;
  vendorId?: string;
  vendor?: Pick<Vendor, 'id' | 'name' | 'serviceType'>;
  referenceNumber?: string;
  amount?: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customer?: Pick<Customer, 'id' | 'name' | 'phone' | 'email'>;
  itineraryId?: string;
  itinerary?: Pick<Itinerary, 'id' | 'title' | 'destination'>;
  status: BookingStatus;
  travelStart?: string;
  travelEnd?: string;
  totalAmount?: number;
  notes?: string;
  items?: BookingItem[];
  payments?: Pick<Payment, 'id' | 'amount' | 'status' | 'mode'>[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  amount: number;
  issuedAt: string;
  notes?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customer?: Pick<Customer, 'id' | 'name' | 'phone'>;
  bookingId?: string;
  booking?: Pick<Booking, 'id' | 'status' | 'travelStart'>;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  dueAmount?: number;
  paidAmount?: number;
  notes?: string;
  paidAt?: string;
  invoices?: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Dashboard Types ──────────────────────────────────────────
export interface AdminDashboardData {
  stats: {
    leads: {
      total: number; newToday: number; converted: number; lost: number;
      conversionRate: string; thisMonth: number; lastMonth: number;
    };
    customers: { total: number };
    bookings: { total: number; confirmed: number; byStatus: { status: string; count: number }[] };
    followUps: { pending: number; dueToday: number };
    payments: {
      totalAmount: number; totalCollected: number; pendingCount: number;
      thisMonthRevenue: number; lastMonthRevenue: number;
    };
  };
  charts: {
    leadsByStatus: { status: string; count: number }[];
    leadsBySource: { source: string; count: number }[];
  };
  recentLeads: Lead[];
  topAgents: (User & { conversions: number })[];
}

// ─── Form Types ───────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LeadFormData {
  name: string;
  email?: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  destination?: string;
  estimatedBudget?: number;
  travelDate?: string;
  numberOfTravelers?: number;
  notes?: string;
  assignedToId?: string;
}