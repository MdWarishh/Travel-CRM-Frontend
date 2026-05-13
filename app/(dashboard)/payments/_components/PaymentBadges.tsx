import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PaymentStatus, PaymentMode } from '@/types/payment';

interface StatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

interface ModeBadgeProps {
  mode: PaymentMode;
  className?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PAID: {
    label: 'Paid',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  },
  PARTIALLY_PAID: {
    label: 'Partial',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  },
  UNPAID: {
    label: 'Unpaid',
    className: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  },
};

const MODE_CONFIG: Record<PaymentMode, { label: string; className: string }> = {
  CASH: { label: 'Cash', className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  UPI: { label: 'UPI', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400' },
  BANK_TRANSFER: { label: 'Bank', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' },
  CHEQUE: { label: 'Cheque', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400' },
  CARD: { label: 'Card', className: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn('text-[11px] font-medium px-2 py-0.5', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export function ModeBadge({ mode, className }: ModeBadgeProps) {
  const config = MODE_CONFIG[mode];
  return (
    <Badge
      variant="outline"
      className={cn('text-[11px] font-medium px-2 py-0.5', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}