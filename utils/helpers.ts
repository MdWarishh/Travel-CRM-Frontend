import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short') {
  if (!date) return '—';
  const d = new Date(date);

  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | Date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, length = 50) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

// Status color maps
export const leadStatusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-purple-100 text-purple-700',
  FOLLOW_UP_PENDING: 'bg-yellow-100 text-yellow-700',
  QUALIFIED: 'bg-indigo-100 text-indigo-700',
  QUOTED: 'bg-orange-100 text-orange-700',
  NEGOTIATION: 'bg-pink-100 text-pink-700',
  CONVERTED: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
};

export const priorityColors: Record<string, string> = {
  HOT: 'bg-red-100 text-red-700',
  WARM: 'bg-orange-100 text-orange-700',
  COLD: 'bg-blue-100 text-blue-700',
};

export const bookingStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REQUESTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
};

export const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

export const itineraryStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  FINALIZED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-700',
};

export const sourceLabels: Record<string, string> = {
  WEBSITE: 'Website',
  MANUAL: 'Manual Entry',
  WHATSAPP: 'WhatsApp',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  MESSENGER: 'Messenger',
  PHONE: 'Phone Call',
  OTHER: 'Other',
};

export const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  AGENT: 'bg-green-100 text-green-700',
  VENDOR: 'bg-orange-100 text-orange-700',
};