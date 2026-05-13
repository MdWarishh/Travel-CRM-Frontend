'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Hotel, Plane, Car,
  LayoutList, Users, IndianRupee, Clock, CalendarDays,
  MessageCircle, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingsService } from '@/services/bookings.service';
import { Booking } from '@/types/booking';
import { toast } from 'sonner';

import { BookingHeader } from '../_components/BookingHeader';
import { HotelSection } from '../_components/HotelSection';
import { FlightSection } from '../_components/FlightSection';
import { TransportSection } from '../_components/TransportSection';
import { BookingPreviewModal } from '../_components/BookingPreviewModal';
import { TasksTab } from '../_components/TasksTab';
import { DaysTab } from '../_components/DaysTab';
import { ShareModal } from '../_components/ShareModal';
import { TravellersTab, PaymentsTab, TimelineTab } from '../_components/BookingTabs';

// ── Tab config ───────────────────────────────────────────────
const TABS = [
  { value: 'overview',   label: 'Overview',   icon: LayoutList },
  { value: 'hotels',     label: 'Hotels',     icon: Hotel },
  { value: 'flights',    label: 'Flights',    icon: Plane },
  { value: 'transport',  label: 'Transport',  icon: Car },
  { value: 'travellers', label: 'Travellers', icon: Users },
  { value: 'payments',   label: 'Payments',   icon: IndianRupee },
  { value: 'tasks',      label: 'Tasks',      icon: LayoutList },
  { value: 'days',       label: 'Day-wise',   icon: CalendarDays },
  { value: 'timeline',   label: 'Timeline',   icon: Clock },
];

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [booking, setBooking]         = useState<Booking | null>(null);
  const [loading, setLoading]         = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [activeTab, setActiveTab]     = useState('overview');

  // ShareModal
  const [shareOpen, setShareOpen]             = useState(false);
  const [shareDefaultTab, setShareDefaultTab] = useState<'whatsapp' | 'email'>('whatsapp');

  const openShare = (tab: 'whatsapp' | 'email') => {
    setShareDefaultTab(tab);
    setShareOpen(true);
  };

  // ── Fetch ─────────────────────────────────────────────────
  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingsService.getById(id);
      setBooking(data);
    } catch {
      toast.error('Failed to load booking');
      // router.push('/bookings');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  // ── PDF ───────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      await bookingsService.downloadVoucher(id);
      toast.success('Voucher downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
    finally { setPdfLoading(false); }
  };

  // ── Partial state updater ─────────────────────────────────
  const updateBooking = (partial: Partial<Booking>) =>
    setBooking((prev) => (prev ? { ...prev, ...partial } : prev));

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
          <p className="text-sm text-slate-400">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

const tasks = booking.tasks ?? [];

const tasksDone  = tasks.filter((t) => t.isCompleted).length;
const tasksTotal = tasks.length;

  const badgeFor = (tab: string): number | string | null => {
    if (tab === 'hotels')     return booking.hotelBookings.length;
    if (tab === 'flights')    return booking.flightBookings.length;
    if (tab === 'transport')  return booking.transportBookings.length;
    if (tab === 'travellers') return booking.travellers?.length ?? 0;
    if (tab === 'payments')   return booking.bookingPayments?.length ?? 0;
    if (tab === 'tasks')      return tasksTotal ? `${tasksDone}/${tasksTotal}` : null;
    if (tab === 'days')       return booking.days?.length ?? 0;
    if (tab === 'timeline')   return booking.logs?.length ?? 0;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between mb-5">
          <Button
            variant="ghost" size="sm"
            onClick={() => router.push('/bookings')}
            className="rounded-xl gap-1.5 text-slate-500 hover:text-slate-900 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            All Bookings
          </Button>

          {/* WhatsApp + Email quick buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => openShare('whatsapp')}
              className="rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white gap-2 h-9 shadow-sm shadow-green-200/60 font-semibold text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button
              onClick={() => openShare('email')}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9 shadow-sm shadow-blue-200/60 font-semibold text-sm"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
          </div>
        </div>

        {/* ── Booking Header ── */}
        <BookingHeader
          booking={booking}
          onUpdate={setBooking}
          onPreview={() => setPreviewOpen(true)}
          onShare={openShare}          // ✅ passes tab arg correctly
          onDownloadPdf={handleDownloadPdf}
          pdfLoading={pdfLoading}
        />

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-1 mb-5 -mx-1 px-1">
            <TabsList className="bg-white border border-slate-100 rounded-2xl p-1 h-auto gap-1 inline-flex min-w-max">
              {TABS.map((tab) => {
                const Icon  = tab.icon;
                const badge = badgeFor(tab.value);
                const show  = badge !== null && badge !== 0;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5
                               data-[state=active]:bg-slate-900 data-[state=active]:text-white
                               data-[state=inactive]:text-slate-500 transition-all whitespace-nowrap"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {tab.label}
                    {show && (
                      <span className="text-[10px] bg-slate-100 data-[state=active]:bg-white/20 rounded-full px-1.5 py-0 font-semibold">
                        {badge}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Overview — all 3 sections in grid */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[500px]">
              <HotelSection
                bookingId={booking.id}
                hotels={booking.hotelBookings}
                onChange={(hotels) => updateBooking({ hotelBookings: hotels })}
              />
              <FlightSection
                bookingId={booking.id}
                flights={booking.flightBookings}
                onChange={(flights) => updateBooking({ flightBookings: flights })}
              />
              <TransportSection
                bookingId={booking.id}
                transports={booking.transportBookings}
                onChange={(transports) => updateBooking({ transportBookings: transports })}
              />
            </div>
          </TabsContent>

          <TabsContent value="hotels">
            <HotelSection
              bookingId={booking.id}
              hotels={booking.hotelBookings}
              onChange={(hotels) => updateBooking({ hotelBookings: hotels })}
            />
          </TabsContent>

          <TabsContent value="flights">
            <FlightSection
              bookingId={booking.id}
              flights={booking.flightBookings}
              onChange={(flights) => updateBooking({ flightBookings: flights })}
            />
          </TabsContent>

          <TabsContent value="transport">
            <TransportSection
              bookingId={booking.id}
              transports={booking.transportBookings}
              onChange={(transports) => updateBooking({ transportBookings: transports })}
            />
          </TabsContent>

          <TabsContent value="travellers">
            <TravellersTab
              bookingId={booking.id}
              travellers={booking.travellers ?? []}
              onChange={(travellers) => updateBooking({ travellers })}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              bookingId={booking.id}
              booking={booking}
              onChange={setBooking}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab
              bookingId={booking.id}
              tasks={booking.tasks ?? []}
              onChange={(tasks) => updateBooking({ tasks })}
            />
          </TabsContent>

          <TabsContent value="days">
            <DaysTab
              bookingId={booking.id}
              days={booking.days ?? []}
              hasItinerary={!!booking.itineraryId}
              travelStart={booking.travelStart ?? undefined}   // ✅ now passed
              onChange={(days) => updateBooking({ days })}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab
              bookingId={booking.id}
              logs={booking.logs ?? []}
              onChange={(logs) => updateBooking({ logs })}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modals ── */}
      {previewOpen && (
        <BookingPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          booking={booking}
          onDownloadPdf={handleDownloadPdf}
          pdfLoading={pdfLoading}
        />
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        booking={booking}
        defaultTab={shareDefaultTab}
      />
    </div>
  );
}