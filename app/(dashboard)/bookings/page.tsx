'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Plus, Search, Filter, Calendar, Users, Hotel, Plane, Car,
  Trash2, ChevronRight, Clock, CheckCircle2, XCircle,
  AlertCircle, Zap, TrendingUp, IndianRupee, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { bookingsService } from '@/services/bookings.service';
import { Booking, BookingStatus, TripStatus } from '@/types/booking';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Status configs ─────────────────────────────────────────────
const BOOKING_STATUS: Record<BookingStatus, { label: string; color: string; dot: string }> = {
  DRAFT:        { label: 'Draft',        color: 'bg-slate-100 text-slate-500 border-slate-200',   dot: 'bg-slate-400' },
  PENDING:      { label: 'Pending',      color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  REQUESTED:    { label: 'Requested',    color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  CONFIRMED:    { label: 'Confirmed',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  VOUCHER_SENT: { label: 'Voucher Sent', color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  READY:        { label: 'Ready',        color: 'bg-cyan-50 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-500' },
  IN_PROGRESS:  { label: 'In Progress',  color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500 animate-pulse' },
  COMPLETED:    { label: 'Completed',    color: 'bg-slate-50 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
  CANCELLED:    { label: 'Cancelled',    color: 'bg-red-50 text-red-600 border-red-200',          dot: 'bg-red-400' },
};

const TRIP_STATUS: Record<TripStatus, { label: string; color: string }> = {
  UPCOMING:  { label: '🗓 Upcoming',  color: 'bg-blue-50 text-blue-600' },
  ONGOING:   { label: '✈️ Ongoing',   color: 'bg-orange-50 text-orange-600' },
  COMPLETED: { label: '✅ Completed', color: 'bg-slate-50 text-slate-500' },
};

// ── Single booking card ────────────────────────────────────────
function BookingCard({ booking, onDelete }: { booking: Booking; onDelete: (id: string) => void }) {
  const router = useRouter();
  const bStatus = BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.DRAFT;
  const tStatus = booking.tripStatus ? TRIP_STATUS[booking.tripStatus] : null;

  const nights = booking.totalNights ??
    (booking.travelStart && booking.travelEnd
      ? Math.ceil((new Date(booking.travelEnd).getTime() - new Date(booking.travelStart).getTime()) / 86400000)
      : null);

  const paidPct = booking.totalAmount && booking.advancePaid
    ? Math.round((booking.advancePaid / booking.totalAmount) * 100)
    : null;

  return (
    <div
      onClick={() => router.push(`/bookings/${booking.id}`)}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Top status bar */}
      <div className={cn('h-1 w-full shrink-0',
        booking.status === 'CONFIRMED' || booking.status === 'VOUCHER_SENT' ? 'bg-emerald-400' :
        booking.status === 'IN_PROGRESS' ? 'bg-orange-400' :
        booking.status === 'PENDING' || booking.status === 'REQUESTED' ? 'bg-amber-400' :
        booking.status === 'CANCELLED' ? 'bg-red-400' :
        booking.status === 'COMPLETED' ? 'bg-slate-300' : 'bg-slate-200'
      )} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                #{booking.id.slice(-8).toUpperCase()}
              </span>
              {/* Booking status */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 ${bStatus.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${bStatus.dot}`} />
                {bStatus.label}
              </span>
              {/* Trip status */}
              {tStatus && (
                <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${tStatus.color}`}>
                  {tStatus.label}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              {booking.customer.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {booking.customer.phone}
              {booking.customer.email && ` · ${booking.customer.email}`}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
        </div>

        {/* Destination / itinerary */}
        {booking.itinerary?.destination && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{booking.itinerary.destination}</span>
          </div>
        )}

        {/* Tour days label */}
        {booking.tourDays && (
          <div className="text-xs font-semibold text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 w-fit">
            {booking.tourDays}
          </div>
        )}

        {/* Date row */}
        {(booking.travelStart || booking.travelEnd) && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {booking.travelStart ? format(new Date(booking.travelStart), 'dd MMM') : '—'}
              {' → '}
              {booking.travelEnd ? format(new Date(booking.travelEnd), 'dd MMM yyyy') : '—'}
            </span>
            {nights !== null && (
              <span className="ml-auto font-medium text-slate-400">{nights}N</span>
            )}
          </div>
        )}

        {/* Service pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(booking.hotelBookings ?? []).length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
              <Hotel className="h-3 w-3" />
              {(booking.hotelBookings ?? []).length}H
            </div>
          )}
          {(booking.flightBookings ?? []).length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
              <Plane className="h-3 w-3" />
              {(booking.flightBookings ?? []).length}F
            </div>
          )}
          {(booking.transportBookings ?? []).length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
              <Car className="h-3 w-3" />
              {(booking.transportBookings ?? []).length}T
            </div>
          )}
          {(booking.adults || booking.children) && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
              <Users className="h-3 w-3" />
              {(booking.adults ?? 0) + (booking.children ?? 0)} travelers
            </div>
          )}
        </div>

        {/* Payment progress */}
        {paidPct !== null && (
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Payment</span>
              <span className={cn('font-semibold', paidPct >= 100 ? 'text-emerald-600' : 'text-amber-600')}>
                {paidPct}% paid
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', paidPct >= 100 ? 'bg-emerald-400' : 'bg-amber-400')}
                style={{ width: `${Math.min(paidPct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete btn */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(booking.id); }}
        className="absolute top-4 right-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Stats bar ──────────────────────────────────────────────────
function StatsBar({ bookings }: { bookings: Booking[] }) {
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const ongoing = bookings.filter((b) => b.tripStatus === 'ONGOING').length;
  const revenue = bookings.reduce((s, b) => s + (b.totalAmount ?? 0), 0);
  const pending = bookings.filter((b) => b.status === 'PENDING' || b.status === 'DRAFT').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Total Bookings', value: bookings.length, icon: Calendar, iconColor: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
        { label: 'Confirmed',      value: confirmed,       icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Live Trips',     value: ongoing,         icon: Zap,  iconColor: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
        { label: 'Total Revenue',  value: `₹${(revenue / 1000).toFixed(0)}K`, icon: TrendingUp, iconColor: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
      ].map((s) => (
        <div key={s.label} className={`rounded-2xl border ${s.bg} px-4 py-3.5 flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm`}>
            <s.icon className={`h-4.5 w-4.5 ${s.iconColor}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tripFilter, setTripFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (tripFilter !== 'ALL') params.tripStatus = tripFilter;
      const res = await bookingsService.getAll(params);
      setBookings(res.data ?? []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [search, statusFilter, tripFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBookings, 300);
    return () => clearTimeout(t);
  }, [fetchBookings]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await bookingsService.delete(deleteId);
      toast.success('Booking deleted');
      setBookings((p) => p.filter((b) => b.id !== deleteId));
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteId(null); }
  };

  // Group by trip status for ongoing at top
  const ongoing = bookings.filter((b) => b.tripStatus === 'ONGOING');
  const rest = bookings.filter((b) => b.tripStatus !== 'ONGOING');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bookings</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage travel bookings — hotels, flights & transport</p>
          </div>
          <Button
            onClick={() => router.push('/bookings/new')}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>

        {/* Stats */}
        {!loading && bookings.length > 0 && <StatsBar bookings={bookings} />}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white border-slate-200 rounded-xl h-10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {Object.entries(BOOKING_STATUS).map(([v, c]) => (
                <SelectItem key={v} value={v}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tripFilter} onValueChange={setTripFilter}>
            <SelectTrigger className="w-36 bg-white border-slate-200 rounded-xl h-10 text-sm">
              <SelectValue placeholder="Trip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Trips</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Live trips section */}
        {!loading && ongoing.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Live Trips</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoing.map((b) => <BookingCard key={b.id} booking={b} onDelete={setDeleteId} />)}
            </div>
          </div>
        )}

        {/* Main grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : rest.length === 0 && ongoing.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">No bookings found</h3>
            <p className="text-sm text-slate-400 mb-4">
              {search || statusFilter !== 'ALL' || tripFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Create your first booking to get started'}
            </p>
            {!search && statusFilter === 'ALL' && (
              <Button onClick={() => router.push('/bookings/new')} variant="outline" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            )}
          </div>
        ) : (
          <>
            {rest.length > 0 && ongoing.length > 0 && (
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">All Bookings</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((b) => <BookingCard key={b.id} booking={b} onDelete={setDeleteId} />)}
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the booking and all hotels, flights, transport, tasks, and payment records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}