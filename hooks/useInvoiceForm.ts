// app/invoice/_hooks/useInvoiceForm.ts

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  GstInvoice,
  GstType,
  DiscountType,
  InvoiceItemInput,
  CreateInvoicePayload,
  BookingOption,
  VendorOption,
} from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import { bookingsService } from '@/services/bookings.service';
import { calculateTotals } from '@/lib/invoiceUtils';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BillingInfo {
  customerId?: string;
  billingName: string;
  billingPhone?: string;
  billingEmail?: string;
  billingAddress?: string;
  billingState?: string;
  customerGstin?: string;
}

export interface BookingPaymentSummary {
  totalCost: number;
  totalPaid: number;
  remaining: number;
}

const DEFAULT_ITEM: InvoiceItemInput = {
  description: '',
  hsn: '',
  quantity: 1,
  unit: 'Nos',
  price: 0,
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useInvoiceForm(existing?: GstInvoice) {
  const router = useRouter();

  // ── Billing ──────────────────────────────────
  const [billing, setBillingState] = useState<BillingInfo>({
    customerId: existing?.customerId ?? undefined,
    billingName: existing?.billingName ?? '',
    billingPhone: existing?.billingPhone ?? '',
    billingEmail: existing?.billingEmail ?? '',
    billingAddress: existing?.billingAddress ?? '',
    billingState: existing?.billingState ?? '',
    customerGstin: existing?.customerGstin ?? '',
  });

  // ── Booking & Vendor links ─────────────────
  const [bookingId, setBookingId] = useState<string | null>(
    existing?.bookingId ?? null
  );
  const [vendorId, setVendorId] = useState<string | null>(
    existing?.vendorId ?? null
  );

  // ── Customer bookings list (cached after customer select) ──
  const [customerBookings, setCustomerBookings] = useState<BookingOption[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // ── Selected booking payment summary ──────
  const [bookingPaymentSummary, setBookingPaymentSummary] =
    useState<BookingPaymentSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ── Vendor search ─────────────────────────
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [vendorSearchLoading, setVendorSearchLoading] = useState(false);

  // ── Dates ────────────────────────────────
  const [issueDate, setIssueDate] = useState(
    existing?.issueDate
      ? new Date(existing.issueDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    existing?.dueDate
      ? new Date(existing.dueDate).toISOString().split('T')[0]
      : ''
  );

  // ── Items ────────────────────────────────
  const [items, setItems] = useState<InvoiceItemInput[]>(
    existing?.items?.length
      ? existing.items.map((i) => ({
          description: i.description,
          hsn: i.hsn ?? '',
          quantity: i.quantity,
          unit: i.unit ?? 'Nos',
          price: i.price,
        }))
      : [{ ...DEFAULT_ITEM }]
  );

  // ── GST & Discount ───────────────────────
  const [gstRate, setGstRate] = useState(existing?.gstRate ?? 18);
  const [gstType, setGstType] = useState<GstType>(existing?.gstType ?? 'CGST_SGST');
  const [discountType, setDiscountType] = useState<DiscountType | null>(
    existing?.discountType ?? null
  );
  const [discountValue, setDiscountValue] = useState(existing?.discountValue ?? 0);

  // ── Notes ───────────────────────────────
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [terms, setTerms] = useState(existing?.terms ?? '');

  // ── Submission ──────────────────────────
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Live totals ─────────────────────────
  const totals = calculateTotals({ items, discountType, discountValue, gstRate, gstType });

  // ─────────────────────────────────────────────
  // When customer changes → fetch their bookings
  // ─────────────────────────────────────────────

  const setBilling = useCallback(
    (info: BillingInfo) => {
      setBillingState(info);
      // If customer changed, reset booking and re-fetch
      if (info.customerId !== billing.customerId) {
        setBookingId(null);
        setBookingPaymentSummary(null);
        setCustomerBookings([]);
        if (info.customerId) {
          fetchCustomerBookings(info.customerId);
        }
      }
    },
    [billing.customerId]
  );

  const fetchCustomerBookings = async (customerId: string) => {
    setBookingsLoading(true);
    try {
      const data = await invoiceService.searchBookings(customerId);
      setCustomerBookings(data);
    } catch {
      setCustomerBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // On edit load — if existing has customerId, pre-fetch bookings
  useEffect(() => {
    if (existing?.customerId) {
      fetchCustomerBookings(existing.customerId);
    }
  }, []);

  // ─────────────────────────────────────────────
  // When booking changes → fetch payment summary
  // ─────────────────────────────────────────────

 const handleBookingSelect = useCallback(async (id: string | null) => {
  setBookingId(id);
  setBookingPaymentSummary(null);
  if (!id) {
    // Booking clear hone par items reset karo
    setItems([{ description: '', hsn: '', quantity: 1, unit: 'Nos', price: 0 }]);
    return;
  }

  setSummaryLoading(true);
  try {
    // Payment summary fetch (already tha)
    const paymentsData = await bookingsService.getPayments(id);
    const s = paymentsData.summary;
    setBookingPaymentSummary({
      totalCost: s.totalAmount ?? 0,
      totalPaid: s.totalPaid ?? 0,
      remaining: s.dueAmount ?? 0,
    });

    // ── NEW: Booking detail fetch karke items auto-fill karo ──
    const booking = await bookingsService.getById(id);

    const autoItems: InvoiceItemInput[] = [];

    // Main booking amount
    if (booking.totalAmount) {
      autoItems.push({
        description: `Travel Package${booking.travelStart ? ` (${new Date(booking.travelStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })} → ${new Date(booking.travelEnd!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })})` : ''}`,
        hsn: '998551', // Tour operator HSN
        quantity: 1,
        unit: 'Trip',
        price: booking.totalAmount,
      });
    }

    // Already paid — deduct as advance
    if (s.totalPaid > 0) {
      autoItems.push({
        description: 'Less: Advance Paid',
        hsn: '',
        quantity: 1,
        unit: 'Nos',
        price: -(s.totalPaid), // negative = deduction
      });
    }

    setItems(autoItems.length > 0 ? autoItems : [{ description: '', hsn: '', quantity: 1, unit: 'Nos', price: 0 }]);

  } catch {
    toast.error('Could not fetch booking details');
  } finally {
    setSummaryLoading(false);
  }
}, []);

  // ─────────────────────────────────────────────
  // Vendor search (debounced)
  // ─────────────────────────────────────────────

  const searchVendors = useCallback(async (query: string) => {
    if (!query.trim()) {
      setVendorOptions([]);
      return;
    }
    setVendorSearchLoading(true);
    try {
      const data = await invoiceService.searchVendors(query);
      setVendorOptions(data);
    } catch {
      setVendorOptions([]);
    } finally {
      setVendorSearchLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!billing.billingName.trim()) errs.billingName = 'Client name is required';
    if (items.some((it) => !it.description.trim()))
      errs.items = 'All items need a description';
    if (items.some((it) => it.price < 0)) errs.items = 'Price cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────────
  // Build payload
  // ─────────────────────────────────────────────

  const buildPayload = (): CreateInvoicePayload => ({
    customerId: billing.customerId || undefined,
    bookingId: bookingId || undefined,
    vendorId: vendorId || undefined,
    billingName: billing.billingName,
    billingPhone: billing.billingPhone || undefined,
    billingEmail: billing.billingEmail || undefined,
    billingAddress: billing.billingAddress || undefined,
    billingState: billing.billingState || undefined,
    customerGstin: billing.customerGstin || undefined,
    issueDate: issueDate ? new Date(issueDate).toISOString() : undefined,
    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    items,
    discountType: discountType ?? undefined,
    discountValue: discountValue || undefined,
    gstRate,
    gstType,
    notes: notes || undefined,
    terms: terms || undefined,
  });

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await invoiceService.update(existing.id, buildPayload());
        toast.success('Invoice updated successfully');
        router.push(`/invoice/${existing.id}`);
      } else {
        const created = await invoiceService.create(buildPayload());
        toast.success(`Invoice ${created.invoiceNumber} created`);
        // Payment sync happens server-side on recordPayment;
        // redirect to invoice detail for payment recording
        router.push(`/invoice/${created.id}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return {
    // Billing
    billing,
    setBilling,

    // Booking
    bookingId,
    setBookingId: handleBookingSelect,
    customerBookings,
    bookingsLoading,
    bookingPaymentSummary,
    summaryLoading,

    // Vendor
    vendorId,
    setVendorId,
    vendorOptions,
    vendorSearchLoading,
    searchVendors,

    // Dates
    issueDate,
    setIssueDate,
    dueDate,
    setDueDate,

    // Items
    items,
    setItems,

    // GST
    gstRate,
    setGstRate,
    gstType,
    setGstType,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,

    // Notes
    notes,
    setNotes,
    terms,
    setTerms,

    // Meta
    totals,
    saving,
    errors,
    handleSubmit,
  };
}