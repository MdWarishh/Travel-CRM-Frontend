'use client';

import { IndianRupee, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentStatsProps {
  summary: {
    amount: number | null;
    paidAmount: number | null;
    dueAmount: number | null;
  } | null;
  total: number;
  isLoading: boolean;
}

const fmt = (val: number | null | undefined) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val ?? 0);

const stats = (summary: PaymentStatsProps['summary'], total: number) => [
  {
    label: 'Total Transactions',
    value: total.toString(),
    sub: 'All time',
    icon: TrendingUp,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Total Billed',
    value: `₹${fmt(summary?.amount)}`,
    sub: 'Invoice value',
    icon: IndianRupee,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Amount Collected',
    value: `₹${fmt(summary?.paidAmount)}`,
    sub: 'Payments received',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Outstanding',
    value: `₹${fmt(summary?.dueAmount)}`,
    sub: 'Pending collection',
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

export function PaymentStats({ summary, total, isLoading }: PaymentStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <Skeleton className="h-8 w-8 rounded-lg mb-3" />
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats(summary, total).map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="border-border/50 hover:border-border transition-colors">
            <CardContent className="p-5">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.bg} mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}