'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, X, User, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { PaginatedResponse, ApiResponse } from '@/types';

// ─────────────────────────────────────────────
// Minimal types (inline — no extra type files needed)
// ─────────────────────────────────────────────

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

interface BookingOption {
  id: string;
  status: string;
  travelStart?: string | null;
  travelEnd?: string | null;
  totalAmount?: number | null;
  paymentStatus?: string | null;
  itinerary?: { title?: string | null; destination?: string | null } | null;
}

// ─────────────────────────────────────────────
// CUSTOMER SELECT
// ─────────────────────────────────────────────

interface CustomerSelectProps {
  value: string;
  onChange: (id: string, customer: CustomerOption | null) => void;
  error?: string;
  disabled?: boolean;
}

export function CustomerSelect({ value, onChange, error, disabled }: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['customers-dropdown', search],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<CustomerOption>>('/customers', {
        params: { search, limit: 20 },
      });
      return res.data.data;
    },
    enabled: open,
  });

  const customers = data ?? [];

  // Find selected customer name for display
  const { data: selectedCustomer } = useQuery({
    queryKey: ['customer-by-id', value],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CustomerOption>>(`/customers/${value}`);
      return res.data.data;
    },
    enabled: !!value,
  });

  const displayName = selectedCustomer?.name ?? (value ? 'Loading...' : '');

  const handleSelect = (customer: CustomerOption) => {
    onChange(customer.id, customer);
    setSearch('');
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', null);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full h-9 px-3 flex items-center justify-between gap-2 rounded-md border text-sm transition-colors',
          'bg-background hover:bg-muted/30 focus:outline-none focus:ring-1 focus:ring-ring',
          error ? 'border-red-500' : 'border-input',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          {displayName ? (
            <span className="truncate font-medium">{displayName}</span>
          ) : (
            <span className="text-muted-foreground">Select customer...</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-muted cursor-pointer"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {customers.length === 0 && !isLoading && (
              <div className="py-6 text-center text-xs text-muted-foreground">No customers found</div>
            )}
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className={cn(
                  'w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
                  value === c.id && 'bg-primary/5'
                )}
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                </div>
                {value === c.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// BOOKING SELECT
// ─────────────────────────────────────────────

interface BookingSelectProps {
  value: string;
  onChange: (id: string) => void;
  customerId?: string; // filter bookings by customer
  disabled?: boolean;
}

const fmtDate = (val: string | null | undefined) =>
  val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const STATUS_DOT: Record<string, string> = {
  PAID: 'bg-emerald-500',
  PARTIAL: 'bg-amber-500',
  PENDING: 'bg-slate-400',
  UNPAID: 'bg-red-500',
};

export function BookingSelect({ value, onChange, customerId, disabled }: BookingSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings-dropdown', customerId],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<BookingOption>>('/bookings', {
        params: { customerId, limit: 50 },
      });
      return res.data.data;
    },
    enabled: open,
  });

  const bookings = data ?? [];

  const selected = bookings.find((b) => b.id === value);
  const displayLabel = selected
    ? `#${selected.id.slice(-8).toUpperCase()}${selected.itinerary?.destination ? ` — ${selected.itinerary.destination}` : ''}`
    : '';

  const handleSelect = (booking: BookingOption) => {
    onChange(booking.id);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full h-9 px-3 flex items-center justify-between gap-2 rounded-md border border-input text-sm transition-colors',
          'bg-background hover:bg-muted/30 focus:outline-none focus:ring-1 focus:ring-ring',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          {displayLabel ? (
            <span className="truncate font-medium text-sm">{displayLabel}</span>
          ) : (
            <span className="text-muted-foreground text-sm">Select booking (optional)...</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span onClick={handleClear} className="p-0.5 rounded hover:bg-muted cursor-pointer">
              <X className="w-3 h-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading bookings...</span>
              </div>
            )}
            {!isLoading && bookings.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {customerId ? 'No bookings for this customer' : 'No bookings found'}
              </div>
            )}
            {bookings.map((b) => {
              const dotColor = STATUS_DOT[b.paymentStatus ?? 'PENDING'] ?? 'bg-slate-400';
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={cn(
                    'w-full px-3 py-2.5 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left',
                    value === b.id && 'bg-primary/5'
                  )}
                >
                  <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground flex-shrink-0 mt-0.5">
                    #{b.id.slice(-4).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {b.itinerary?.destination ?? b.itinerary?.title ?? 'Booking'}
                      </p>
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {fmtDate(b.travelStart) && (
                        <p className="text-[11px] text-muted-foreground">{fmtDate(b.travelStart)}</p>
                      )}
                      {b.totalAmount && (
                        <p className="text-[11px] text-muted-foreground">
                          · ₹{new Intl.NumberFormat('en-IN').format(b.totalAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                  {value === b.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}