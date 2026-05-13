// ─── Status configs ───────────────────────────────────────────────────────────

export const DEAL_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
  },
  CONNECTED: {
    label: 'Connected',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800',
  },
} as const;

export const DEAL_PAYMENT_STATUS_CONFIG = {
  PENDING: {
    label: 'Unpaid',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  PARTIAL: {
    label: 'Partial',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  RECEIVED: {
    label: 'Received',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
} as const;

export const BUYER_PAYMENT_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  PARTIAL: {
    label: 'Partial',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  PAID: {
    label: 'Paid',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
} as const;

export const TICKET_CLASS_CONFIG = {
  ECONOMY: {
    label: 'Economy',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    emoji: '🪑',
  },
  BUSINESS: {
    label: 'Business',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    emoji: '💼',
  },
  FIRST: {
    label: 'First Class',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    emoji: '⭐',
  },
} as const;

export const SOURCE_CHANNEL_CONFIG = {
  EMAIL: { label: 'Email', emoji: '📧' },
  WHATSAPP: { label: 'WhatsApp', emoji: '💬' },
  PHONE: { label: 'Phone', emoji: '📞' },
  WALK_IN: { label: 'Walk-In', emoji: '🚶' },
  ONLINE: { label: 'Online', emoji: '🌐' },
} as const;

export const PAYMENT_METHOD_CONFIG = {
  CASH: { label: 'Cash', emoji: '💵' },
  BANK_TRANSFER: { label: 'Bank Transfer', emoji: '🏦' },
  UPI: { label: 'UPI', emoji: '📱' },
  CARD: { label: 'Card', emoji: '💳' },
} as const;

// ─── Shared option arrays (for Select dropdowns) ──────────────────────────────

export const DEAL_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONNECTED', label: 'Connected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
] as const;

export const DEAL_PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Unpaid' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'RECEIVED', label: 'Received' },
] as const;

export const BUYER_PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
] as const;

export const TICKET_CLASS_OPTIONS = [
  { value: 'ECONOMY', label: '🪑 Economy' },
  { value: 'BUSINESS', label: '💼 Business' },
  { value: 'FIRST', label: '⭐ First Class' },
] as const;

export const SOURCE_CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: '📧 Email' },
  { value: 'WHATSAPP', label: '💬 WhatsApp' },
  { value: 'PHONE', label: '📞 Phone' },
  { value: 'WALK_IN', label: '🚶 Walk-In' },
  { value: 'ONLINE', label: '🌐 Online' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: '💵 Cash' },
  { value: 'UPI', label: '📱 UPI' },
  { value: 'BANK_TRANSFER', label: '🏦 Bank Transfer' },
  { value: 'CARD', label: '💳 Card' },
] as const;