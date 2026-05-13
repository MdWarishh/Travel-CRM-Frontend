'use client';

/**
 * VendorSelect
 * ─────────────────────────────────────────────────────────────
 * Reusable searchable vendor dropdown for booking form modals.
 * Fetches vendors filtered by type from GET /bookings/vendors?type=X
 *
 * Usage:
 *   <VendorSelect
 *     vendorType="HOTEL"
 *     value={form.vendorId ?? null}
 *     onChange={(id) => set('vendorId', id)}
 *   />
 */

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { bookingsService } from '@/services/bookings.service';
import { BookingVendorOption } from '@/types/booking';

// ── type → label map ──────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  HOTEL: 'Hotel Vendor',
  AIRLINE: 'Flight Agent / Airline',
  TRANSPORT: 'Transport Vendor',
  TOUR_OPERATOR: 'Tour Operator',
  GUIDE: 'Guide',
  VISA: 'Visa Agent',
  ACTIVITY: 'Activity Vendor',
  OTHER: 'Vendor',
};

interface Props {
  vendorType: string;             // 'HOTEL' | 'AIRLINE' | 'TRANSPORT' | ...
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  required?: boolean;             // shows * in label
  className?: string;
}

export function VendorSelect({ vendorType, value, onChange, required, className }: Props) {
  const [vendors, setVendors]   = useState<BookingVendorOption[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState('');
  const containerRef            = useRef<HTMLDivElement>(null);

  // ── fetch on mount (once per vendorType) ──────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bookingsService
      .getVendorsByType(vendorType)
      .then((data) => { if (!cancelled) setVendors(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [vendorType]);

  // ── close on outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected  = vendors.find((v) => v.id === value) ?? null;
  const filtered  = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.city ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const label     = TYPE_LABELS[vendorType] ?? 'Vendor';

  return (
    <div className={cn('space-y-1.5', className)} ref={containerRef}>
      <Label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
        className={cn(
          'w-full h-9 rounded-xl border-slate-200 text-sm font-normal justify-between px-3',
          !selected && 'text-slate-400',
          open && 'ring-1 ring-slate-300',
        )}
      >
        <span className="truncate flex items-center gap-1.5">
          {loading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> Loading vendors…</>
          ) : selected ? (
            <>
              {selected.isPreferred && (
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              )}
              {selected.name}
              {selected.city && (
                <span className="text-slate-400 text-xs">· {selected.city}</span>
              )}
            </>
          ) : (
            `Select ${label}`
          )}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selected && (
            <X
              className="h-3.5 w-3.5 text-slate-400 hover:text-slate-700"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            />
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              placeholder="Search vendor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>

          {/* List */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {/* None option */}
            <li>
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors',
                  !value && 'text-slate-400',
                )}
              >
                <Check className={cn('h-3.5 w-3.5 shrink-0', value ? 'opacity-0' : 'opacity-100 text-slate-500')} />
                <span className="text-slate-400 italic">No vendor</span>
              </button>
            </li>

            {loading ? (
              <li className="px-3 py-4 text-center text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-400">
                No vendors found
              </li>
            ) : (
              filtered.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(v.id); setOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <Check
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 text-slate-700',
                        value === v.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1">
                        {v.isPreferred && (
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                        <span className="font-medium truncate">{v.name}</span>
                      </span>
                      {(v.city || v.phone) && (
                        <span className="text-xs text-slate-400 block truncate">
                          {[v.city, v.phone].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}