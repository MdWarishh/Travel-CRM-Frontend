// app/invoice/_components/VendorSelector.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { VendorOption } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building2, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string | null;
  selectedVendor?: VendorOption | null;
  onSearch: (query: string) => void;
  onSelect: (id: string | null) => void;
  options: VendorOption[];
  loading?: boolean;
}

const SERVICE_TYPE_COLORS: Record<string, string> = {
  HOTEL: 'bg-blue-50 text-blue-700 border-blue-100',
  AIRLINE: 'bg-sky-50 text-sky-700 border-sky-100',
  TRANSPORT: 'bg-amber-50 text-amber-700 border-amber-100',
  TRAVEL: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  DEFAULT: 'bg-violet-50 text-violet-700 border-violet-100',
};

function serviceColor(type?: string | null) {
  return SERVICE_TYPE_COLORS[type ?? ''] ?? SERVICE_TYPE_COLORS.DEFAULT;
}

export function VendorSelector({
  value,
  selectedVendor,
  onSearch,
  onSelect,
  options,
  loading,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query) { onSearch(''); return; }
    const t = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (vendor: VendorOption) => {
    onSelect(vendor.id);
    setQuery(vendor.name);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query || options.length > 0) setOpen(true); }}
          placeholder="Search vendor by name…"
          className="pl-9 pr-9 h-9 text-sm"
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        )}
      </div>

      {/* Dropdown */}
      {open && options.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden">
          {options.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleSelect(v)}
              className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted text-left transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{v.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {v.phone ?? ''}{v.city ? ` · ${v.city}` : ''}
                </p>
              </div>
              {v.serviceType && (
                <span
                  className={cn(
                    'shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide',
                    serviceColor(v.serviceType)
                  )}
                >
                  {v.serviceType}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected vendor chip */}
      {value && selectedVendor && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 border px-3 py-2 text-xs">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
          <span className="font-medium text-slate-700">{selectedVendor.name}</span>
          {selectedVendor.serviceType && (
            <span
              className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ml-1',
                serviceColor(selectedVendor.serviceType)
              )}
            >
              {selectedVendor.serviceType}
            </span>
          )}
          {selectedVendor.city && (
            <span className="text-muted-foreground ml-auto">{selectedVendor.city}</span>
          )}
        </div>
      )}
    </div>
  );
}