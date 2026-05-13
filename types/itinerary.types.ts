// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type ItineraryStatus = 'DRAFT' | 'FINALIZED' | 'SENT' | 'ARCHIVED';
export type DayImageLayout = 'IMAGE_TOP' | 'IMAGE_RIGHT' | 'GRID';

// ─────────────────────────────────────────────
// SUB-TYPES
// ─────────────────────────────────────────────

export interface ItineraryImage {
  id: string;
  dayId: string;
  url: string;
  altText?: string | null;
  position: number;
  createdAt: string;
}

export interface ItineraryDay {
  id: string;
  itineraryId: string;
  dayNumber: number;
  date?: string | null;
  title?: string | null;
  description?: string | null;
  imageLayout: DayImageLayout;
  // Legacy fields
  destination?: string | null;
  hotel?: string | null;
  meals?: string | null;
  transfers?: string | null;
  sightseeing?: string | null;
  activities?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  images: ItineraryImage[];
}

export interface ItineraryTheme {
  id: string;
  itineraryId: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface ItineraryPolicy {
  id: string;
  itineraryId: string;
  bookingPolicy?: string | null;
  cancellationPolicy?: string | null;
  paymentTerms?: string | null;
  otherPolicies?: string | null;
}

export interface ItineraryAccount {
  id: string;
  itineraryId: string;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  upiQrImageUrl?: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface ItineraryThankYou {
  id: string;
  itineraryId: string;
  message?: string | null;
  backgroundImageUrl?: string | null;
  companyName?: string | null;
  companyAddress?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  findUsText?: string | null;
}

export interface ItineraryCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface ItineraryCreatedBy {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────
// MAIN ITINERARY TYPE
// ─────────────────────────────────────────────

export interface Itinerary {
  id: string;
  title: string;
  customerId?: string | null;
  customer?: ItineraryCustomer | null;
  createdById?: string | null;
  createdBy?: ItineraryCreatedBy | null;
  status: ItineraryStatus;
  isTemplate: boolean;
  startDate?: string | null;
  endDate?: string | null;
  totalDays?: number | null;
  destination?: string | null;
  startPoint?: string | null;
  endPoint?: string | null;
  durationLabel?: string | null;
  totalPrice?: number | null;
  numberOfTravelers?: number | null;
  heroImageUrl?: string | null;
  inclusions?: string | null;
  exclusions?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  days: ItineraryDay[];
  theme?: ItineraryTheme | null;
  policies?: ItineraryPolicy | null;
  accounts: ItineraryAccount[];
  thankYou?: ItineraryThankYou | null;
}

// ─────────────────────────────────────────────
// REQUEST PAYLOADS
// ─────────────────────────────────────────────

export interface CreateItineraryPayload {
  title: string;
  customerId?: string | null;
  status?: ItineraryStatus;
  isTemplate?: boolean;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  destination?: string;
  startPoint?: string;
  endPoint?: string;
  durationLabel?: string;
  totalPrice?: number;
  numberOfTravelers?: number;
  heroImageUrl?: string;
  inclusions?: string;
  exclusions?: string;
  notes?: string;
  days?: DayPayload[];
  theme?: ThemePayload;
  policies?: PolicyPayload;
  accounts?: AccountPayload[];
  thankYou?: ThankYouPayload;
}

export type UpdateItineraryPayload = Partial<CreateItineraryPayload>;

export interface DayPayload {
  dayNumber: number;
  date?: string;
  title?: string;
  description?: string;
  imageLayout?: DayImageLayout;
  destination?: string;
  hotel?: string;
  meals?: string;
  transfers?: string;
  sightseeing?: string;
  activities?: string;
  notes?: string;
  images?: ImagePayload[];
}

export interface ImagePayload {
  url: string;
  altText?: string;
  position?: number;
}

export interface ThemePayload {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface PolicyPayload {
  bookingPolicy?: string;
  cancellationPolicy?: string;
  paymentTerms?: string;
  otherPolicies?: string;
}

export interface AccountPayload {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  upiQrImageUrl?: string;
  isDefault?: boolean;
}

export interface ThankYouPayload {
  message?: string;
  backgroundImageUrl?: string;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  findUsText?: string;
}

export interface GeneratePdfPayload {
  leadId?: string | null;
  customerName?: string;
  travelDate?: string;
  numberOfTravelers?: number;
}

// ─────────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ─────────────────────────────────────────────
// FILTER PARAMS
// ─────────────────────────────────────────────

export interface ItineraryFilterParams {
  page?: string;
  limit?: string;
  status?: ItineraryStatus;
  customerId?: string;
  search?: string;
  isTemplate?: string;
}