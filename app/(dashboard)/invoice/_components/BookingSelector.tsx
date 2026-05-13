// app/invoice/_components/BookingSelector.tsx

'use client';

import { BookingOption } from '@/types/invoice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Loader2, Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  bookings: BookingOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  loading?: boolean;
  disabled?: boolean;
}

function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start) return '';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  return end ? `${fmt(start)} → ${fmt(end)}` : fmt(start);
}

export function BookingSelector({ bookings, value, onChange, loading, disabled }: Props) {
  const selected = bookings.find((b) => b.id === value);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <p className="text-xs text-muted-foreground animate-pulse">Fetching bookings…</p>
      </div>
    );
  }

  if (bookings.length === 0 && !disabled) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
        <Link2 className="h-4 w-4 shrink-0" />
        <span>No bookings found for this customer</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={value ?? 'none'}
          onValueChange={(v) => onChange(v === 'none' ? null : v)}
          disabled={disabled || bookings.length === 0}
        >
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue placeholder="Select a booking (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">No booking linked</span>
            </SelectItem>
            {bookings.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                <div className="flex flex-col gap-0.5 py-0.5">
                  <span className="font-medium text-sm">
                    {b.customer?.name ?? 'Booking'}{' '}
                    <span className="text-xs text-muted-foreground font-mono">
                      #{b.id.slice(-6).toUpperCase()}
                    </span>
                  </span>
                  {(b.travelStart || b.travelEnd) && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDateRange(b.travelStart, b.travelEnd)}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected booking pill */}
      {selected && (
        <div className="flex items-center gap-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-xs">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
          <span className="text-violet-700 font-medium">
            Linked to booking{' '}
            <span className="font-mono">#{selected.id.slice(-6).toUpperCase()}</span>
          </span>
          {selected.travelStart && (
            <span className="text-violet-500 ml-auto">
              {formatDateRange(selected.travelStart, selected.travelEnd)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}