// ══════════════════════════════════════════════════════════════════════
// CUSTOMER MODULE — TYPES
// ══════════════════════════════════════════════════════════════════════

export type CustomerNoteType = 'GENERAL' | 'PREFERENCE' | 'INTERNAL';
export type CommunicationChannel = 'WHATSAPP' | 'EMAIL';
export type CommunicationStatus = 'SENT' | 'FAILED' | 'PENDING';
export type TemplateType = 'WHATSAPP' | 'EMAIL';
export type CustomerActivityType =
  | 'WHATSAPP_SENT'
  | 'EMAIL_SENT'
  | 'ITINERARY_CREATED'
  | 'BOOKING_CREATED'
  | 'PDF_SHARED'
  | 'NOTE_ADDED'
  | 'NOTE_UPDATED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_UPDATED'
  | 'PAYMENT_RECEIVED'
  | 'FOLLOW_UP_ADDED'
  | 'FOLLOW_UP_COMPLETED'
  | 'DOCUMENT_UPLOADED';

export type BookingStatus =
  | 'DRAFT' | 'PENDING' | 'REQUESTED' | 'CONFIRMED'
  | 'VOUCHER_SENT' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TripStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';
export type ItineraryStatus = 'DRAFT' | 'FINALIZED' | 'SENT' | 'ARCHIVED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD';

// ─────────────────────────────────────────────
// USER (minimal — for references)
// ─────────────────────────────────────────────

export interface UserRef {
  id: string;
  name: string;
  email?: string;
}

// ─────────────────────────────────────────────
// CUSTOMER
// ─────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  country: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  travelPreferences: string | null;
  notes: string | null;
  tags: string[];
  assignedToId: string | null;
  assignedTo: UserRef | null;
  createdAt: string;
  updatedAt: string;

  // Computed stats (from service)
  totalSpend: number;
  totalTrips: number;
  upcomingTrips: number;
  lastTripDate: string | null;

  // Relations (on detail page)
  bookings?: Booking[];
  itineraries?: ItinerarySummary[];
  payments?: Payment[];
  customerNotes?: CustomerNote[];
  documents?: CustomerDocument[];
  _count?: {
    bookings: number;
    payments: number;
    itineraries: number;
    customerNotes: number;
  };
}

export interface CreateCustomerPayload {
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
  tags?: string[];
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

// ─────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  type: CustomerNoteType;
  createdBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// COMMUNICATIONS
// ─────────────────────────────────────────────

export interface CustomerCommunication {
  id: string;
  customerId: string;
  channel: CommunicationChannel;
  status: CommunicationStatus;
  subject: string | null;
  message: string;
  attachmentUrl: string | null;
  templateId: string | null;
  template: { id: string; name: string } | null;
  sentBy: UserRef | null;
  sentAt: string;
  createdAt: string;
}

export interface SendWhatsAppPayload {
  customerId: string;
  message: string;
  templateId?: string | null;
  attachmentUrl?: string | null;
  phone?: string;
}

export interface SendEmailPayload {
  customerId: string;
  subject: string;
  message: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  email?: string;
}

// ─────────────────────────────────────────────
// COMMUNICATION TEMPLATES
// ─────────────────────────────────────────────

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string | null;
  body: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  type: TemplateType;
  subject?: string;
  body: string;
  variables?: string[];
  isDefault?: boolean;
}

// ─────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: CustomerActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  performedBy: UserRef | null;
  createdAt: string;
}

// ─────────────────────────────────────────────
// BOOKINGS (summary for customer tabs)
// ─────────────────────────────────────────────

export interface Booking {
  id: string;
  customerId: string;
  itineraryId: string | null;
  status: BookingStatus;
  tripStatus: TripStatus;
  adults: number | null;
  children: number | null;
  travelStart: string | null;
  travelEnd: string | null;
  totalAmount: number | null;
  advancePaid: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// ITINERARIES (summary)
// ─────────────────────────────────────────────

export interface ItinerarySummary {
  id: string;
  title: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ItineraryStatus;
  totalPrice: number | null;
  createdAt: string;
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

export interface Payment {
  id: string;
  customerId: string;
  bookingId: string | null;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  dueAmount: number | null;
  paidAmount: number;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalDue: number;
  pendingPayments: Payment[];
}

// ─────────────────────────────────────────────
// CUSTOMER DOCUMENTS
// ─────────────────────────────────────────────

export interface CustomerDocument {
  id: string;
  customerId: string;
  name: string;
  fileUrl: string;
  fileType: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────────
// TIMELINE (full detail page data)
// ─────────────────────────────────────────────

export interface CustomerTimeline {
  bookings: Booking[];
  payments: Payment[];
  paymentSummary: PaymentSummary;
  followUps: FollowUp[];
  itineraries: ItinerarySummary[];
  activityLogs: CustomerActivity[];
  communications: CustomerCommunication[];
}

// ─────────────────────────────────────────────
// FOLLOW-UP
// ─────────────────────────────────────────────

export interface FollowUp {
  id: string;
  customerId: string | null;
  type: 'CALL' | 'MESSAGE' | 'MEETING' | 'EMAIL';
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  dueAt: string;
  notes: string | null;
  assignedTo: UserRef | null;
  createdAt: string;
}

// ─────────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────────

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'repeat' | 'recent' | 'vip';
  sort?: 'latest' | 'oldest' | 'name_asc' | 'name_desc';
  assignedToId?: string;
}