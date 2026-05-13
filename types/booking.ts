export type BookingStatus =
  | 'DRAFT' | 'PENDING' | 'REQUESTED' | 'CONFIRMED'
  | 'VOUCHER_SENT' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TripStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
export type DayStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE';
export type MealPlan = 'CP' | 'MAP' | 'AP' | 'EP';
export type TravelClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';
export type FlightStatus = 'BOOKED' | 'PENDING' | 'CANCELLED';
export type TransportType = 'PRIVATE' | 'SHARED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type LogType = 'SYSTEM' | 'MANUAL';

// ─── Vendor mini shape (returned in nested includes) ───────
export interface VendorSnippet {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

// ─── Hotel ─────────────────────────────────────────────────
export interface HotelBooking {
  id: string;
  bookingId: string;
  city: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  roomType: RoomType;
  mealPlan: MealPlan;
  guests: number;
  extraBed: boolean;
  notes?: string;
  // ── vendor ──
  vendorId?: string | null;
  vendor?: VendorSnippet | null;
  vendorCost?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Flight ────────────────────────────────────────────────
export interface FlightBooking {
  id: string;
  bookingId: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  airline?: string;
  flightNumber?: string;
  pnr?: string;
  travelClass: TravelClass;
  baggage?: string;
  status: FlightStatus;
  notes?: string;
  // ── vendor ──
  vendorId?: string | null;
  vendor?: VendorSnippet | null;
  vendorCost?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Transport ─────────────────────────────────────────────
export interface TransportBooking {
  id: string;
  bookingId: string;
  vehicleType: string;
  pickup: string;
  drop: string;
  datetime: string;
  driverName?: string;
  driverPhone?: string;
  transportType: TransportType;
  days?: number;
  included: boolean;
  notes?: string;
  // ── vendor ──
  vendorId?: string | null;
  vendor?: VendorSnippet | null;
  vendorCost?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Other booking sub-types ───────────────────────────────
export interface BookingLog {
  id: string; bookingId: string; message: string; type: LogType; createdAt: string;
}

export interface BookingTask {
  id: string; bookingId: string; title: string; isCompleted: boolean;
  isDefault: boolean; completedAt?: string; createdAt: string;
}

export interface BookingTraveller {
  id: string; bookingId: string; name: string; age?: number;
  gender?: Gender; idProof?: string; createdAt: string;
}

export interface BookingDay {
  id: string; bookingId: string; dayNumber: number; date?: string;
  title?: string; description?: string; status: DayStatus; notes?: string;
}

export interface BookingPayment {
  id: string; bookingId: string; amount: number; mode: string;
  note?: string; paidAt: string; createdAt: string;
}

// ─── Payment summary ───────────────────────────────────────
export interface PaymentBreakdownItem {
  label: string;
  unitPrice: number;
  qty: number;
  total: number;
}

export interface PaymentsResponse {
  summary: {
    totalAmount: number;
    totalPaid: number;
    dueAmount: number;
    paymentStatus: PaymentStatus;
    adults: number;
    children: number;
    pricePerAdult: number | null;
    pricePerChild: number | null;
    breakdown: PaymentBreakdownItem[];
  };
  payments: BookingPayment[];
}

// ─── Full Booking ──────────────────────────────────────────
export interface Booking {
  id: string;
  customerId: string;
  customer: { id: string; name: string; phone: string; email?: string };
  itineraryId?: string;
  itinerary?: {
    id: string; title: string; destination?: string;
    days: Array<{ dayNumber: number; title?: string; description?: string }>;
  };
  status: BookingStatus;
  tripStatus: TripStatus;
  travelStart?: string;
  travelEnd?: string;
  totalDays?: number;
  totalNights?: number;
  adults?: number;
  children?: number;
  childAge?: string;
  startDetails?: string;
  endDetails?: string;
  tourDays?: string;
  inclusions?: string;
  dayWiseItinerary?: string;
  companyLogoUrl?: string;
  pricePerAdult?: number;
  pricePerChild?: number;
  totalAmount?: number;
  advancePaid?: number;
  paymentStatus?: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  items: Array<{ id: string; type: string; description?: string; amount?: number; status: string }>;
  payments: Array<{ id: string; amount: number; status: string; mode: string }>;
  hotelBookings: HotelBooking[];
  flightBookings: FlightBooking[];
  transportBookings: TransportBooking[];
  logs: BookingLog[];
  tasks: BookingTask[];
  travellers: BookingTraveller[];
  days: BookingDay[];
  bookingPayments: BookingPayment[];
}

// ─── Create / Update payloads ──────────────────────────────
export interface CreateBookingData {
  customerId: string;
  itineraryId?: string;
  status?: BookingStatus;
  travelStart?: string;
  travelEnd?: string;
  adults?: number;
  children?: number;
  childAge?: string;
  pricePerAdult?: number;
  pricePerChild?: number;
  totalAmount?: number;
  advancePaid?: number;
  notes?: string;
  startDetails?: string;
  endDetails?: string;
  tourDays?: string;
  inclusions?: string;
  dayWiseItinerary?: string;
  companyLogoUrl?: string;
}

// ─── Hotel form ────────────────────────────────────────────
export interface HotelBookingFormData {
  city: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  roomType: RoomType;
  mealPlan: MealPlan;
  guests: number;
  extraBed: boolean;
  notes?: string;
  // ── vendor ──
  vendorId?: string | null;
  vendorCost?: number | null;
}

// ─── Flight form ───────────────────────────────────────────
export interface FlightBookingFormData {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  airline?: string;
  flightNumber?: string;
  pnr?: string;
  travelClass: TravelClass;
  baggage?: string;
  status: FlightStatus;
  notes?: string;
  // ── vendor ──
  vendorId?: string | null;
  vendorCost?: number | null;
}

// ─── Transport form ────────────────────────────────────────
export interface TransportBookingFormData {
  vehicleType: string;
  pickup: string;
  drop: string;
  datetime: string;
  driverName?: string;
  driverPhone?: string;
  transportType: TransportType;
  days?: number;
  included: boolean;
  notes?: string;
  // ── vendor ──
  vendorId?: string | null;
  vendorCost?: number | null;
}

// ─── WhatsApp ──────────────────────────────────────────────
export interface WhatsAppMessageType {
  message: string;
  phone: string;
  whatsappUrl: string;
}

// ─── Vendor dropdown item (from GET /bookings/vendors?type=X) ─
export interface BookingVendorOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  isPreferred: boolean;
}