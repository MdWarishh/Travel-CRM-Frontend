// ══════════════════════════════════════════════════════════════════════
// lib/format.ts — Formatting utilities
// ══════════════════════════════════════════════════════════════════════

/**
 * Format number as Indian currency (₹)
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string → "12 Jun 2025"
 */
export function formatDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format ISO date string → "12 Jun 2025, 3:45 PM"
 */
export function formatDateTime(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Relative time → "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date?: string | null): string {
  if (!date) return '—';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Get initials from full name → "Rahul Sharma" → "RS"
 */
export function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Truncate text to given length with ellipsis
 */
export function truncate(text: string, length = 60): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

/**
 * Resolve template variables: {{name}} → "Rahul"
 */
export function resolveTemplate(
  text: string,
  variables: Record<string, string> = {}
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}