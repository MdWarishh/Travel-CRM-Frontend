import api from '@/lib/api';
import {
  Booking, CreateBookingData,
  HotelBooking, HotelBookingFormData,
  FlightBooking, FlightBookingFormData,
  TransportBooking, TransportBookingFormData,
  BookingTask, BookingTraveller, BookingDay, BookingPayment, BookingLog,
  WhatsAppMessageType, PaymentsResponse, BookingVendorOption,
} from '@/types/booking';
import { PaginatedResponse, ApiResponse } from '@/types';

export const bookingsService = {
  // ─── Booking CRUD ───────────────────────────
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get<PaginatedResponse<Booking>>('/bookings', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },
  create: async (data: CreateBookingData) => {
    const res = await api.post<ApiResponse<Booking>>('/bookings', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<CreateBookingData>) => {
    const res = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
    return res.data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
    return res.data.data;
  },
  delete: async (id: string) => { await api.delete(`/bookings/${id}`); },
  convertFromItinerary: async (itineraryId: string) => {
    const res = await api.post<ApiResponse<Booking>>('/bookings/convert-itinerary', { itineraryId });
    return res.data.data;
  },

  // ─── Vendor dropdown (per service type) ─────
  // type: 'HOTEL' | 'AIRLINE' | 'TRANSPORT' | etc.
  // Backend: GET /bookings/vendors?type=HOTEL
  getVendorsByType: async (type: string): Promise<BookingVendorOption[]> => {
    const res = await api.get<ApiResponse<BookingVendorOption[]>>('/bookings/vendors', {
      params: { type },
    });
    return res.data.data ?? [];
  },

  // ─── Hotels ─────────────────────────────────
  addHotel: async (bookingId: string, data: HotelBookingFormData) => {
    const res = await api.post<ApiResponse<HotelBooking>>(`/bookings/${bookingId}/hotels`, data);
    return res.data.data;
  },
  updateHotel: async (bookingId: string, hotelId: string, data: Partial<HotelBookingFormData>) => {
    const res = await api.put<ApiResponse<HotelBooking>>(`/bookings/${bookingId}/hotels/${hotelId}`, data);
    return res.data.data;
  },
  deleteHotel: async (bookingId: string, hotelId: string) => {
    await api.delete(`/bookings/${bookingId}/hotels/${hotelId}`);
  },

  // ─── Flights ────────────────────────────────
  addFlight: async (bookingId: string, data: FlightBookingFormData) => {
    const res = await api.post<ApiResponse<FlightBooking>>(`/bookings/${bookingId}/flights`, data);
    return res.data.data;
  },
  updateFlight: async (bookingId: string, flightId: string, data: Partial<FlightBookingFormData>) => {
    const res = await api.put<ApiResponse<FlightBooking>>(`/bookings/${bookingId}/flights/${flightId}`, data);
    return res.data.data;
  },
  deleteFlight: async (bookingId: string, flightId: string) => {
    await api.delete(`/bookings/${bookingId}/flights/${flightId}`);
  },

  // ─── Transport ──────────────────────────────
  addTransport: async (bookingId: string, data: TransportBookingFormData) => {
    const res = await api.post<ApiResponse<TransportBooking>>(`/bookings/${bookingId}/transports`, data);
    return res.data.data;
  },
  updateTransport: async (bookingId: string, transportId: string, data: Partial<TransportBookingFormData>) => {
    const res = await api.put<ApiResponse<TransportBooking>>(`/bookings/${bookingId}/transports/${transportId}`, data);
    return res.data.data;
  },
  deleteTransport: async (bookingId: string, transportId: string) => {
    await api.delete(`/bookings/${bookingId}/transports/${transportId}`);
  },

  // ─── Tasks ──────────────────────────────────
  getTasks: async (bookingId: string) => {
    const res = await api.get<ApiResponse<BookingTask[]>>(`/bookings/${bookingId}/tasks`);
    return res.data.data;
  },
  addTask: async (bookingId: string, title: string) => {
    const res = await api.post<ApiResponse<BookingTask>>(`/bookings/${bookingId}/tasks`, { title });
    return res.data.data;
  },
  toggleTask: async (bookingId: string, taskId: string) => {
    const res = await api.patch<ApiResponse<BookingTask>>(`/bookings/${bookingId}/tasks/${taskId}/toggle`);
    return res.data.data;
  },
  deleteTask: async (bookingId: string, taskId: string) => {
    await api.delete(`/bookings/${bookingId}/tasks/${taskId}`);
  },

  // ─── Travellers ─────────────────────────────
  addTraveller: async (bookingId: string, data: { name: string; age?: number; gender?: string; idProof?: string }) => {
    const res = await api.post<ApiResponse<BookingTraveller>>(`/bookings/${bookingId}/travellers`, data);
    return res.data.data;
  },
  updateTraveller: async (bookingId: string, travellerId: string, data: Partial<BookingTraveller>) => {
    const res = await api.put<ApiResponse<BookingTraveller>>(`/bookings/${bookingId}/travellers/${travellerId}`, data);
    return res.data.data;
  },
  deleteTraveller: async (bookingId: string, travellerId: string) => {
    await api.delete(`/bookings/${bookingId}/travellers/${travellerId}`);
  },

  // ─── Days ───────────────────────────────────
  generateDays: async (bookingId: string) => {
    const res = await api.post<ApiResponse<BookingDay[]>>(`/bookings/${bookingId}/days/generate`);
    return res.data.data;
  },
  addDay: async (bookingId: string, data: { dayNumber: number; title: string; description?: string; date?: string }) => {
    const res = await api.post<ApiResponse<BookingDay>>(`/bookings/${bookingId}/days`, data);
    return res.data.data;
  },
  updateDay: async (bookingId: string, dayId: string, data: Partial<BookingDay>) => {
    const res = await api.patch<ApiResponse<BookingDay>>(`/bookings/${bookingId}/days/${dayId}`, data);
    return res.data.data;
  },
  deleteDay: async (bookingId: string, dayId: string) => {
    await api.delete(`/bookings/${bookingId}/days/${dayId}`);
  },

  // ─── Payments ───────────────────────────────
  getPayments: async (bookingId: string): Promise<PaymentsResponse> => {
    const res = await api.get<ApiResponse<PaymentsResponse>>(`/bookings/${bookingId}/payments`);
    return res.data.data;
  },
  addPayment: async (bookingId: string, data: { amount: number; mode: string; note?: string; paidAt?: string }) => {
    const res = await api.post<ApiResponse<BookingPayment>>(`/bookings/${bookingId}/payments`, data);
    return res.data.data;
  },
  deletePayment: async (bookingId: string, paymentId: string) => {
    await api.delete(`/bookings/${bookingId}/payments/${paymentId}`);
  },

  // ─── Logs ───────────────────────────────────
  getLogs: async (bookingId: string) => {
    const res = await api.get<ApiResponse<BookingLog[]>>(`/bookings/${bookingId}/logs`);
    return res.data.data;
  },
  addLog: async (bookingId: string, message: string) => {
    const res = await api.post<ApiResponse<BookingLog>>(`/bookings/${bookingId}/logs`, { message });
    return res.data.data;
  },

  // ─── WhatsApp ────────────────────────────────
  getWhatsappMessage: async (bookingId: string, type: string) => {
    const res = await api.get<ApiResponse<WhatsAppMessageType>>(`/bookings/${bookingId}/whatsapp`, { params: { type } });
    return res.data.data;
  },

  // ─── PDF ────────────────────────────────────
  downloadVoucher: async (bookingId: string) => {
    const res = await api.get(`/bookings/${bookingId}/voucher`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-voucher-${bookingId.slice(-8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // ─── Email ───────────────────────────────────
  sendEmail: async (bookingId: string, data?: { to?: string; subject?: string; body?: string }) => {
    const res = await api.post<ApiResponse<{ success: boolean; sentTo: string }>>(`/bookings/${bookingId}/send-email`, data ?? {});
    return res.data.data;
  },
};