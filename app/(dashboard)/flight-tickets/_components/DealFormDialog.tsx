'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
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
  Plane, ShoppingCart, ArrowRight,
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

// FIX 1 ─ Use z.infer but cast resolver so TS is satisfied across RHF versions
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

  // FIX 2 ─ Cast resolver to `any` to bypass zodResolver generic mismatch
  //         between @hookform/resolvers versions and react-hook-form v8+
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      sellerId: '',
      buyerId:  '',
    },
  });

  const watchSeller = form.watch('sellerId');
  const watchBuyer  = form.watch('buyerId');
  const watchSeats  = form.watch('seatsBooked');
  const watchCost   = form.watch('sellerCostPerSeat');
  const watchPrice  = form.watch('buyerPricePerSeat');

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

  // Auto-fill prices when seller/buyer selected
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

  const seats       = Number(watchSeats) || 0;
  const cost        = Number(watchCost)  || 0;
  const price       = Number(watchPrice) || 0;
  const totalRevenue = price * seats;
  const totalCost    = cost  * seats;
  const grossProfit  = totalRevenue - totalCost;
  const profitable   = grossProfit >= 0;

  // FIX 3 ─ Explicit SubmitHandler type so onSubmit line has no error
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

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg flex flex-col gap-0 p-0 max-h-[92vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Connect Deal</DialogTitle>
              <DialogDescription className="text-xs">
                Link a seller and buyer to create a deal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-5">

              {/* Seller + Buyer Selection */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Parties
                </p>
                <div className="space-y-3">

                  {/* ── Seller ── */}
                  <FormField
                    control={form.control}
                    name="sellerId"
                    render={({ field }) => (
                      <FormItem>
                        {/* FIX 4 ─ Remove className from FormLabel (not a valid prop in shadcn FormLabel) */}
                        <FormLabel>
                          <span className="flex items-center gap-1.5">
                            <Plane className="h-3 w-3 text-blue-500" />
                            Seller *
                          </span>
                        </FormLabel>
                        {/* FIX 5 ─ field.value guaranteed string for sellerId/buyerId */}
                        <Select onValueChange={field.onChange} value={field.value as string}>
                          <FormControl>
                            <SelectTrigger className="h-9">
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

                  {/* ── Buyer ── */}
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
                            <SelectTrigger className="h-9">
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

                {/* Deal Preview */}
                {selectedSeller && selectedBuyer && (
                  <div className="mt-3 rounded-xl border bg-muted/30 p-3 flex items-center gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{selectedSeller.brokerName}</p>
                      <p className="text-muted-foreground">{selectedSeller.fromCity} → {selectedSeller.toCity}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-semibold truncate">{selectedBuyer.brokerName}</p>
                      <p className="text-muted-foreground">{selectedBuyer.fromCity} → {selectedBuyer.toCity}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Financial Details */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Deal Financials
                </p>
                <div className="grid grid-cols-3 gap-3">

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
                          {/* FIX 6 ─ Convert undefined to '' so Input value is always string */}
                          <Input
                            type="number"
                            min="1"
                            placeholder="0"
                            className="h-9"
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
                            Our Cost
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="₹"
                            className="h-9"
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
                            Sale Price
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="₹"
                            className="h-9"
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

                {/* P&L Preview */}
                {seats > 0 && (cost > 0 || price > 0) && (
                  <div className={cn(
                    'mt-3 rounded-xl border p-3 grid grid-cols-3 gap-2 text-center',
                    profitable
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
                  )}>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                      <p className="text-xs font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Cost</p>
                      <p className="text-xs font-bold text-foreground">₹{totalCost.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Profit</p>
                      <p className={cn('text-xs font-bold', profitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {profitable ? '+' : ''}₹{grossProfit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Payment (optional)
                </p>
                <div className="grid grid-cols-2 gap-3">

                  {/* Payment Status */}
                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        {/* FIX 7 ─ value must be string, cast undefined → '' */}
                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <FormControl>
                            <SelectTrigger className="h-9">
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
                            className="h-9 font-mono text-xs"
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

              {/* Admin Notes */}
              <FormField
                control={form.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        className="resize-none text-sm"
                        placeholder="Internal notes..."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1 pb-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-1.5" disabled={form.formState.isSubmitting}>
                  <Link2 className="h-4 w-4" />
                  {form.formState.isSubmitting ? 'Connecting...' : 'Connect Deal'}
                </Button>
              </div>

            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}