'use client';

import { Customer, CustomerTimeline } from '@/types/customer.types';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingStatusBadge } from './BookingStatusBadge';

import { formatDate, formatCurrency } from '@/lib/format';
import { CalendarCheck, Clock } from 'lucide-react';

interface Props {
  customer: Customer;
  timeline?: CustomerTimeline;
  isLoading: boolean;
}

export function OverviewTab({ timeline, isLoading }: Props) {
  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  const recentBookings = timeline?.bookings?.slice(0, 3) ?? [];
  const pendingFollowUps = timeline?.followUps?.filter(f => f.status === 'PENDING').slice(0, 3) ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Bookings */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Recent Bookings</h3>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No bookings yet</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-xs font-medium">{formatDate(b.travelStart)}</p>
                  <p className="text-xs text-muted-foreground">{b.adults ?? 0} Adults</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{formatCurrency(b.totalAmount)}</span>
                  <BookingStatusBadge status={b.tripStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Follow-ups */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Pending Follow-ups</h3>
        </div>
        {pendingFollowUps.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No pending follow-ups</p>
        ) : (
          <div className="space-y-2">
            {pendingFollowUps.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-xs font-medium">{f.type}</p>
                  <p className="text-xs text-muted-foreground">{f.notes ?? '—'}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(f.dueAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}