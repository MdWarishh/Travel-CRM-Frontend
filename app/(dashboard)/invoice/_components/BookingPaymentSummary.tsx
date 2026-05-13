// app/invoice/_components/BookingPaymentSummary.tsx

'use client';

import { BookingPaymentSummary as Summary } from '@/hooks/useInvoiceForm';
import { formatCurrency } from '@/lib/invoiceUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  summary: Summary | null;
  loading?: boolean;
}

export function BookingPaymentSummary({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const paidPct = summary.totalCost > 0
    ? Math.min(100, Math.round((summary.totalPaid / summary.totalCost) * 100))
    : 0;

  const isFullyPaid = summary.remaining <= 0;
  const isPartial = summary.totalPaid > 0 && summary.remaining > 0;

  return (
    <div className="rounded-xl border bg-gradient-to-br from-violet-50/60 to-slate-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <IndianRupee className="h-4 w-4 text-violet-600" />
          Booking Payment Summary
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border',
            isFullyPaid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isPartial
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          )}
        >
          {isFullyPaid ? 'Fully Paid' : isPartial ? 'Partial' : 'Unpaid'}
        </span>
      </div>

      {/* Three stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Cost */}
        <div className="rounded-lg bg-white border px-3 py-2.5 space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Total Cost
          </p>
          <p className="text-sm font-bold font-mono text-slate-800">
            {formatCurrency(summary.totalCost)}
          </p>
        </div>

        {/* Paid */}
        <div className="rounded-lg bg-white border px-3 py-2.5 space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Paid
          </p>
          <p className="text-sm font-bold font-mono text-emerald-600">
            {formatCurrency(summary.totalPaid)}
          </p>
        </div>

        {/* Remaining */}
        <div className="rounded-lg bg-white border px-3 py-2.5 space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-rose-500" />
            Remaining
          </p>
          <p
            className={cn(
              'text-sm font-bold font-mono',
              isFullyPaid ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {formatCurrency(Math.max(0, summary.remaining))}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isFullyPaid ? 'bg-emerald-500' : 'bg-violet-500'
            )}
            style={{ width: `${paidPct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {paidPct}% paid
        </p>
      </div>

      {/* Auto-filled hint */}
      <p className="text-[11px] text-violet-600 flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
        Auto-fetched from booking — invoice will be linked automatically
      </p>
    </div>
  );
}