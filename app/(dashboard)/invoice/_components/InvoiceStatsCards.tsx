// app/invoice/_components/InvoiceStatsCards.tsx

'use client';

import { InvoiceStats } from '@/types/invoice';
import { formatCurrency } from '@/lib/invoiceUtils';
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  stats: InvoiceStats;
  overdueCount?: number;
}

export function InvoiceStatsCards({ stats, overdueCount = 0 }: Props) {
  const collectionRate = stats.totalRevenue > 0
    ? Math.round((stats.totalPaid / stats.totalRevenue) * 100)
    : 0;

  const cards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      sub: `${stats.totalInvoices} invoice${stats.totalInvoices !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
    },
    {
      label: 'Amount Collected',
      value: formatCurrency(stats.totalPaid),
      sub: `${collectionRate}% collection rate`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(stats.totalDue),
      sub: `${overdueCount} overdue`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Unpaid Invoices',
      value: String(
        (stats.breakdown.find(b => b.status === 'UNPAID')?._count.id ?? 0) +
        (stats.breakdown.find(b => b.status === 'PARTIAL')?._count.id ?? 0)
      ),
      sub: 'Need follow-up',
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'rounded-xl border p-4 transition-shadow hover:shadow-md',
            card.border, card.bg
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className={cn('mt-1 text-2xl font-bold tracking-tight', card.color)}>
                {card.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
            </div>
            <div className={cn('rounded-lg p-2', card.bg)}>
              <card.icon className={cn('h-5 w-5', card.color)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}