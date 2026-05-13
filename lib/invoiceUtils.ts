// lib/invoiceUtils.ts

import { GstInvoice, GstInvoiceItem, InvoiceStatus, GstType, InvoiceItemInput } from '@/types/invoice';

// ─────────────────────────────────────────────
// FORMATTING
// ─────────────────────────────────────────────

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

// ─────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  DRAFT:     { label: 'Draft',     color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200', dot: 'bg-slate-400'   },
  SENT:      { label: 'Sent',      color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-200',  dot: 'bg-blue-500'    },
  PAID:      { label: 'Paid',      color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  PARTIAL:   { label: 'Partial',   color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200', dot: 'bg-amber-500'   },
  UNPAID:    { label: 'Unpaid',    color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',   dot: 'bg-red-500'     },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500',    bg: 'bg-gray-100',    border: 'border-gray-200',  dot: 'bg-gray-400'    },
};

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI',
  CHEQUE: 'Cheque',
  CARD: 'Card',
};

export const GST_TYPE_LABELS: Record<GstType, string> = {
  CGST_SGST: 'CGST + SGST (Same State)',
  IGST: 'IGST (Inter State)',
  NONE: 'No GST',
};

// ─────────────────────────────────────────────
// CALCULATIONS (client-side preview)
// ─────────────────────────────────────────────

interface CalcInput {
  items: InvoiceItemInput[];
  discountType?: 'PERCENT' | 'FLAT' | null;
  discountValue?: number;
  gstRate: number;
  gstType: GstType;
}

export interface CalcResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
}

export const calculateTotals = (input: CalcInput): CalcResult => {
  const subtotal = input.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);

  let discountAmount = 0;
  if (input.discountType === 'PERCENT' && (input.discountValue ?? 0) > 0) {
    discountAmount = (subtotal * (input.discountValue ?? 0)) / 100;
  } else if (input.discountType === 'FLAT' && (input.discountValue ?? 0) > 0) {
    discountAmount = input.discountValue ?? 0;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  let cgstRate = 0, sgstRate = 0, igstRate = 0;
  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

  if (input.gstType === 'CGST_SGST') {
    cgstRate = input.gstRate / 2;
    sgstRate = input.gstRate / 2;
    cgstAmount = parseFloat(((taxableAmount * cgstRate) / 100).toFixed(2));
    sgstAmount = parseFloat(((taxableAmount * sgstRate) / 100).toFixed(2));
  } else if (input.gstType === 'IGST') {
    igstRate = input.gstRate;
    igstAmount = parseFloat(((taxableAmount * igstRate) / 100).toFixed(2));
  }

  const totalGst = parseFloat((cgstAmount + sgstAmount + igstAmount).toFixed(2));
  const totalAmount = parseFloat((taxableAmount + totalGst).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    cgstRate, sgstRate, igstRate,
    cgstAmount, sgstAmount, igstAmount,
    totalGst, totalAmount,
  };
};

// ─────────────────────────────────────────────
// PDF HELPERS
// ─────────────────────────────────────────────

export const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = 'Rupees ' + convert(rupees);
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' Only';
};

export const getPaymentProgress = (invoice: GstInvoice): number => {
  if (invoice.totalAmount === 0) return 0;
  return Math.min(100, (invoice.paidAmount / invoice.totalAmount) * 100);
};