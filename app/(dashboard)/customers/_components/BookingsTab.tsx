'use client';

import { Booking } from '@/types/customer.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatDate, formatCurrency } from '@/lib/format';
import { Eye, Download, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  bookings: Booking[];
  isLoading: boolean;
  customerId: string;
}

export function BookingsTab({ bookings, isLoading, customerId }: Props) {
  const router = useRouter();

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {bookings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No bookings yet</p>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => router.push(`/bookings/create?customerId=${customerId}`)}
          >
            Create First Booking
          </Button>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {['Travel Date', 'Travellers', 'Amount', 'Payment', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-xs">
                  {formatDate(b.travelStart)} → {formatDate(b.travelEnd)}
                </td>
                <td className="px-4 py-3 text-xs">{(b.adults ?? 0) + (b.children ?? 0)} pax</td>
                <td className="px-4 py-3 text-xs font-medium">{formatCurrency(b.totalAmount)}</td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.tripStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => router.push(`/bookings/${b.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}