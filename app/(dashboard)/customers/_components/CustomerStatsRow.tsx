'use client';

import { Customer } from '@/types/customer.types';
import { TrendingUp, Luggage, Clock, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';

interface Props {
  customer: Customer;
}

const stats = (c: Customer) => [
  {
    label: 'Total Spend',
    value: formatCurrency(c.totalSpend),
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Total Trips',
    value: String(c.totalTrips),
    icon: Luggage,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Upcoming',
    value: String(c.upcomingTrips),
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Last Trip',
    value: c.lastTripDate ? formatDate(c.lastTripDate) : '—',
    icon: Calendar,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
];

export function CustomerStatsRow({ customer }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats(customer).map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bg} shrink-0`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold leading-tight mt-0.5">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}