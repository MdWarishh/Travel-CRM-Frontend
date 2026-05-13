// app/invoice/_components/CustomerSelector.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { CustomerOption } from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BillingInfo {
  customerId?: string;
  billingName: string;
  billingPhone?: string;
  billingEmail?: string;
  billingAddress?: string;
  billingState?: string;
  customerGstin?: string;
}

interface Props {
  value: BillingInfo;
  onChange: (info: BillingInfo) => void;
  onCustomerSelect?: (customer: CustomerOption) => void;
}

export function CustomerSelector({ value, onChange, onCustomerSelect }: Props) {
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [query, setQuery] = useState(value.billingName ?? '');
  const allCustomersRef = useRef<CustomerOption[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerOption[]>([]);
  const [filteredResults, setFilteredResults] = useState<CustomerOption[]>([]);
  const [open, setOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const updateAllCustomers = (customers: CustomerOption[]) => {
  allCustomersRef.current = customers;
  setAllCustomers(customers);
};

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load all customers on first open
  const loadAllCustomers = async () => {
    if (allCustomers.length > 0) {
      setFilteredResults(allCustomers);
      setOpen(true);
      return;
    }
    setInitialLoading(true);
    try {
      const data = await invoiceService.searchCustomers(query);
setAllCustomers(data);
setFilteredResults(data);
      setOpen(true);
    } catch {
      setFilteredResults([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Local filter + debounced backend search as user types
useEffect(() => {
  if (mode !== 'search') return;
  if (!open) return;          // ← dropdown band ho to search mat karo

  const q = query.trim().toLowerCase();

  if (!q) {
    setFilteredResults(allCustomers);
    return;
  }

  const local = allCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
  );
  setFilteredResults(local);

  const timer = setTimeout(async () => {
    setSearching(true);
    try {
      const data = await invoiceService.searchCustomers(query);
      setFilteredResults((prev) => {
        const map = new Map<string, CustomerOption>();
        [...prev, ...data].forEach((c) => map.set(c.id, c));
        return Array.from(map.values());
      });
      setAllCustomers((prev) => {        // ← functional update, no dependency needed
        const m = new Map<string, CustomerOption>();
        [...prev, ...data].forEach((c) => m.set(c.id, c));
        return Array.from(m.values());
      });
    } catch {
      // keep local
    } finally {
      setSearching(false);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [query, mode, open]);   // ← allCustomers HATAO, open ADD karo
//                 ^^^^

  const handleInputFocus = () => {
    if (mode === 'search') loadAllCustomers();
  };

  const selectCustomer = (c: CustomerOption) => {
    const info: BillingInfo = {
      customerId: c.id,
      billingName: c.name,
      billingPhone: c.phone,
      billingEmail: c.email ?? '',
      billingAddress: [c.address, c.city, c.country].filter(Boolean).join(', '),
      billingState: '',
      customerGstin: '',
    };
    onChange(info);
    onCustomerSelect?.(c);
    setQuery(c.name);
    setOpen(false);
  };

  const clearCustomer = () => {
    onChange({
      billingName: '',
      billingPhone: '',
      billingEmail: '',
      billingAddress: '',
      billingState: '',
      customerGstin: '',
    });
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg border overflow-hidden w-fit text-sm">
        {(['search', 'manual'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'px-4 py-1.5 font-medium transition-colors',
              mode === m
                ? 'bg-violet-600 text-white'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            {m === 'search' ? '🔍 Select Customer' : '✏️ Enter Manually'}
          </button>
        ))}
      </div>

      {/* Search mode */}
      {mode === 'search' && (
        <div className="relative" ref={ref}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={handleInputFocus}
              placeholder="Click to browse or type to filter…"
              className="pl-9 pr-16"
              autoComplete="off"
            />

            {/* Right icons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {(initialLoading || searching) && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              )}
              {!initialLoading && !searching && value.customerId && (
                <button
                  type="button"
                  onClick={clearCustomer}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {!initialLoading && !searching && !value.customerId && (
                <button
                  type="button"
                  onClick={() => (open ? setOpen(false) : loadAllCustomers())}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden">
              {/* Loading */}
              {initialLoading && (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                  Loading customers…
                </div>
              )}

              {/* Empty */}
              {!initialLoading && filteredResults.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {query ? `No customers found for "${query}"` : 'No customers yet'}
                </div>
              )}

              {/* Results list */}
              {!initialLoading && filteredResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {/* Count hint when not filtering */}
                  {!query && (
                    <div className="sticky top-0 px-3 py-1.5 text-[11px] text-muted-foreground bg-muted/60 border-b backdrop-blur-sm">
                      {filteredResults.length} customer{filteredResults.length !== 1 ? 's' : ''} — type to filter
                    </div>
                  )}

                  {filteredResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted text-left transition-colors border-b border-border/40 last:border-0"
                    >
                      {/* Avatar with initial */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-semibold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.phone}
                          {c.email ? ` · ${c.email}` : ''}
                          {c.city ? ` · ${c.city}` : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Billing fields */}
      {(value.customerId || mode === 'manual') && (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.customerId && mode === 'search' && (
            <div className="sm:col-span-2 flex items-center gap-1.5 rounded-md bg-violet-50 border border-violet-100 px-3 py-1.5 text-xs text-violet-700">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
              Auto-filled from customer record — edit if needed
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Billing Name *</Label>
            <Input
              value={value.billingName}
              onChange={(e) => onChange({ ...value, billingName: e.target.value })}
              placeholder="Company or person name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={value.billingPhone ?? ''}
              onChange={(e) => onChange({ ...value, billingPhone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={value.billingEmail ?? ''}
              onChange={(e) => onChange({ ...value, billingEmail: e.target.value })}
              placeholder="client@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input
              value={value.billingState ?? ''}
              onChange={(e) => onChange({ ...value, billingState: e.target.value })}
              placeholder="Maharashtra"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Billing Address</Label>
            <Input
              value={value.billingAddress ?? ''}
              onChange={(e) => onChange({ ...value, billingAddress: e.target.value })}
              placeholder="Full address"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>
              Customer GSTIN{' '}
              <span className="font-normal text-muted-foreground">(optional — for B2B)</span>
            </Label>
            <Input
              value={value.customerGstin ?? ''}
              onChange={(e) => onChange({ ...value, customerGstin: e.target.value })}
              placeholder="22AAAAA0000A1Z5"
              className="font-mono uppercase"
            />
          </div>
        </div>
      )}
    </div>
  );
}