'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X, ChevronDown, Search, Check, User, MapPin, Calendar, DollarSign, FileText, StickyNote, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';
import { itinerariesService } from '@/services/itineraries.service';
import { CreateBookingData } from '@/types/booking';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

// ─── Searchable Dropdown (Portal-based to fix overflow-hidden clipping) ────────

interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
}

function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  loading,
  disabled,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Calculate position when opening
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = Math.min(300, filtered.length * 56 + 60);

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Open upward
        setDropdownStyle({
          position: 'fixed',
          top: rect.top - dropdownHeight - 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      } else {
        // Open downward
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      }
    }
  }, [open, filtered.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on scroll/resize to reposition
  useEffect(() => {
    if (!open) return;
    const handler = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const dropdownHeight = Math.min(300, filtered.length * 56 + 60);

        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
          setDropdownStyle((prev) => ({ ...prev, top: rect.top - dropdownHeight - 4, left: rect.left, width: rect.width }));
        } else {
          setDropdownStyle((prev) => ({ ...prev, top: rect.bottom + 4, left: rect.left, width: rect.width }));
        }
      }
    };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, filtered.length]);

  const dropdownMenu = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/80 overflow-hidden"
    >
      {/* Search input */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 focus-within:border-blue-200 focus-within:bg-blue-50/30 transition-all">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="text-sm bg-transparent flex-1 outline-none text-slate-700 placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Options list */}
      <div className="max-h-56 overflow-y-auto">
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 border-b border-slate-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear selection
          </button>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
            No results found
          </div>
        ) : (
          filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3
                text-left transition-colors
                ${opt.value === value
                  ? 'bg-blue-50 border-l-2 border-blue-400'
                  : 'hover:bg-slate-50 border-l-2 border-transparent'}
              `}
            >
              <span className="flex flex-col min-w-0">
                <span className={`text-sm font-medium truncate ${opt.value === value ? 'text-blue-700' : 'text-slate-800'}`}>
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span className="text-[11px] text-slate-400 truncate mt-0.5">{opt.sublabel}</span>
                )}
              </span>
              {opt.value === value && (
                <span className="shrink-0 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 rounded-xl border
          h-11 px-4 text-sm bg-white text-left transition-all duration-150
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open
            ? 'border-blue-400 ring-4 ring-blue-100 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
          </span>
        ) : selected ? (
          <span className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 truncate text-sm">{selected.label}</span>
            {selected.sublabel && (
              <span className="text-[11px] text-slate-400 truncate">{selected.sublabel}</span>
            )}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-blue-400' : ''}`}
        />
      </button>

      {/* Portal: renders dropdown outside all parent containers */}
      {typeof window !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </div>
  );
}

// ─── Section & Field wrappers ─────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
        {Icon && (
          <span className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <Icon className="h-3.5 w-3.5 text-white" />
          </span>
        )}
        <h2 className="text-sm font-bold text-slate-800 tracking-wide">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [customers, setCustomers] = useState<DropdownOption[]>([]);
  const [itineraries, setItineraries] = useState<DropdownOption[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [itinerariesLoading, setItinerariesLoading] = useState(true);

  const [form, setForm] = useState<CreateBookingData>({
    customerId: '',
    status: 'DRAFT',
    adults: 1,
    children: 0,
    childAge: '',
    travelStart: '',
    travelEnd: '',
    startDetails: '',
    endDetails: '',
    tourDays: '',
    inclusions: '',
    dayWiseItinerary: '',
    notes: '',
    totalAmount: undefined,
  });

  useEffect(() => {
    customersService
      .getAll({ limit: '200' } as any)
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setCustomers(
          data.map((c: any) => ({
            value: c.id,
            label: c.name,
            sublabel: c.phone || c.email || '',
          }))
        );
      })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setCustomersLoading(false));
  }, []);

  useEffect(() => {
    itinerariesService
      .getAll({ limit: 200 } as any)
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setItineraries(
          data.map((it: any) => ({
            value: it.id,
            label: it.title || it.name || `Itinerary #${it.id.slice(-6)}`,
            sublabel: it.destination || it.status || '',
          }))
        );
      })
      .catch(() => toast.error('Failed to load itineraries'))
      .finally(() => setItinerariesLoading(false));
  }, []);

  const set = (key: keyof CreateBookingData, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleDateChange = (key: 'travelStart' | 'travelEnd', val: string) => {
    set(key, val);
    const start = key === 'travelStart' ? val : form.travelStart;
    const end = key === 'travelEnd' ? val : form.travelEnd;
    if (start && end) {
      const nights = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
      if (nights > 0) set('tourDays', `${nights}N ${nights + 1}D`);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      set('companyLogoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.customerId) {
      toast.error('Please select a customer');
      return;
    }
    try {
      setLoading(true);
      const booking = await bookingsService.create(form);
      toast.success('Booking created!');
      router.push(`/bookings/${booking.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Booking</h1>
            <p className="text-sm text-slate-400 mt-0.5">Fill details — add hotels, flights & transport after</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* ── Customer Info ── */}
          <Section title="Customer" icon={User}>
            <Field label="Customer" required hint="Select the customer for this booking">
              <SearchableDropdown
                options={customers}
                value={form.customerId}
                onChange={(v) => set('customerId', v)}
                placeholder="Search and select customer..."
                loading={customersLoading}
              />
            </Field>
            <Field label="Itinerary" hint="Optional — link to an existing itinerary">
              <SearchableDropdown
                options={itineraries}
                value={form.itineraryId ?? ''}
                onChange={(v) => set('itineraryId', v || undefined)}
                placeholder="Search and select itinerary (optional)..."
                loading={itinerariesLoading}
              />
            </Field>
          </Section>

          {/* ── Travel Details ── */}
          <Section title="Travel Details" icon={Calendar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Travel Start">
                <Input
                  type="date"
                  value={form.travelStart ?? ''}
                  onChange={(e) => handleDateChange('travelStart', e.target.value)}
                  className="rounded-xl border-slate-200 h-11 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                />
              </Field>
              <Field label="Travel End">
                <Input
                  type="date"
                  value={form.travelEnd ?? ''}
                  onChange={(e) => handleDateChange('travelEnd', e.target.value)}
                  className="rounded-xl border-slate-200 h-11 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Adults">
                <Input
                  type="number" min={1}
                  value={form.adults ?? 1}
                  onChange={(e) => set('adults', parseInt(e.target.value))}
                  className="rounded-xl border-slate-200 h-11 text-sm"
                />
              </Field>
              <Field label="Children">
                <Input
                  type="number" min={0}
                  value={form.children ?? 0}
                  onChange={(e) => set('children', parseInt(e.target.value))}
                  className="rounded-xl border-slate-200 h-11 text-sm"
                />
              </Field>
              <Field label="Child Age" hint="e.g. 8, 10 yrs">
                <Input
                  placeholder="e.g. 8, 10 yrs"
                  value={form.childAge ?? ''}
                  onChange={(e) => set('childAge', e.target.value)}
                  className="rounded-xl border-slate-200 h-11 text-sm col-span-2 sm:col-span-1"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tour Duration" hint="Auto-filled from dates">
                <Input
                  placeholder="e.g. 3N 4D"
                  value={form.tourDays ?? ''}
                  onChange={(e) => set('tourDays', e.target.value)}
                  className="rounded-xl border-slate-200 h-11 text-sm"
                />
              </Field>
              <Field label="Booking Status">
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['DRAFT', 'PENDING', 'CONFIRMED'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* ── Pickup / Drop ── */}
          <Section title="Pickup & Drop" icon={MapPin}>
            <Field label="Start Details" hint="Pickup location + time (shown on voucher)">
              <Input
                placeholder="e.g. Chandigarh Railway Station, 5th April – 10:05 AM"
                value={form.startDetails ?? ''}
                onChange={(e) => set('startDetails', e.target.value)}
                className="rounded-xl border-slate-200 h-11 text-sm"
              />
            </Field>
            <Field label="End Details" hint="Drop location + time (shown on voucher)">
              <Input
                placeholder="e.g. Chandigarh Railway Station, 8th April – 09:00 PM"
                value={form.endDetails ?? ''}
                onChange={(e) => set('endDetails', e.target.value)}
                className="rounded-xl border-slate-200 h-11 text-sm"
              />
            </Field>
          </Section>

          {/* ── Itinerary Content ── */}
          <Section title="Itinerary Content" icon={FileText}>
            <Field label="Day-wise Itinerary" hint="Paste the full day-wise plan — shown on PDF page 2">
              <Textarea
                placeholder={`Day 01 – Chandigarh to Shimla by Dzire Cab\nPickup from railway station, check-in hotel...\n\nDay 02 – Shimla - Kufri - Manali\nAfter breakfast visit Kufri...`}
                value={form.dayWiseItinerary ?? ''}
                onChange={(e) => set('dayWiseItinerary', e.target.value)}
                className="rounded-xl border-slate-200 text-sm resize-none font-mono"
                rows={8}
              />
            </Field>
            <Field label="Inclusions" hint="Bullet points — one per line. Shown on PDF page 2">
              <Textarea
                placeholder={`Chandigarh–Shimla–Manali–Chandigarh by Dzire Cab\n02 Nights accommodation in Manali Hotel\n01 Night accommodation in Shimla Hotel\n03 Breakfast & 03 Dinners (veg)\nAll transfers & Sightseeing by Dzire cab`}
                value={form.inclusions ?? ''}
                onChange={(e) => set('inclusions', e.target.value)}
                className="rounded-xl border-slate-200 text-sm resize-none"
                rows={5}
              />
            </Field>
          </Section>

          {/* ── Payment ── */}
          <Section title="Payment" icon={DollarSign}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Total Amount (₹)">
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={form.totalAmount ?? ''}
                  onChange={(e) => set('totalAmount', parseFloat(e.target.value))}
                  className="rounded-xl border-slate-200 h-11 text-sm"
                />
              </Field>
              <Field label="Advance Paid (₹)">
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={form.advancePaid ?? ''}
                  onChange={(e) => set('advancePaid', parseFloat(e.target.value))}
                  className="rounded-xl border-slate-200 h-11 text-sm"
                />
              </Field>
            </div>
          </Section>

          {/* ── Company Logo ── */}
          <Section title="Company Branding (for PDF)" icon={Image}>
            <Field label="Company Logo" hint="Upload your logo — appears on the PDF voucher header">
              {logoPreview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-14 object-contain rounded-xl border border-slate-200 bg-white px-3"
                  />
                  <button
                    type="button"
                    onClick={() => { setLogoPreview(null); set('companyLogoUrl', ''); }}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Upload className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Click to upload logo</p>
                    <p className="text-xs text-slate-400">PNG, JPG accepted</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </Field>
          </Section>

          {/* ── Notes ── */}
          <Section title="Internal Notes" icon={StickyNote}>
            <Field label="Notes" hint="Internal notes — not shown on PDF">
              <Textarea
                placeholder="Any internal remarks..."
                value={form.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                className="rounded-xl border-slate-200 text-sm resize-none"
                rows={3}
              />
            </Field>
          </Section>

          {/* Actions */}
          <div className="flex gap-3 pb-8 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}