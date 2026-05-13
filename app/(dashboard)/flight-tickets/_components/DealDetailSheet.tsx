'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Plane, Users, IndianRupee, TrendingUp, TrendingDown, CheckCircle2,
  Ticket, Trash2, Plus, ArrowRight, MessageSquare, Clock, Link2, XCircle,
  CreditCard, Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ticketDealService, ticketPaymentService } from '@/services/ticket.service';
import type { TicketDeal, TicketPayment, DealStatus, UpdateDealPayload } from '@/types/ticket.types';
import { PaymentDialog } from './PaymentDialog';
import { useAuthStore } from '@/store/auth.store';
import { useTicketPermission } from './useTicketPermission';

const STATUS_OPTIONS: { value: DealStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONNECTED', label: 'Connected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  CONNECTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

interface Props {
  deal: TicketDeal | null;
  onClose: () => void;
  onUpdate: (deal: TicketDeal) => void;
  onDelete: (id: string) => void;
}

export function DealDetailSheet({ deal, onClose, onUpdate, onDelete }: Props) {
  const [payments, setPayments] = useState<TicketPayment[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
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

  // Reset form when deal changes
  useEffect(() => {
    if (!deal) return;
    setStatus(deal.status);
    setSeatsBooked(deal.seatsBooked?.toString() ?? '');
    setSellerCost(deal.sellerCostPerSeat?.toString() ?? '');
    setBuyerPrice(deal.buyerPricePerSeat?.toString() ?? '');
    setPaymentStatus(deal.paymentStatus ?? '');
    setBookingConfirmed(deal.bookingConfirmed ?? false);
    setConfirmationRef(deal.confirmationRef ?? '');
    setTicketsSent(deal.ticketsSent ?? false);
    setAdminNotes(deal.adminNotes ?? '');
    fetchPayments(deal.id);
  }, [deal?.id]);

  const fetchPayments = async (dealId: string) => {
    try {
      const data = await ticketPaymentService.getByDeal(dealId);
      setPayments(data);
    } catch {
      // silent
    }
  };

  const totalReceived = payments.filter(p => p.type === 'RECEIVED').reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter(p => p.type === 'PAID').reduce((s, p) => s + p.amount, 0);

  const seats = Number(seatsBooked) || 0;
  const cost = Number(sellerCost) || 0;
  const price = Number(buyerPrice) || 0;
  const totalRevenue = price * seats;
  const totalCost = cost * seats;
  const grossProfit = totalRevenue - totalCost;

  const handleSave = async () => {
    if (!deal || !canEdit) return;
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
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to update deal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deal) return;
    try {
      await ticketDealService.delete(deal.id);
      toast.success('Deal deleted');
      onDelete(deal.id);
    } catch {
      toast.error('Failed to delete deal');
    }
  };

  const handlePaymentAdded = (payment: TicketPayment) => {
    setPayments(prev => [payment, ...prev]);
    setPaymentOpen(false);
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await ticketPaymentService.delete(paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      toast.success('Payment removed');
    } catch {
      toast.error('Failed to remove payment');
    }
  };

  const handleWhatsApp = async (role: 'seller' | 'buyer') => {
    if (!deal) return;
    try {
      const result = await ticketDealService.getWhatsAppLink(deal.id, role);
      window.open(result.whatsappUrl, '_blank');
    } catch {
      toast.error('Could not generate WhatsApp link');
    }
  };

  if (!deal) return null;

  return (
    <>
      <Sheet open={!!deal} onOpenChange={v => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Deal Detail</SheetTitle>
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full', STATUS_COLOR[deal.status])}>
                {deal.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{deal.seller.fromCity}</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{deal.seller.toCity}</span>
              <span className="ml-2">{format(new Date(deal.seller.travelDate), 'dd MMM yyyy')}</span>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-5">

              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3 space-y-1.5 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Seller</p>
                  <p className="text-sm font-semibold">{deal.seller.brokerName}</p>
                  <a
                    href={`tel:${deal.seller.phone}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-3 w-3" /> {deal.seller.phone}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {deal.seller.departureTime} · {deal.seller.seatsAvailable} seats
                  </p>
                  <p className="text-xs font-medium">₹{deal.seller.pricePerSeat.toLocaleString('en-IN')}/seat</p>
                  {isAdminOrManager && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-6 text-[10px] mt-1 border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => handleWhatsApp('seller')}
                    >
                      <MessageSquare className="h-2.5 w-2.5 mr-1" /> WhatsApp
                    </Button>
                  )}
                </div>

                <div className="rounded-xl border p-3 space-y-1.5 bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800">
                  <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Buyer</p>
                  <p className="text-sm font-semibold">{deal.buyer.brokerName}</p>
                  <a
                    href={`tel:${deal.buyer.phone}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-3 w-3" /> {deal.buyer.phone}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {deal.buyer.preferredTimeFrom}–{deal.buyer.preferredTimeTo} · {deal.buyer.seatsRequired} seats
                  </p>
                  <p className="text-xs font-medium">₹{deal.buyer.budgetPerSeat.toLocaleString('en-IN')}/seat</p>
                  {isAdminOrManager && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-6 text-[10px] mt-1 border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => handleWhatsApp('buyer')}
                    >
                      <MessageSquare className="h-2.5 w-2.5 mr-1" /> WhatsApp
                    </Button>
                  )}
                </div>
              </div>

              {/* P&L Summary */}
              {seats > 0 && (
                <div className={cn(
                  'rounded-xl border p-3',
                  grossProfit >= 0
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                )}>
                  <div className="flex items-center gap-1.5 mb-2">
                    {grossProfit >= 0
                      ? <TrendingUp className="h-4 w-4 text-emerald-600" />
                      : <TrendingDown className="h-4 w-4 text-red-600" />
                    }
                    <p className="text-xs font-semibold">P&L Preview ({seats} seats)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                      <p className="text-sm font-semibold text-emerald-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Cost</p>
                      <p className="text-sm font-semibold text-red-600">₹{totalCost.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Profit</p>
                      <p className={cn('text-sm font-bold', grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                        ₹{Math.abs(grossProfit).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Edit Form */}
              {canEdit && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Update Deal</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={status} onValueChange={v => setStatus(v as DealStatus)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(o => (
                            <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Seats Booked</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        placeholder="e.g. 4"
                        value={seatsBooked}
                        onChange={e => setSeatsBooked(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Seller Cost/Seat (₹)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        placeholder="What we pay seller"
                        value={sellerCost}
                        onChange={e => setSellerCost(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Buyer Price/Seat (₹)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        placeholder="What we charge buyer"
                        value={buyerPrice}
                        onChange={e => setBuyerPrice(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Payment Status</Label>
                      <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                          <SelectItem value="PARTIAL" className="text-xs">Partial</SelectItem>
                          <SelectItem value="RECEIVED" className="text-xs">Received</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Confirmation Ref</Label>
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder="Booking ref / PNR"
                        value={confirmationRef}
                        onChange={e => setConfirmationRef(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="booking-confirmed"
                        checked={bookingConfirmed}
                        onCheckedChange={setBookingConfirmed}
                      />
                      <Label htmlFor="booking-confirmed" className="text-xs cursor-pointer">Booking Confirmed</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="tickets-sent"
                        checked={ticketsSent}
                        onCheckedChange={setTicketsSent}
                      />
                      <Label htmlFor="tickets-sent" className="text-xs cursor-pointer">Tickets Sent</Label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Admin Notes</Label>
                    <Textarea
                      rows={2}
                      className="text-xs resize-none"
                      placeholder="Internal notes..."
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              <Separator />

              {/* Payment Ledger */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Ledger</p>
                  {canEdit && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setPaymentOpen(true)}>
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  )}
                </div>

                {/* Cash summary */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg border p-2 text-center bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <p className="text-[10px] text-muted-foreground">Received from Buyer</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{totalReceived.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2 text-center bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <p className="text-[10px] text-muted-foreground">Paid to Seller</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Payment list */}
                {payments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CreditCard className="h-6 w-6 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {payments.map(payment => (
                      <div
                        key={payment.id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border p-2.5 text-xs',
                          payment.type === 'RECEIVED'
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        )}
                      >
                        <CreditCard className={cn('h-3.5 w-3.5 flex-shrink-0', payment.type === 'RECEIVED' ? 'text-emerald-600' : 'text-red-600')} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('font-semibold', payment.type === 'RECEIVED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')}>
                              {payment.type === 'RECEIVED' ? '+' : '-'}₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-muted-foreground">{payment.method}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                            <span>{format(new Date(payment.paidAt), 'dd MMM yyyy')}</span>
                            {payment.reference && <span className="font-mono">· {payment.reference}</span>}
                            {payment.notes && <span className="truncate">· {payment.notes}</span>}
                          </div>
                        </div>
                        {isAdminOrManager && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Net cash */}
              {payments.length > 0 && (
                <div className={cn(
                  'rounded-xl border p-3 text-center',
                  (totalReceived - totalPaid) >= 0
                    ? 'border-emerald-200 dark:border-emerald-800'
                    : 'border-red-200 dark:border-red-800'
                )}>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Net Cash Position</p>
                  <p className={cn('text-base font-bold', (totalReceived - totalPaid) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                    ₹{(totalReceived - totalPaid).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {/* Danger Zone */}
              {canDelete && (
                <>
                  <Separator />
                  <div className="pb-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete Deal
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Add Payment Dialog */}
      {deal && (
        <PaymentDialog
          open={paymentOpen}
          dealId={deal.id}
          onClose={() => setPaymentOpen(false)}
          onSuccess={handlePaymentAdded}
        />
      )}

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deal between {deal?.seller.brokerName} and {deal?.buyer.brokerName}.
              All associated payments will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}