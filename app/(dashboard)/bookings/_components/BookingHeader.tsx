'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar, Users, Clock, CheckCircle2, XCircle,
  AlertCircle, Edit2, Save, X, Loader2, FileText,
  Download, Send, MapPin, Moon, IndianRupee,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { bookingsService } from '@/services/bookings.service';
import { Booking, BookingStatus, TripStatus, CreateBookingData } from '@/types/booking';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Status configs ─────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; icon: React.ElementType; pill: string; bar: string }> = {
  DRAFT:        { label: 'Draft',        icon: FileText,      pill: 'bg-slate-100 text-slate-500 border-slate-200',     bar: 'bg-slate-300' },
  PENDING:      { label: 'Pending',      icon: Clock,         pill: 'bg-amber-50 text-amber-700 border-amber-200',      bar: 'bg-amber-400' },
  REQUESTED:    { label: 'Requested',    icon: AlertCircle,   pill: 'bg-blue-50 text-blue-700 border-blue-200',         bar: 'bg-blue-400' },
  CONFIRMED:    { label: 'Confirmed',    icon: CheckCircle2,  pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',bar: 'bg-emerald-400' },
  VOUCHER_SENT: { label: 'Voucher Sent', icon: Send,          pill: 'bg-violet-50 text-violet-700 border-violet-200',   bar: 'bg-violet-400' },
  READY:        { label: 'Ready',        icon: CheckCircle2,  pill: 'bg-cyan-50 text-cyan-700 border-cyan-200',         bar: 'bg-cyan-400' },
  IN_PROGRESS:  { label: 'In Progress',  icon: AlertCircle,   pill: 'bg-orange-50 text-orange-700 border-orange-200',   bar: 'bg-orange-400' },
  COMPLETED:    { label: 'Completed',    icon: CheckCircle2,  pill: 'bg-slate-100 text-slate-600 border-slate-200',     bar: 'bg-slate-400' },
  CANCELLED:    { label: 'Cancelled',    icon: XCircle,       pill: 'bg-red-50 text-red-600 border-red-200',            bar: 'bg-red-400' },
};

const TRIP_STATUS: Record<TripStatus, { label: string; cls: string }> = {
  UPCOMING:  { label: '🗓 Upcoming',  cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  ONGOING:   { label: '✈️ Ongoing',   cls: 'bg-orange-50 text-orange-600 border-orange-200' },
  COMPLETED: { label: '✅ Completed', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const PAYMENT_STATUS_CONFIG = {
  PAID:           { label: 'Paid',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PARTIAL:        { label: 'Partial',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  PARTIALLY_PAID: { label: 'Partial',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDING:        { label: 'Pending',  cls: 'bg-red-50 text-red-500 border-red-200' },
  UNPAID:         { label: 'Unpaid',   cls: 'bg-red-50 text-red-500 border-red-200' },
};

interface Props {
  booking: Booking;
  onUpdate: (updated: Booking) => void;
  onPreview: () => void;
  onShare: (tab: 'whatsapp' | 'email') => void;
  onDownloadPdf: () => void;
  pdfLoading?: boolean;
}

export function BookingHeader({ booking, onUpdate, onPreview, onShare, onDownloadPdf, pdfLoading }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState<Partial<CreateBookingData>>({
    travelStart:    booking.travelStart?.slice(0, 10),
    travelEnd:      booking.travelEnd?.slice(0, 10),
    adults:         booking.adults ?? 1,
    children:       booking.children ?? 0,
    childAge:       booking.childAge ?? '',
    tourDays:       booking.tourDays ?? '',
    startDetails:   booking.startDetails ?? '',
    endDetails:     booking.endDetails ?? '',
    pricePerAdult:  booking.pricePerAdult ?? undefined,
    pricePerChild:  booking.pricePerChild ?? undefined,
    totalAmount:    booking.totalAmount ?? undefined,
    notes:          booking.notes ?? '',
    status:         booking.status,
  });

  const set = (key: keyof CreateBookingData, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  // Auto-calc totalAmount preview when per-person changes
  const previewTotal = (() => {
    const ppa = form.pricePerAdult ?? 0;
    const ppc = form.pricePerChild ?? 0;
    const a = form.adults ?? booking.adults ?? 0;
    const c = form.children ?? booking.children ?? 0;
    if (ppa > 0) return ppa * a + ppc * c;
    return form.totalAmount ?? null;
  })();

  const nights =
    booking.totalNights ??
    (booking.travelStart && booking.travelEnd
      ? Math.ceil((new Date(booking.travelEnd).getTime() - new Date(booking.travelStart).getTime()) / 86400000)
      : null);

  const totalAmount  = booking.totalAmount ?? 0;
  const advancePaid  = booking.advancePaid ?? 0;
  const dueAmount    = Math.max(0, totalAmount - advancePaid);
  const paymentStatus = booking.paymentStatus;
  const psCfg = paymentStatus
    ? PAYMENT_STATUS_CONFIG[paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG]
    : null;

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await bookingsService.update(booking.id, form);
      onUpdate(updated);
      setEditing(false);
      toast.success('Booking updated');
    } catch { toast.error('Failed to update booking'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const updated = await bookingsService.updateStatus(booking.id, status);
      onUpdate(updated);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const cfg        = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.DRAFT;
  const StatusIcon = cfg.icon;
  const tripCfg    = booking.tripStatus ? TRIP_STATUS[booking.tripStatus as TripStatus] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
      {/* Accent bar */}
      <div className={cn('h-1.5', cfg.bar)} />

      <div className="p-5">
        {/* ── Top row ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: customer info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                #{booking.id.slice(-8).toUpperCase()}
              </span>
              <Badge variant="outline" className={`text-xs font-semibold border flex items-center gap-1 ${cfg.pill}`}>
                <StatusIcon className="h-3 w-3" />
                {cfg.label}
              </Badge>
              {tripCfg && (
                <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${tripCfg.cls}`}>
                  {tripCfg.label}
                </span>
              )}
              {psCfg && (
                <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 flex items-center gap-1 ${psCfg.cls}`}>
                  <IndianRupee className="h-2.5 w-2.5" />
                  {psCfg.label}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 truncate">{booking.customer.name}</h2>

            <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5 flex-wrap">
              <span>{booking.customer.phone}</span>
              {booking.customer.email && (
                <><span className="text-slate-300">·</span><span>{booking.customer.email}</span></>
              )}
              {booking.itinerary && (
                <><span className="text-slate-300">·</span>
                <span className="text-blue-600 text-xs font-medium">📋 {booking.itinerary.title}</span></>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {!editing ? (
              <>
                <Select value={booking.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-36 h-9 rounded-xl border-slate-200 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                      <SelectItem key={v} value={v} className="text-xs">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-xl h-9 gap-1.5 text-xs">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={onPreview} className="rounded-xl h-9 gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button variant="outline" size="sm" onClick={onDownloadPdf} disabled={pdfLoading} className="rounded-xl h-9 gap-1.5 text-xs">
                  {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  PDF
                </Button>
                <Button size="sm" onClick={() => onShare('whatsapp')}
                  className="rounded-xl h-9 gap-1.5 text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm">
                  <Send className="h-3.5 w-3.5" /> Share
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving} className="rounded-xl h-9 gap-1.5 text-xs">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 rounded-xl h-9 gap-1.5 text-xs">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Stats row (view mode) ── */}
        {!editing && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
            {[
              {
                icon: Calendar,
                label: 'Travel Period',
                value: booking.travelStart && booking.travelEnd
                  ? `${format(new Date(booking.travelStart), 'dd MMM')} → ${format(new Date(booking.travelEnd), 'dd MMM yyyy')}`
                  : '—',
              },
              {
                icon: Moon,
                label: 'Duration',
                value: booking.tourDays || (nights !== null ? `${nights}N ${(nights ?? 0) + 1}D` : '—'),
              },
              {
                icon: Users,
                label: 'Travelers',
                value: (booking.adults || booking.children)
                  ? `${booking.adults ?? 0}A${booking.children ? ` + ${booking.children}C` : ''}`
                  : '—',
              },
              {
                icon: IndianRupee,
                label: 'Total',
                value: totalAmount ? `₹${totalAmount.toLocaleString('en-IN')}` : '—',
                sub: dueAmount > 0
                  ? `Due: ₹${dueAmount.toLocaleString('en-IN')}`
                  : totalAmount > 0 ? '✓ Fully paid' : undefined,
                subColor: dueAmount > 0 ? 'text-red-500' : 'text-emerald-600',
              },
              {
                icon: MapPin,
                label: booking.startDetails ? 'Pickup' : 'Notes',
                value: booking.startDetails || booking.notes || 'None',
                truncate: true,
              },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl px-3 py-2.5 flex gap-2.5 items-start">
                <item.icon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className={cn('text-sm font-medium text-slate-700 mt-0.5', (item as {truncate?: boolean}).truncate && 'truncate')}
                    title={item.value}>
                    {item.value}
                  </p>
                  {(item as {sub?: string; subColor?: string}).sub && (
                    <p className={cn('text-[11px] font-medium mt-0.5', (item as {subColor?: string}).subColor ?? 'text-slate-400')}>
                      {(item as {sub?: string}).sub}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Edit form ── */}
        {editing && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {/* Row 1: dates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Travel Start</Label>
                <Input type="date" value={form.travelStart ?? ''} onChange={(e) => set('travelStart', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Travel End</Label>
                <Input type="date" value={form.travelEnd ?? ''} onChange={(e) => set('travelEnd', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Adults</Label>
                <Input type="number" min={1} value={form.adults ?? 1} onChange={(e) => set('adults', parseInt(e.target.value))}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Children</Label>
                <Input type="number" min={0} value={form.children ?? 0} onChange={(e) => set('children', parseInt(e.target.value))}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
            </div>

            {/* Row 2: trip details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Tour Duration</Label>
                <Input placeholder="e.g. 3N 4D" value={form.tourDays ?? ''} onChange={(e) => set('tourDays', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Child Age</Label>
                <Input placeholder="e.g. 8, 10 yrs" value={form.childAge ?? ''} onChange={(e) => set('childAge', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
            </div>

            {/* Row 3: Pricing */}
            <div className="border border-slate-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Pricing</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Price / Adult (₹)</Label>
                  <Input type="number" placeholder="e.g. 12000"
                    value={form.pricePerAdult ?? ''}
                    onChange={(e) => set('pricePerAdult', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="rounded-xl border-slate-200 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Price / Child (₹)</Label>
                  <Input type="number" placeholder="e.g. 6000"
                    value={form.pricePerChild ?? ''}
                    onChange={(e) => set('pricePerChild', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="rounded-xl border-slate-200 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Total Amount (₹)</Label>
                  <Input type="number" placeholder="e.g. 25000"
                    value={form.pricePerAdult ? (previewTotal ?? '') : (form.totalAmount ?? '')}
                    onChange={(e) => !form.pricePerAdult && set('totalAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    readOnly={!!(form.pricePerAdult)}
                    className={cn('rounded-xl border-slate-200 h-9 text-sm', form.pricePerAdult && 'bg-slate-50 text-slate-500 cursor-not-allowed')}
                  />
                  {form.pricePerAdult && (
                    <p className="text-[11px] text-emerald-600 font-medium">Auto-calculated from per-person pricing</p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: pickup/drop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Pickup Details</Label>
                <Input placeholder="e.g. Chandigarh Railway Station, 5th Apr 10:05 AM"
                  value={form.startDetails ?? ''} onChange={(e) => set('startDetails', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Drop Details</Label>
                <Input placeholder="e.g. Chandigarh Railway Station, 8th Apr 09:00 PM"
                  value={form.endDetails ?? ''} onChange={(e) => set('endDetails', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
            </div>

            {/* Row 5: notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Notes</Label>
              <Textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)}
                className="rounded-xl border-slate-200 text-sm resize-none" rows={2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}