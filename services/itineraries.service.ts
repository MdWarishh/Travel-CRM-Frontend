import api from '@/lib/api';
import axios from 'axios';
import {
  Itinerary,
  PaginatedResponse,
  ApiResponse,
  CreateItineraryPayload,
  UpdateItineraryPayload,
  DayPayload,
  GeneratePdfPayload,
  ItineraryFilterParams,
  ItineraryDay,
} from '@/types/itinerary.types';

// ─────────────────────────────────────────────
// RAW AXIOS FOR BLOB
// Main `api` instance has JSON interceptors that
// corrupt blob responses — use a clean instance.
// Inherits baseURL + auth from main instance.
// ─────────────────────────────────────────────
const getRawAxios = () => {
  // Inherit baseURL directly from main api instance
  const baseURL = (api.defaults.baseURL as string) || 'http://localhost:5000/api/v1';

  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000, // longer timeout — Puppeteer PDF gen can take 15-30s
  });

  // Read token using the same key as lib/api.ts → 'crm_token'
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('crm_token');
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  return instance;
};

export const itinerariesService = {
  // ── List ──────────────────────────────────
  getAll: async (params?: ItineraryFilterParams) => {
    const res = await api.get<PaginatedResponse<Itinerary>>('/itineraries', { params });
    return res.data;
  },

  // ── Single ────────────────────────────────
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Itinerary>>(`/itineraries/${id}`);
    return res.data.data;
  },

  // ── Create ────────────────────────────────
  create: async (data: CreateItineraryPayload) => {
    const res = await api.post<ApiResponse<Itinerary>>('/itineraries', data);
    return res.data.data;
  },

  // ── Update ────────────────────────────────
  update: async (id: string, data: UpdateItineraryPayload) => {
    const res = await api.put<ApiResponse<Itinerary>>(`/itineraries/${id}`, data);
    return res.data.data;
  },

  // ── Delete ────────────────────────────────
  delete: async (id: string) => {
    await api.delete(`/itineraries/${id}`);
  },

  // ── Status ────────────────────────────────
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Itinerary>>(`/itineraries/${id}/status`, { status });
    return res.data.data;
  },

  // ── Duplicate ─────────────────────────────
  duplicate: async (id: string, customerId?: string) => {
    const res = await api.post<ApiResponse<Itinerary>>(`/itineraries/${id}/duplicate`, {
      customerId,
    });
    return res.data.data;
  },

  // ── Day management ────────────────────────
  upsertDay: async (id: string, data: DayPayload) => {
    const res = await api.put<ApiResponse<ItineraryDay>>(`/itineraries/${id}/days`, data);
    return res.data.data;
  },

  deleteDay: async (id: string, dayId: string) => {
    await api.delete(`/itineraries/${id}/days/${dayId}`);
  },

  // ── PDF generation ────────────────────────
  // Uses native fetch() — axios interceptors corrupt binary blobs
  generatePdf: async (
    id: string,
    payload: GeneratePdfPayload = {},
    signal?: AbortSignal
  ): Promise<Blob> => {
    // Clean payload — remove empty/null so backend Zod validation passes
    const cleanPayload: Record<string, unknown> = {};
    if (payload.customerName?.trim()) cleanPayload.customerName = payload.customerName.trim();
    if (payload.leadId?.trim()) cleanPayload.leadId = payload.leadId.trim();
    if (payload.travelDate) cleanPayload.travelDate = new Date(payload.travelDate).toISOString();
    if (payload.numberOfTravelers && Number(payload.numberOfTravelers) > 0) {
      cleanPayload.numberOfTravelers = Number(payload.numberOfTravelers);
    }

    // Full backend URL — inherit from main api instance
    const baseURL = (api.defaults.baseURL as string)
      || process.env.NEXT_PUBLIC_API_URL
      || 'http://localhost:5000/api/v1';

    const endpoint = `${baseURL.replace(/\/$/, '')}/itineraries/${id}/pdf`;

    // Auth token — same key as lib/api.ts
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('crm_token')
      : null;

    // ✅ Native fetch — NO axios interceptors, blob stays 100% binary-clean
    const res = await fetch(endpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cleanPayload),
    });

    if (!res.ok) {
      let msg = `PDF generation failed (${res.status})`;
      try {
        const clone = res.clone();
        const json = await clone.json();
        msg = json.message || json.error || msg;
      } catch {}
      throw new Error(msg);
    }

    return res.blob();
  },

  // Helper: trigger browser file-save dialog
  downloadPdf: async (
    id: string,
    filename: string,
    payload: GeneratePdfPayload = {},
    signal?: AbortSignal
  ) => {
    const blob = await itinerariesService.generatePdf(id, payload, signal);

    if (blob.size === 0) throw new Error('Received empty PDF from server');

    const objectUrl = URL.createObjectURL(
      new Blob([blob], { type: 'application/pdf' })
    );
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  },
};