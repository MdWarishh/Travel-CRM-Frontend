'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Link2, TrendingUp, TrendingDown, IndianRupee, Users,
  Plane, ShoppingCart, ArrowRight, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ticketDealService } from '@/services/ticket.service';
import { useTicketSellers, useTicketBuyers } from './useTicketData';
import type { TicketDeal, TicketMatch } from '@/types/ticket.types';
import { DEAL_PAYMENT_STATUS_OPTIONS } from './ticket.constants';

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  sellerId:          z.string().uuid('Select a seller'),
  buyerId:           z.string().uuid('Select a buyer'),
  seatsBooked:       z.coerce.number().int().positive().optional(),
  sellerCostPerSeat: z.coerce.number().nonnegative().optional(),
  buyerPricePerSeat: z.coerce.number().nonnegative().optional(),
  commission:        z.coerce.number().nonnegative().optional(),
  paymentStatus:     z.enum(['PENDING', 'PARTIAL', 'RECEIVED']).optional(),
  paymentRef:        z.string().optional(),
  adminNotes:        z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  prefillMatch?: TicketMatch | null;
  onClose: () => void;
  onSuccess: (deal: TicketDeal) => void;
}

export function DealFormDialog({ open, prefillMatch, onClose, onSuccess }: Props) {
  const { data: sellers = [] } = useTicketSellers();
  const { data: buyers  = [] } = useTicketBuyers();
  const [mounted, setMounted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { sellerId: '', buyerId: '' },
  });

  // Mount animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
    }
  }, [open]);

  // Prefill from match
  useEffect(() => {
    if (prefillMatch && open) {
      form.reset({
        sellerId:          prefillMatch.seller.id,
        buyerId:           prefillMatch.buyer.id,
        seatsBooked:       Math.min(
          prefillMatch.seller.seatsAvailable,
          prefillMatch.buyer.seatsRequired,
        ),
        sellerCostPerSeat: prefillMatch.seller.pricePerSeat,
        buyerPricePerSeat: prefillMatch.buyer.budgetPerSeat,
      });
    } else if (!prefillMatch && open) {
      form.reset({ sellerId: '', buyerId: '' });
    }
  }, [prefillMatch, open]);

  const watchSeller = form.watch('sellerId');
  const watchBuyer  = form.watch('buyerId');
  const watchSeats  = form.watch('seatsBooked');
  const watchCost   = form.watch('sellerCostPerSeat');
  const watchPrice  = form.watch('buyerPricePerSeat');

  // Auto-fill prices
  useEffect(() => {
    if (watchSeller) {
      const seller = sellers.find(s => s.id === watchSeller);
      if (seller && !form.getValues('sellerCostPerSeat')) {
        form.setValue('sellerCostPerSeat', seller.pricePerSeat);
      }
    }
  }, [watchSeller, sellers]);

  useEffect(() => {
    if (watchBuyer) {
      const buyer = buyers.find(b => b.id === watchBuyer);
      if (buyer && !form.getValues('buyerPricePerSeat')) {
        form.setValue('buyerPricePerSeat', buyer.budgetPerSeat);
      }
    }
  }, [watchBuyer, buyers]);

  const selectedSeller = sellers.find(s => s.id === watchSeller);
  const selectedBuyer  = buyers.find(b => b.id === watchBuyer);

  const seats        = Number(watchSeats) || 0;
  const cost         = Number(watchCost)  || 0;
  const price        = Number(watchPrice) || 0;
  const totalRevenue = price * seats;
  const totalCost    = cost  * seats;
  const grossProfit  = totalRevenue - totalCost;
  const profitable   = grossProfit >= 0;
  const profitPct    = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 300);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      const deal = await ticketDealService.connect({
        ...values,
        seatsBooked:       values.seatsBooked       || undefined,
        sellerCostPerSeat: values.sellerCostPerSeat || undefined,
        buyerPricePerSeat: values.buyerPricePerSeat || undefined,
        commission:        values.commission        || undefined,
        paymentStatus:     values.paymentStatus     || undefined,
        paymentRef:        values.paymentRef        || undefined,
        adminNotes:        values.adminNotes        || undefined,
      });
      toast.success('Deal connected!');
      form.reset();
      onSuccess(deal);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to connect deal');
    }
  };

  if (!open) return null;

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
            'relative w-full max-w-2xl h-[90vh] flex flex-col pointer-events-auto',
            'bg-background rounded-2xl shadow-2xl overflow-hidden',
            'transition-all duration-300 ease-out',
            mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          )}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="relative flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">
            {/* Decorative glows */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

            <div className="relative px-6 pt-5 pb-5">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-blue-500/20 border border-blue-400/20 flex-shrink-0">
                    <Link2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Connect Deal</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Link a seller and buyer to create a deal</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 mt-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Seller → Buyer preview (shows when both selected) */}
              {selectedSeller && selectedBuyer ? (
                <div className="flex items-center gap-0 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-500/20 flex-shrink-0">
                      <Plane className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Seller</p>
                      <p className="text-xs font-bold truncate">{selectedSeller.brokerName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{selectedSeller.fromCity} → {selectedSeller.toCity}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-3 justify-end">
                    <div className="min-w-0 text-right">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Buyer</p>
                      <p className="text-xs font-bold truncate">{selectedBuyer.brokerName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{selectedBuyer.fromCity} → {selectedBuyer.toCity}</p>
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-violet-500/20 flex-shrink-0">
                      <ShoppingCart className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-500/20 flex-shrink-0">
                    <Plane className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-400">Select seller & buyer below to preview the deal</p>
                  <div className="ml-auto h-8 w-8 flex items-center justify-center rounded-xl bg-violet-500/20 flex-shrink-0">
                    <ShoppingCart className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                </div>
              )}

              {/* P&L preview strip (shows when financials filled) */}
              {seats > 0 && (cost > 0 || price > 0) && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-blue-300' },
                    { label: 'Cost',    value: `₹${totalCost.toLocaleString('en-IN')}`,    color: 'text-red-300' },
                    { label: 'Profit',  value: `${profitable ? '+' : ''}₹${Math.abs(grossProfit).toLocaleString('en-IN')}`, color: profitable ? 'text-emerald-300' : 'text-red-300' },
                    { label: 'Margin',  value: `${profitPct}%`,                             color: profitable ? 'text-emerald-300' : 'text-red-300' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 px-2 py-2 text-center">
                      <p className={cn('text-xs font-bold tabular-nums', item.color)}>{item.value}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Form Body ──────────────────────────────────────────────────── */}
          <ScrollArea className="flex-1 min-h-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">

                {/* ── PARTIES ──────────────────────────────────────────── */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Parties
                  </p>
                  <div className="grid grid-cols-2 gap-4">

                    {/* Seller */}
                    <FormField
                      control={form.control}
                      name="sellerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center gap-1.5">
                              <Plane className="h-3 w-3 text-blue-500" />
                              Seller *
                            </span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value as string}>
                            <FormControl>
                              <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Select a seller..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sellers.filter(s => s.isActive).map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-xs">{s.brokerName}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {s.fromCity} → {s.toCity} · {s.seatsAvailable}s · ₹{s.pricePerSeat.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Buyer */}
                    <FormField
                      control={form.control}
                      name="buyerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center gap-1.5">
                              <ShoppingCart className="h-3 w-3 text-violet-500" />
                              Buyer *
                            </span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value as string}>
                            <FormControl>
                              <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Select a buyer..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {buyers.filter(b => b.isActive).map(b => (
                                <SelectItem key={b.id} value={b.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-xs">{b.brokerName}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {b.fromCity} → {b.toCity} · {b.seatsRequired}s · ₹{b.budgetPerSeat.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* ── FINANCIALS ───────────────────────────────────────── */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Deal Financials
                  </p>
                  <div className="grid grid-cols-3 gap-4">

                    {/* Seats */}
                    <FormField
                      control={form.control}
                      name="seatsBooked"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Seats
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="0"
                              className="h-10 rounded-xl"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Our Cost */}
                    <FormField
                      control={form.control}
                      name="sellerCostPerSeat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3 text-red-500" />
                              Our Cost/Seat
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="₹"
                              className="h-10 rounded-xl"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sale Price */}
                    <FormField
                      control={form.control}
                      name="buyerPricePerSeat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3 text-emerald-500" />
                              Sale Price/Seat
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="₹"
                              className="h-10 rounded-xl"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Profit preview card */}
                  {seats > 0 && (cost > 0 || price > 0) && (
                    <div className={cn(
                      'mt-4 rounded-2xl border p-4 grid grid-cols-3 gap-3 text-center',
                      profitable
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
                    )}>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                        <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cost</p>
                        <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">₹{totalCost.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Profit</p>
                        <p className={cn('text-sm font-bold tabular-nums mt-0.5 flex items-center justify-center gap-1', profitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                          {profitable
                            ? <TrendingUp className="h-3.5 w-3.5" />
                            : <TrendingDown className="h-3.5 w-3.5" />
                          }
                          {profitable ? '+' : ''}₹{grossProfit.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* ── PAYMENT ──────────────────────────────────────────── */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Payment <span className="normal-case font-normal">(optional)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-4">

                    {/* Payment Status */}
                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                            <FormControl>
                              <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEAL_PAYMENT_STATUS_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Ref */}
                    <FormField
                      control={form.control}
                      name="paymentRef"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Ref</FormLabel>
                          <FormControl>
                            <Input
                              className="h-10 font-mono text-xs rounded-xl"
                              placeholder="TXN123..."
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── ADMIN NOTES ──────────────────────────────────────── */}
                <FormField
                  control={form.control}
                  name="adminNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          className="resize-none text-sm rounded-xl"
                          placeholder="Internal notes..."
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── ACTIONS ──────────────────────────────────────────── */}
                <div className="flex gap-3 pt-1 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl gap-2 font-semibold"
                    disabled={form.formState.isSubmitting}
                  >
                    <Link2 className="h-4 w-4" />
                    {form.formState.isSubmitting ? 'Connecting...' : 'Connect Deal'}
                  </Button>
                </div>

              </form>
            </Form>
          </ScrollArea>

        </div>
      </div>
    </>
  );
}