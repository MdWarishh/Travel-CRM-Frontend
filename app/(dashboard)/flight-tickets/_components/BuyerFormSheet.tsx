'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ticketBuyerService } from '@/services/ticket.service';
import type { TicketBuyer } from '@/types/ticket.types';
import {
  User2, Phone, Mail, MapPin, CalendarDays, Clock, Users,
  IndianRupee, CreditCard, Radio, FileText, Loader2, ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  brokerName:         z.string().min(2, 'Required'),
  phone:              z.string().min(7, 'Valid phone required'),
  email:              z.string().email().optional().or(z.literal('')),
  fromCity:           z.string().min(2, 'Required'),
  toCity:             z.string().min(2, 'Required'),
  preferredTimeFrom:  z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  preferredTimeTo:    z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
travelDate:         z.string().min(1, 'Required'),
seatsRequired:      z.coerce.number().int('Must be a number').positive('Must be positive'),
budgetPerSeat:      z.coerce.number().positive('Must be a number'),
passengerCount:     z.coerce.number().int('Must be a number').positive().optional(),
passengerNames:     z.string().optional(),
agreedPricePerSeat: z.coerce.number().positive('Must be a number').optional(),
totalCollected:     z.coerce.number().min(0, 'Must be a number').optional(),
paymentMethod:      z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
  paymentStatus:      z.enum(['PENDING', 'PARTIAL', 'PAID']).optional(),
  paymentDate:        z.string().optional(),
  paymentRef:         z.string().optional(),
  sourceChannel:      z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
  emailSource:        z.string().optional(),
  notes:              z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_DEFAULTS: Partial<FormValues> = {
  brokerName: '', phone: '', email: '', fromCity: '', toCity: '',
  preferredTimeFrom: '', preferredTimeTo: '', travelDate: '',
  seatsRequired: 1, budgetPerSeat: 0,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open:      boolean;
  buyer:     TicketBuyer | null;
  onClose:   () => void;
  onSuccess: (buyer: TicketBuyer, isNew: boolean) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted border flex-shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-none">{title}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="self-center flex-1 h-px bg-border ml-2" />
    </div>
  );
}

function FieldGroup({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        'grid gap-3',
        cols === 1 && 'grid-cols-1',
        cols === 2 && 'grid-cols-2',
        cols === 3 && 'grid-cols-3',
      )}
    >
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BuyerFormSheet({ open, buyer, onClose, onSuccess }: Props) {
  const isEditing = !!buyer;

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: EMPTY_DEFAULTS,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrl = form.control as any;

  const { isSubmitting } = form.formState;

  // ── Sync form ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (buyer) {
      form.reset({
        brokerName:         buyer.brokerName,
        phone:              buyer.phone,
        email:              buyer.email ?? '',
        fromCity:           buyer.fromCity,
        toCity:             buyer.toCity,
        preferredTimeFrom:  buyer.preferredTimeFrom,
        preferredTimeTo:    buyer.preferredTimeTo,
        travelDate:         buyer.travelDate?.split('T')[0],
        seatsRequired:      buyer.seatsRequired,
        budgetPerSeat:      buyer.budgetPerSeat,
        passengerCount:     buyer.passengerCount,
        passengerNames:     buyer.passengerNames ?? '',
        agreedPricePerSeat: buyer.agreedPricePerSeat,
        totalCollected:     buyer.totalCollected,
        paymentMethod:      buyer.paymentMethod,
        paymentStatus:      buyer.paymentStatus,
        paymentDate:        buyer.paymentDate?.split('T')[0] ?? '',
        paymentRef:         buyer.paymentRef ?? '',
        sourceChannel:      buyer.sourceChannel,
        emailSource:        buyer.emailSource ?? '',
        notes:              buyer.notes ?? '',
      });
    } else {
      form.reset(EMPTY_DEFAULTS);
    }
  }, [buyer, open]); // eslint-disable-line

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    try {
      const clean = <T,>(v: T | '' | undefined): T | undefined =>
        v === '' || v === undefined ? undefined : v;

      const payload: FormValues = {
        ...values,
        email:          clean(values.email),
        passengerNames: clean(values.passengerNames),
        paymentRef:     clean(values.paymentRef),
        emailSource:    clean(values.emailSource),
        notes:          clean(values.notes),
      };

      if (isEditing) {
        const updated = await ticketBuyerService.update(buyer!.id, payload);
        toast.success('Buyer request updated');
        onSuccess(updated, false);
      } else {
        const result = await ticketBuyerService.create(payload);
        toast.success('Buyer request added');
        onSuccess(result.buyer, true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Something went wrong';
      toast.error(message);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      {/*
       * KEY FIX:
       * - max-w-2xl  → centered, wide enough for 2-col grid
       * - flex flex-col → header + scrollable body + footer stacking
       * - max-h-[90vh] → never taller than viewport
       * - p-0 gap-0   → manual padding per section
       * - overflow-hidden → clip rounded corners properly
       */}
      <DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <DialogHeader className="flex-shrink-0 px-6 pt-5 pb-4 border-b bg-gradient-to-br from-violet-500/[0.06] via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/25 flex-shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold tracking-tight">
                {isEditing ? 'Edit Buyer Request' : 'New Buyer Request'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isEditing
                  ? 'Update the buyer request details below'
                  : 'Add a new ticket buyer to the marketplace'}
              </DialogDescription>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="ml-auto text-[10px] font-semibold">
                Editing
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ── Scrollable Form Body ──────────────────────────────────────
         *  overflow-y-auto on this div is what makes scrolling work.
         *  min-h-0 is critical inside a flex column — without it the
         *  browser won't shrink this child and the dialog overflows.
         */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-6" noValidate>

              {/* ── Broker Info ── */}
              <section className="space-y-3.5">
                <SectionHeader
                  icon={User2}
                  title="Broker Info"
                  description="Primary contact details"
                />
                <FieldGroup cols={2}>
                  <FormField
                    control={ctrl}
                    name="brokerName"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Broker Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sunita Verma" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Phone <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input placeholder="9876543210" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input placeholder="broker@email.com" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              </section>

              {/* ── Route & Time ── */}
              <section className="space-y-3.5">
                <SectionHeader
                  icon={MapPin}
                  title="Route & Preferred Time"
                  description="Travel route and timing preferences"
                />
                <FieldGroup cols={2}>
                  <FormField
                    control={ctrl}
                    name="fromCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">From City <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Delhi" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="toCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">To City <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="travelDate"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Travel Date <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input type="date" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="preferredTimeFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Preferred From <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input type="time" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="preferredTimeTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Preferred To <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input type="time" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              </section>

              {/* ── Seats & Budget ── */}
              <section className="space-y-3.5">
                <SectionHeader
                  icon={IndianRupee}
                  title="Seats & Budget"
                  description="Seating requirements and pricing"
                />
                <FieldGroup cols={2}>
                  <FormField
                    control={ctrl}
                    name="seatsRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Seats Required <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="2"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="budgetPerSeat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Budget / Seat (₹) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="3500"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="agreedPricePerSeat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Agreed Price / Seat (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Final negotiated"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="totalCollected"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Total Collected (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Amount received"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              </section>

              {/* ── Passenger Details ── */}
              <section className="space-y-3.5">
                <SectionHeader
                  icon={Users}
                  title="Passenger Details"
                  description="Traveller information"
                />
                <FieldGroup cols={2}>
                  <FormField
                    control={ctrl}
                    name="passengerCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Passenger Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="2"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="sourceChannel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Source Channel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How received" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EMAIL">📧 Email</SelectItem>
                            <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                            <SelectItem value="PHONE">📞 Phone</SelectItem>
                            <SelectItem value="WALK_IN">🚶 Walk-In</SelectItem>
                            <SelectItem value="ONLINE">🌐 Online</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="passengerNames"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Passenger Names</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Comma separated names, e.g. Ramesh, Suresh"
                            rows={2}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              </section>

              {/* ── Payment Info ── */}
              <section className="space-y-3.5">
                <SectionHeader
                  icon={CreditCard}
                  title="Payment Info"
                  description="Transaction and payment details"
                />
                <FieldGroup cols={2}>
                  <FormField
                    control={ctrl}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">⏳ Pending</SelectItem>
                            <SelectItem value="PARTIAL">🔶 Partial</SelectItem>
                            <SelectItem value="PAID">✅ Paid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">💵 Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">🏦 Bank Transfer</SelectItem>
                            <SelectItem value="UPI">📱 UPI</SelectItem>
                            <SelectItem value="CARD">💳 Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ctrl}
                    name="paymentRef"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Transaction Ref</FormLabel>
                        <FormControl>
                          <Input placeholder="UTR / UPI Ref" className="font-mono" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              </section>

              {/* ── Notes ── */}
              <section className="space-y-3.5">
                <SectionHeader
                  icon={FileText}
                  title="Notes"
                  description="Additional remarks or requirements"
                />
                <FormField
                  control={ctrl}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details, special requirements..."
                          rows={3}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </section>

              {/* bottom spacer so last field isn't flush against footer */}
              <div className="pb-1" />

            </form>
          </Form>
        </div>

        {/* ── Sticky Footer ─────────────────────────────────────────────
         *  flex-shrink-0 ensures it never gets squished by the body
         */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t bg-muted/10">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Request'
              : 'Add Request'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}