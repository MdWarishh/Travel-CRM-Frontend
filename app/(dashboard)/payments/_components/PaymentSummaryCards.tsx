'use client';

import { ArrowDownLeft, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';
import { UnifiedPaymentSummary } from '@/types/payment';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  summary: UnifiedPaymentSummary | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'totalIncoming' as const,
    label: 'Total Incoming',
    icon: ArrowDownLeft,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
  },
  {
    key: 'totalOutgoing' as const,
    label: 'Total Outgoing',
    icon: ArrowUpRight,
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-100 dark:border-rose-900/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60',
  },
  {
    key: 'netProfit' as const,
    label: 'Net Profit',
    icon: TrendingUp,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-100 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/60',
  },
  {
    key: 'totalPending' as const,
    label: 'Pending Payments',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-100 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
  },
];

export default function PaymentSummaryCards({ summary, isLoading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg, border, iconBg }) => {
        const value = summary?.[key] ?? 0;
        const isNegative = key === 'netProfit' && value < 0;

        return (
          <div
            key={key}
            className={cn(
              'relative rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
              bg,
              border,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  {label}
                </p>
                {isLoading ? (
                  <div className="h-7 w-28 rounded-md bg-muted/60 animate-pulse" />
                ) : (
                  <p
                    className={cn(
                      'text-xl font-bold tracking-tight tabular-nums',
                      isNegative ? 'text-rose-600' : color,
                    )}
                  >
                    {formatCurrency(Math.abs(value))}
                    {isNegative && <span className="text-sm ml-0.5 font-normal">loss</span>}
                  </p>
                )}
              </div>
              <div className={cn('rounded-lg p-2 shrink-0', iconBg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
            </div>

            {/* source breakdown — only on incoming card */}
            {key === 'totalIncoming' && summary?.bySource && !isLoading && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {summary.bySource
                  .filter((s) => s.total > 0)
                  .map((s) => (
                    <span
                      key={s.source}
                      className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-black/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                    >
                      {s.source}
                      <span className="font-semibold">{s.count}</span>
                    </span>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}