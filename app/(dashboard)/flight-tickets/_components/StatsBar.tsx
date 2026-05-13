'use client';

import { Plane, ShoppingCart, Zap, TrendingUp, Link2, CheckCircle2, IndianRupee, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTicketStats } from './useTicketData';
import type { TicketDashboardStats } from '@/types/ticket.types';

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  loading?: boolean;
}

function StatItem({ icon: Icon, label, value, sub, accent = 'text-foreground', loading }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-w-[130px]">
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0',
        'bg-muted/60'
      )}>
        <Icon className={cn('h-4 w-4', accent)} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground leading-none mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          <div className="flex items-baseline gap-1">
            <p className={cn('text-sm font-bold leading-none', accent)}>{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground leading-none">{sub}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  stats?: TicketDashboardStats;
  loading?: boolean;
}

export function StatsBar({ stats, loading }: Props) {
  const items = [
    {
      icon: Plane,
      label: 'Sellers',
      value: stats?.overview.totalSellers ?? 0,
      sub: 'active',
      accent: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: ShoppingCart,
      label: 'Buyers',
      value: stats?.overview.totalBuyers ?? 0,
      sub: 'active',
      accent: 'text-violet-600 dark:text-violet-400',
    },
    {
      icon: Zap,
      label: 'Matches',
      value: stats?.overview.matchesFound ?? 0,
      sub: stats ? `${stats.overview.feasibleMatches} profitable` : undefined,
      accent: 'text-amber-500',
    },
    {
      icon: Link2,
      label: 'Deals',
      value: stats?.deals.total ?? 0,
      sub: stats ? `${stats.deals.today} today` : undefined,
      accent: 'text-foreground',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: stats?.deals.completed ?? 0,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: IndianRupee,
      label: 'Revenue',
      value: stats ? `₹${(stats.financials.totalRevenue / 1000).toFixed(0)}K` : '₹0',
      sub: stats ? `profit ₹${(stats.financials.totalProfit / 1000).toFixed(0)}K` : undefined,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="border-b bg-background overflow-x-auto">
      <div className="flex items-center divide-x min-w-max">
        {items.map((item, i) => (
          <StatItem key={i} {...item} loading={loading} />
        ))}

        {/* Net cash pill */}
        {!loading && stats && (
          <div className="px-4 py-3 min-w-[130px]">
            <p className="text-[11px] text-muted-foreground leading-none mb-1">Net Cash</p>
            <div className={cn(
              'inline-flex items-center gap-1 text-xs font-bold',
              stats.financials.netCash >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              <ArrowUpRight className="h-3 w-3" />
              ₹{Math.abs(stats.financials.netCash).toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}