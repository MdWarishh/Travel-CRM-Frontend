// app/(dashboard)/vendors/_components/vendor.constants.ts

import { VendorServiceType, VendorStatus } from '@/types/vendors';

export const VENDOR_TYPE_OPTIONS: {
  value: VendorServiceType;
  label: string;
  emoji: string;
}[] = [
  { value: 'HOTEL',         label: 'Hotel',         emoji: '🏨' },
  { value: 'TRANSPORT',     label: 'Transport',     emoji: '🚗' },
  { value: 'TOUR_OPERATOR', label: 'Tour Operator', emoji: '🗺️' },
  { value: 'VISA',          label: 'Visa',          emoji: '📋' },
  { value: 'GUIDE',         label: 'Guide',         emoji: '👤' },
  { value: 'AIRLINE',       label: 'Airline',       emoji: '✈️' },
  { value: 'ACTIVITY',      label: 'Activity',      emoji: '🎯' },
  { value: 'OTHER',         label: 'Other',         emoji: '📦' },
];

export const VENDOR_TYPE_COLORS: Record<VendorServiceType, string> = {
  HOTEL:         'bg-violet-100 text-violet-700 border-violet-200',
  TRANSPORT:     'bg-blue-100 text-blue-700 border-blue-200',
  TOUR_OPERATOR: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  VISA:          'bg-amber-100 text-amber-700 border-amber-200',
  GUIDE:         'bg-pink-100 text-pink-700 border-pink-200',
  AIRLINE:       'bg-sky-100 text-sky-700 border-sky-200',
  ACTIVITY:      'bg-orange-100 text-orange-700 border-orange-200',
  OTHER:         'bg-slate-100 text-slate-600 border-slate-200',
};

export const VENDOR_STATUS_CONFIG: Record<
  VendorStatus,
  { label: string; className: string; dot: string; badgeBg: string }
> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
    badgeBg: 'bg-slate-400',
  },
  BLACKLISTED: {
    label: 'Blacklisted',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    badgeBg: 'bg-red-500',
  },
};

export const BOOKING_STATUS_COLOR: Record<string, string> = {
  CONFIRMED:    'bg-emerald-100 text-emerald-700',
  PENDING:      'bg-amber-100 text-amber-700',
  COMPLETED:    'bg-slate-100 text-slate-600',
  CANCELLED:    'bg-red-100 text-red-600',
  IN_PROGRESS:  'bg-blue-100 text-blue-700',
  DRAFT:        'bg-slate-100 text-slate-500',
  REQUESTED:    'bg-indigo-100 text-indigo-700',
  VOUCHER_SENT: 'bg-purple-100 text-purple-700',
  READY:        'bg-teal-100 text-teal-700',
};

export const SORT_OPTIONS = [
  { value: 'name',      label: 'Name A–Z' },
  { value: 'usage',     label: 'Most Used' },
  { value: 'revenue',   label: 'Top Revenue' },
  { value: 'createdAt', label: 'Newest First' },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (date?: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date?: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTypeLabel = (type: VendorServiceType) =>
  VENDOR_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

export const getTypeEmoji = (type: VendorServiceType) =>
  VENDOR_TYPE_OPTIONS.find((o) => o.value === type)?.emoji ?? '📦';