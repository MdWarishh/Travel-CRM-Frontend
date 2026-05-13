import { cn } from '@/lib/utils';

type Status =
  | 'UPCOMING' | 'ONGOING' | 'COMPLETED'           // TripStatus
  | 'DRAFT' | 'PENDING' | 'REQUESTED' | 'CONFIRMED' // BookingStatus
  | 'VOUCHER_SENT' | 'READY' | 'IN_PROGRESS' | 'CANCELLED'
  | 'PAID' | 'PARTIAL' | 'UNPAID' | 'PARTIALLY_PAID' | 'REFUNDED'; // PaymentStatus

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // Trip status
  UPCOMING:        { label: 'Upcoming',     className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ONGOING:         { label: 'Ongoing',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED:       { label: 'Completed',    className: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Booking status
  DRAFT:           { label: 'Draft',        className: 'bg-slate-100 text-slate-500 border-slate-200' },
  PENDING:         { label: 'Pending',      className: 'bg-amber-50 text-amber-700 border-amber-200' },
  REQUESTED:       { label: 'Requested',    className: 'bg-orange-50 text-orange-700 border-orange-200' },
  CONFIRMED:       { label: 'Confirmed',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  VOUCHER_SENT:    { label: 'Voucher Sent', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  READY:           { label: 'Ready',        className: 'bg-teal-50 text-teal-700 border-teal-200' },
  IN_PROGRESS:     { label: 'In Progress',  className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CANCELLED:       { label: 'Cancelled',    className: 'bg-red-50 text-red-600 border-red-200' },

  // Payment status
  PAID:            { label: 'Paid',         className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PARTIAL:         { label: 'Partial',      className: 'bg-blue-50 text-blue-700 border-blue-200' },
  PARTIALLY_PAID:  { label: 'Partial',      className: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNPAID:          { label: 'Unpaid',       className: 'bg-red-50 text-red-600 border-red-200' },
  REFUNDED:        { label: 'Refunded',     className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

interface Props {
  status: string;
  className?: string;
}

export function BookingStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}