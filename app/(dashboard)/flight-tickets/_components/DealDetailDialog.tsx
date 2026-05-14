'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plane, ShoppingCart, IndianRupee, TrendingUp, TrendingDown,
  CheckCircle2, Ticket, Trash2, Plus, ArrowRight, Clock,
  CreditCard, Phone, Mail, Users,
  Calendar, Hash, Tag, MessageSquare, Zap, Building2,
  ArrowDownCircle, ArrowUpCircle, X, Edit3, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ticketDealService, ticketPaymentService } from '@/services/ticket.service';
import type { TicketDeal, TicketPayment, DealStatus, UpdateDealPayload } from '@/types/ticket.types';
import { PaymentDialog } from './PaymentDialog';
import { useAuthStore } from '@/store/auth.store';
import { useTicketPermission } from './useTicketPermission';
import { DEAL_STATUS_CONFIG, DEAL_PAYMENT_STATUS_OPTIONS } from './ticket.constants';

// ─── Info Row ────────────────────────────────────────────────────────────────
function Row({ icon: Icon, label, value, mono = false, accent }: {
  icon: React.ElementType; label: string; value: React.ReactNode; mono?: boolean; accent?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-[90px] flex-shrink-0 leading-tight">{label}</span>
      <span className={cn('text-xs font-medium flex-1 leading-tight', mono && 'font-mono', accent)}>{value}</span>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className={cn('rounded-2xl border p-3.5 text-center', bg)}>
      <p className={cn('text-base font-bold tabular-nums', color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

interface Props {
  deal: TicketDeal | null;
  onClose: () => void;
  onUpdate: (deal: TicketDeal) => void;
  onDelete: (id: string) => void;
}

const STATUS_OPTIONS: { value: DealStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONNECTED', label: 'Connected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: Zap },
  { id: 'seller', label: 'Seller', icon: Plane },
  { id: 'buyer', label: 'Buyer', icon: ShoppingCart },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'edit', label: 'Edit', icon: Edit3 },
] as const;

type TabId = typeof TABS[number]['id'];

export function DealDetailDialog({ deal, onClose, onUpdate, onDelete }: Props) {
  const [payments, setPayments] = useState<TicketPayment[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mounted, setMounted] = useState(false);

  // Edit fields
  const [status, setStatus] = useState<DealStatus>('PENDING');
  const [seatsBooked, setSeatsBooked] = useState('');
  const [sellerCost, setSellerCost] = useState('');
  const [buyerPrice, setBuyerPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationRef, setConfirmationRef] = useState('');
  const [ticketsSent, setTicketsSent] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const { user } = useAuthStore();
  const { can } = useTicketPermission();
  const canEdit = can('canEditDeals');
  const canDelete = can('canDeleteDeals');
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    if (deal) {
      setMounted(true);
    }
  }, [deal]);

  useEffect(() => {
    if (!deal) { setMounted(false); return; }
    setStatus(deal.status);
    setSeatsBooked(deal.seatsBooked?.toString() ?? '');
    setSellerCost(deal.sellerCostPerSeat?.toString() ?? '');
    setBuyerPrice(deal.buyerPricePerSeat?.toString() ?? '');
    setPaymentStatus(deal.paymentStatus ?? '');
    setBookingConfirmed(deal.bookingConfirmed ?? false);
    setConfirmationRef(deal.confirmationRef ?? '');
    setTicketsSent(deal.ticketsSent ?? false);
    setAdminNotes(deal.adminNotes ?? '');
    setActiveTab('overview');
    ticketPaymentService.getByDeal(deal.id)
      .then(setPayments)
      .catch(() => {});
  }, [deal?.id]);

  if (!deal) return null;

  const seats = Number(seatsBooked) || deal.seatsBooked || 0;
  const cost = Number(sellerCost) || deal.sellerCostPerSeat || 0;
  const price = Number(buyerPrice) || deal.buyerPricePerSeat || 0;
  const totalRevenue = price * seats;
  const totalCost = cost * seats;
  const grossProfit = totalRevenue - totalCost;
  const profitPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalReceived = payments.filter(p => p.type === 'RECEIVED').reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter(p => p.type === 'PAID').reduce((s, p) => s + p.amount, 0);
  const netCash = totalReceived - totalPaid;

  const statusCfg = DEAL_STATUS_CONFIG[deal.status];

  const visibleTabs = TABS.filter(t => t.id !== 'edit' || canEdit);

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const payload: UpdateDealPayload = {
        status,
        seatsBooked: seats || undefined,
        sellerCostPerSeat: cost || undefined,
        buyerPricePerSeat: price || undefined,
        paymentStatus: (paymentStatus as any) || undefined,
        bookingConfirmed,
        confirmationRef: confirmationRef || undefined,
        ticketsSent,
        adminNotes: adminNotes || undefined,
        totalRevenue: totalRevenue || undefined,
        totalCost: totalCost || undefined,
        grossProfit: seats > 0 ? grossProfit : undefined,
      };
      const updated = await ticketDealService.update(deal.id, payload);
      toast.success('Deal updated');
      onUpdate(updated);
      setActiveTab('overview');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to update deal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await ticketDealService.delete(deal.id);
      toast.success('Deal deleted');
      onDelete(deal.id);
    } catch {
      toast.error('Failed to delete deal');
    }
  };

  const handleWhatsApp = async (role: 'seller' | 'buyer') => {
    try {
      const result = await ticketDealService.getWhatsAppLink(deal.id, role);
      window.open(result.whatsappUrl, '_blank');
    } catch {
      toast.error('Could not generate WhatsApp link');
    }
  };

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          mounted ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
      />

      {/* ── Centered Modal ───────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div
        className={cn(
          'relative w-full max-w-3xl h-[90vh] flex flex-col pointer-events-auto',
          'bg-background rounded-2xl shadow-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="relative flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative px-5 pt-5 pb-4">
            {/* Top row: route + close */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                {/* Status badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className={cn(
                    'text-[10px] font-semibold px-2.5 py-1 rounded-full border',
                    {
                      'bg-amber-500/20 border-amber-400/40 text-amber-300': deal.status === 'PENDING',
                      'bg-blue-500/20 border-blue-400/40 text-blue-300': deal.status === 'CONNECTED',
                      'bg-emerald-500/20 border-emerald-400/40 text-emerald-300': deal.status === 'COMPLETED',
                      'bg-red-500/20 border-red-400/40 text-red-300': deal.status === 'REJECTED',
                    }
                  )}>
                    {statusCfg.label}
                  </span>
                  {deal.bookingConfirmed && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Confirmed
                    </span>
                  )}
                  {deal.ticketsSent && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center gap-1">
                      <Ticket className="h-2.5 w-2.5" /> Sent
                    </span>
                  )}
                </div>
                {/* Route */}
                <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                  <span>{deal.seller.fromCity}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{deal.seller.toCity}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {format(new Date(deal.seller.travelDate), 'EEE, dd MMM yyyy')}
                  {deal.seller.airline && ` · ${deal.seller.airline}`}
                  {deal.seller.flightNumber && ` ${deal.seller.flightNumber}`}
                </p>
              </div>

              {/* P&L pill */}
              {seats > 0 && (cost > 0 || price > 0) && (
                <div className={cn(
                  'flex-shrink-0 rounded-2xl px-3.5 py-2.5 text-right border',
                  grossProfit >= 0
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                )}>
                  <p className={cn('text-lg font-bold tabular-nums', grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {grossProfit >= 0 ? '+' : ''}₹{Math.abs(grossProfit).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400">{profitPct}% · {seats}s</p>
                </div>
              )}

              <button
                onClick={handleClose}
                className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Seller → Buyer card */}
            <div className="flex items-center gap-0 rounded-2xl bg-white/5 border border-white/10 overflow-hidden mb-3">
              {/* Seller */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-500/20 flex-shrink-0">
                  <Plane className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Seller</p>
                  <p className="text-xs font-bold truncate">{deal.seller.brokerName}</p>
                </div>
              </div>
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </div>
              {/* Buyer */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 justify-end">
                <div className="min-w-0 text-right">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Buyer</p>
                  <p className="text-xs font-bold truncate">{deal.buyer.brokerName}</p>
                </div>
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-violet-500/20 flex-shrink-0">
                  <ShoppingCart className="h-3.5 w-3.5 text-violet-400" />
                </div>
              </div>
            </div>

            {/* Financial stats row */}
            {seats > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-blue-300' },
                  { label: 'Cost', value: `₹${totalCost.toLocaleString('en-IN')}`, color: 'text-red-300' },
                  { label: 'Cash In', value: `₹${totalReceived.toLocaleString('en-IN')}`, color: 'text-emerald-300' },
                  { label: 'Cash Out', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'text-amber-300' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 px-2 py-2 text-center">
                    <p className={cn('text-xs font-bold tabular-nums', item.color)}>{item.value}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {isAdminOrManager && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[11px] gap-1.5 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white flex-1"
                  onClick={() => handleWhatsApp('seller')}
                >
                  <MessageSquare className="h-3 w-3 text-green-400" />
                  WA Seller
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[11px] gap-1.5 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white flex-1"
                  onClick={() => handleWhatsApp('buyer')}
                >
                  <MessageSquare className="h-3 w-3 text-green-400" />
                  WA Buyer
                </Button>
                {canDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[11px] gap-1.5 bg-transparent border-red-400/40 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex border-b bg-background flex-shrink-0 overflow-x-auto scrollbar-hide">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const count = tab.id === 'payments' && payments.length > 0 ? payments.length : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {count && (
                  <span className="ml-0.5 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────────── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">

            {/* ── OVERVIEW ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border bg-card p-4 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deal Info</p>
                    <Row icon={Calendar} label="Travel Date" value={format(new Date(deal.seller.travelDate), 'dd MMM yyyy')} />
                    <Row icon={Clock} label="Departure" value={deal.seller.departureTime} />
                    {deal.seller.pnr && <Row icon={Hash} label="PNR" value={deal.seller.pnr} mono />}
                    {deal.seller.airline && (
                      <Row icon={Plane} label="Airline" value={`${deal.seller.airline}${deal.seller.flightNumber ? ` · ${deal.seller.flightNumber}` : ''}`} />
                    )}
                    {deal.seatsBooked && <Row icon={Users} label="Seats" value={`${deal.seatsBooked} booked`} />}
                    {deal.confirmationRef && <Row icon={Tag} label="Confirm Ref" value={deal.confirmationRef} mono />}
                  </div>

                  <div className="rounded-2xl border bg-card p-4 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">P&L</p>
                    {cost > 0 && <Row icon={IndianRupee} label="Our Cost" value={`₹${cost.toLocaleString('en-IN')}/seat`} accent="text-red-600 dark:text-red-400" />}
                    {price > 0 && <Row icon={IndianRupee} label="Sale Price" value={`₹${price.toLocaleString('en-IN')}/seat`} accent="text-blue-600 dark:text-blue-400" />}
                    {seats > 0 && cost > 0 && price > 0 && (
                      <>
                        <Separator />
                        <Row
                          icon={grossProfit >= 0 ? TrendingUp : TrendingDown}
                          label="Gross Profit"
                          value={`${grossProfit >= 0 ? '+' : ''}₹${grossProfit.toLocaleString('en-IN')}`}
                          accent={grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                        />
                        <Row icon={Zap} label="Margin" value={`${profitPct}%`} />
                      </>
                    )}
                    {deal.paymentStatus && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3 py-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground w-[90px]">Payment</span>
                          <span className={cn('text-xs font-semibold', {
                            'text-amber-600': deal.paymentStatus === 'PENDING',
                            'text-blue-600': deal.paymentStatus === 'PARTIAL',
                            'text-emerald-600': deal.paymentStatus === 'RECEIVED',
                          })}>
                            {deal.paymentStatus}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Net cash */}
                {payments.length > 0 && (
                  <div className={cn(
                    'rounded-2xl border p-4 flex items-center justify-between',
                    netCash >= 0
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                  )}>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Cash Position</p>
                      <p className={cn('text-2xl font-bold mt-0.5 tabular-nums', netCash >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {netCash >= 0 ? '+' : ''}₹{netCash.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground space-y-1">
                      <p>In: <span className="font-semibold text-emerald-600">₹{totalReceived.toLocaleString('en-IN')}</span></p>
                      <p>Out: <span className="font-semibold text-red-600">₹{totalPaid.toLocaleString('en-IN')}</span></p>
                    </div>
                  </div>
                )}

                {deal.adminNotes && (
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Admin Notes</p>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">{deal.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── SELLER ───────────────────────────────────────────────── */}
            {activeTab === 'seller' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 rounded-2xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
                    <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{deal.seller.brokerName}</p>
                    <p className="text-xs text-muted-foreground">{deal.seller.fromCity} → {deal.seller.toCity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Contact</p>
                    <Row icon={Phone} label="Phone" value={deal.seller.phone} />
                    {deal.seller.email && <Row icon={Mail} label="Email" value={deal.seller.email} />}
                  </div>
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Ticket</p>
                    <Row icon={Clock} label="Time" value={`${deal.seller.departureTime} – ${deal.seller.arrivalTime}`} />
                    <Row icon={Users} label="Seats" value={`${deal.seller.seatsAvailable} avail`} />
                    <Row icon={IndianRupee} label="Price" value={`₹${deal.seller.pricePerSeat.toLocaleString('en-IN')}`} />
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Booking Info</p>
                  <div className="grid grid-cols-2 gap-x-4">
                    {deal.seller.airline && <Row icon={Plane} label="Airline" value={deal.seller.airline} />}
                    {deal.seller.flightNumber && <Row icon={Plane} label="Flight" value={deal.seller.flightNumber} mono />}
                    {deal.seller.pnr && <Row icon={Hash} label="PNR" value={deal.seller.pnr} mono />}
                    {deal.seller.bookingRef && <Row icon={Tag} label="Ref" value={deal.seller.bookingRef} mono />}
                    {deal.seller.ticketClass && <Row icon={Ticket} label="Class" value={deal.seller.ticketClass} />}
                  </div>
                </div>

                {(deal.seller.purchasePrice || deal.seller.purchasedFrom) && (
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Purchase Tracking</p>
                    {deal.seller.purchasePrice && (
                      <Row icon={IndianRupee} label="Our Cost" value={`₹${deal.seller.purchasePrice.toLocaleString('en-IN')}/seat`} />
                    )}
                    {deal.seller.purchasedFrom && <Row icon={Building2} label="Source" value={deal.seller.purchasedFrom} />}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 h-10 rounded-xl"
                  onClick={() => handleWhatsApp('seller')}
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Seller on WhatsApp
                </Button>
              </div>
            )}

            {/* ── BUYER ────────────────────────────────────────────────── */}
            {activeTab === 'buyer' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 rounded-2xl border bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800">
                  <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex-shrink-0">
                    <ShoppingCart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{deal.buyer.brokerName}</p>
                    <p className="text-xs text-muted-foreground">{deal.buyer.fromCity} → {deal.buyer.toCity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Contact</p>
                    <Row icon={Phone} label="Phone" value={deal.buyer.phone} />
                    {deal.buyer.email && <Row icon={Mail} label="Email" value={deal.buyer.email} />}
                  </div>
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Request</p>
                    <Row icon={Clock} label="Time" value={`${deal.buyer.preferredTimeFrom} – ${deal.buyer.preferredTimeTo}`} />
                    <Row icon={Users} label="Needs" value={`${deal.buyer.seatsRequired} seats`} />
                    <Row icon={IndianRupee} label="Budget" value={`₹${deal.buyer.budgetPerSeat.toLocaleString('en-IN')}`} />
                  </div>
                </div>

                {(deal.buyer.passengerCount || deal.buyer.passengerNames) && (
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Passengers</p>
                    {deal.buyer.passengerCount && <Row icon={Users} label="Count" value={`${deal.buyer.passengerCount}`} />}
                    {deal.buyer.passengerNames && <Row icon={Users} label="Names" value={deal.buyer.passengerNames} />}
                  </div>
                )}

                {(deal.buyer.agreedPricePerSeat || deal.buyer.totalCollected || deal.buyer.paymentRef) && (
                  <div className="rounded-2xl border bg-card p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Payment Collected</p>
                    {deal.buyer.agreedPricePerSeat && (
                      <Row icon={IndianRupee} label="Agreed" value={`₹${deal.buyer.agreedPricePerSeat.toLocaleString('en-IN')}/seat`} />
                    )}
                    {deal.buyer.totalCollected && (
                      <Row icon={CreditCard} label="Collected" value={`₹${deal.buyer.totalCollected.toLocaleString('en-IN')}`} accent="text-emerald-600 dark:text-emerald-400" />
                    )}
                    {deal.buyer.paymentRef && <Row icon={Tag} label="Ref" value={deal.buyer.paymentRef} mono />}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 h-10 rounded-xl"
                  onClick={() => handleWhatsApp('buyer')}
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Buyer on WhatsApp
                </Button>
              </div>
            )}

            {/* ── PAYMENTS ─────────────────────────────────────────────── */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="Received"
                    value={`₹${totalReceived.toLocaleString('en-IN')}`}
                    color="text-emerald-600 dark:text-emerald-400"
                    bg="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  />
                  <StatCard
                    label="Paid Out"
                    value={`₹${totalPaid.toLocaleString('en-IN')}`}
                    color="text-red-600 dark:text-red-400"
                    bg="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                  />
                  <StatCard
                    label="Net"
                    value={`₹${Math.abs(netCash).toLocaleString('en-IN')}`}
                    color={netCash >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}
                    bg={netCash >= 0
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'}
                  />
                </div>

                {canEdit && (
                  <Button
                    variant="outline"
                    className="w-full gap-1.5 h-10 rounded-xl"
                    onClick={() => setPaymentOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Payment Entry
                  </Button>
                )}

                {payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-15" />
                    <p className="text-sm font-medium">No payments recorded yet</p>
                    <p className="text-xs opacity-60 mt-1">Add a payment entry to track cash flow</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div
                        key={p.id}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl border p-3.5',
                          p.type === 'RECEIVED'
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        )}
                      >
                        {p.type === 'RECEIVED'
                          ? <ArrowDownCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          : <ArrowUpCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-bold tabular-nums', p.type === 'RECEIVED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')}>
                              {p.type === 'RECEIVED' ? '+' : '-'}₹{p.amount.toLocaleString('en-IN')}
                            </span>
                            {p.method && (
                              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
                                {p.method}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>{format(new Date(p.paidAt), 'dd MMM yyyy')}</span>
                            {p.reference && <span className="font-mono">· {p.reference}</span>}
                            {p.notes && <span className="truncate">· {p.notes}</span>}
                          </div>
                        </div>
                        {isAdminOrManager && (
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                            onClick={async () => {
                              await ticketPaymentService.delete(p.id);
                              setPayments(prev => prev.filter(x => x.id !== p.id));
                              toast.success('Payment removed');
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── EDIT ─────────────────────────────────────────────────── */}
            {activeTab === 'edit' && canEdit && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Deal Status</Label>
                    <Select value={status} onValueChange={v => setStatus(v as DealStatus)}>
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_PAYMENT_STATUS_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Financials</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Seats Booked', val: seatsBooked, set: setSeatsBooked },
                      { label: 'Our Cost/Seat (₹)', val: sellerCost, set: setSellerCost },
                      { label: 'Sale Price/Seat (₹)', val: buyerPrice, set: setBuyerPrice },
                    ].map(f => (
                      <div key={f.label} className="space-y-1.5">
                        <Label className="text-xs">{f.label}</Label>
                        <Input
                          type="number"
                          className="h-9 text-xs rounded-xl"
                          value={f.val}
                          onChange={e => f.set(e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  {seats > 0 && cost > 0 && price > 0 && (
                    <div className={cn(
                      'mt-3 rounded-2xl border p-3.5 flex items-center justify-between',
                      grossProfit >= 0
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                    )}>
                      <p className="text-xs text-muted-foreground">Projected Profit</p>
                      <p className={cn('text-sm font-bold tabular-nums', grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {grossProfit >= 0 ? '+' : ''}₹{grossProfit.toLocaleString('en-IN')} ({profitPct}%)
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Booking Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-2xl border p-3.5">
                      <Label htmlFor="confirmed" className="text-xs cursor-pointer">Booking Confirmed</Label>
                      <Switch id="confirmed" checked={bookingConfirmed} onCheckedChange={setBookingConfirmed} />
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border p-3.5">
                      <Label htmlFor="tickets-sent" className="text-xs cursor-pointer">Tickets Sent</Label>
                      <Switch id="tickets-sent" checked={ticketsSent} onCheckedChange={setTicketsSent} />
                    </div>
                  </div>
                  {bookingConfirmed && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Confirmation Reference</Label>
                      <Input
                        className="h-9 text-xs font-mono rounded-xl"
                        placeholder="Confirm Ref..."
                        value={confirmationRef}
                        onChange={e => setConfirmationRef(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Admin Notes</Label>
                  <Textarea
                    rows={3}
                    className="text-xs resize-none rounded-xl"
                    placeholder="Internal notes..."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full h-11 rounded-xl font-semibold"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}

          </div>
        </ScrollArea>
      </div>
      </div>

      {/* ── Payment Dialog ──────────────────────────────────────────────── */}
      <PaymentDialog
        open={paymentOpen}
        dealId={deal.id}
        onClose={() => setPaymentOpen(false)}
        onSuccess={p => { setPayments(prev => [p, ...prev]); setPaymentOpen(false); }}
      />

      {/* ── Delete Confirm ──────────────────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deal between <strong>{deal.seller.brokerName}</strong> and <strong>{deal.buyer.brokerName}</strong>. All payments will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete Deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}