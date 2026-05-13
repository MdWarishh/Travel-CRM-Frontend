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
import { ticketSellerService } from '@/services/ticket.service';
import type { CreateSellerPayload, TicketSeller } from '@/types/ticket.types';
import {
  Plane, Phone, Mail, MapPin, CalendarDays, Clock,
  IndianRupee, CreditCard, Tag, Hash, Building2, Radio,
  FileText, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Schema ────────────────────────────────────────────────────────────────────
// Only truly required fields are strict. Everything else uses .optional()
// so the form saves without errors even if left blank.

const schema = z.object({
  // ── Required ──
  brokerName:    z.string().min(2, 'Broker name required'),
  phone:         z.string().min(7, 'Valid phone required'),
  fromCity:      z.string().min(2, 'From city required'),
  toCity:        z.string().min(2, 'To city required'),
  travelDate:    z.string().min(1, 'Travel date required'),
  seatsAvailable: z.coerce.number().int().min(1, 'At least 1 seat'),
  pricePerSeat:  z.coerce.number().min(0, 'Price required'),

  // ── Optional — no errors if empty ──
  email:         z.string().email('Invalid email').optional().or(z.literal('')),
  departureTime: z.string().optional().or(z.literal('')),
  arrivalTime:   z.string().optional().or(z.literal('')),
  airline:       z.string().optional(),
  flightNumber:  z.string().optional(),
  bookingRef:    z.string().optional(),
  pnr:           z.string().optional(),
  ticketClass:   z.enum(['ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal('')),
  purchasedFrom: z.string().optional(),
  purchasedAt:   z.string().optional(),
  sourceChannel: z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
  emailSource:   z.string().optional(),
  notes:         z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_DEFAULTS: Partial<FormValues> = {
  brokerName: '', phone: '', email: '',
  fromCity: '', toCity: '',
  departureTime: '', arrivalTime: '', travelDate: '',
  seatsAvailable: 1, pricePerSeat: 0,
  airline: '', flightNumber: '', bookingRef: '', pnr: '',
  purchasedFrom: '', emailSource: '', notes: '',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open:      boolean;
  seller:    TicketSeller | null;
  onClose:   () => void;
  onSuccess: (seller: TicketSeller, isNew: boolean) => void;
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
    <div className={cn('grid gap-3', cols === 1 && 'grid-cols-1', cols === 2 && 'grid-cols-2', cols === 3 && 'grid-cols-3')}>
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SellerFormSheet({ open, seller, onClose, onSuccess }: Props) {
  const isEditing = !!seller;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const { isSubmitting } = form.formState;

  // ── Sync form when seller changes ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (seller) {
      form.reset({
        brokerName:    seller.brokerName,
        phone:         seller.phone,
        email:         seller.email ?? '',
        fromCity:      seller.fromCity,
        toCity:        seller.toCity,
        departureTime: seller.departureTime ?? '',
        arrivalTime:   seller.arrivalTime ?? '',
        travelDate:    seller.travelDate?.split('T')[0] ?? '',
        seatsAvailable: seller.seatsAvailable,
        pricePerSeat:  seller.pricePerSeat,
        airline:       seller.airline ?? '',
        flightNumber:  seller.flightNumber ?? '',
        bookingRef:    seller.bookingRef ?? '',
        ticketClass:   seller.ticketClass,
        pnr:           seller.pnr ?? '',
        purchasePrice: seller.purchasePrice ?? '',
        purchasedFrom: seller.purchasedFrom ?? '',
        purchasedAt:   seller.purchasedAt?.split('T')[0] ?? '',
        sourceChannel: seller.sourceChannel,
        emailSource:   seller.emailSource ?? '',
        notes:         seller.notes ?? '',
      });
    } else {
      form.reset(EMPTY_DEFAULTS);
    }
  }, [seller, open]); // eslint-disable-line

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    try {
      // Clean empty strings → undefined so backend doesn't get garbage
      const clean = <T,>(v: T | '' | undefined): T | undefined =>
        v === '' || v === undefined ? undefined : v;

      const payload: CreateSellerPayload= {
        ...values,
        email:         clean(values.email),
        departureTime: clean(values.departureTime),
        arrivalTime:   clean(values.arrivalTime),
        airline:       clean(values.airline),
        flightNumber:  clean(values.flightNumber),
        bookingRef:    clean(values.bookingRef),
        pnr:           clean(values.pnr),
        purchasePrice: values.purchasePrice !== '' && values.purchasePrice !== undefined
          ? Number(values.purchasePrice) : undefined,
        purchasedFrom: clean(values.purchasedFrom),
        purchasedAt:   clean(values.purchasedAt),
        emailSource:   clean(values.emailSource),
        notes:         clean(values.notes),
      };

      if (isEditing) {
        const updated = await ticketSellerService.update(seller!.id, payload);
        toast.success('Seller listing updated');
        onSuccess(updated, false);
      } else {
        const result = await ticketSellerService.create(payload);
        toast.success('Seller listing added');
        onSuccess(result.seller, true);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Something went wrong');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      {/*
       * KEY FIX — same pattern as BuyerFormSheet:
       * flex flex-col + max-h-[90vh] + overflow-hidden on DialogContent
       * overflow-y-auto + min-h-0 on the scrollable body div
       */}
      <DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <DialogHeader className="flex-shrink-0 px-6 pt-5 pb-4 border-b bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-500/25 flex-shrink-0">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold tracking-tight">
                {isEditing ? 'Edit Seller Listing' : 'New Seller Listing'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isEditing
                  ? 'Update the ticket seller details below'
                  : 'Add a new flight ticket seller to the marketplace'}
              </DialogDescription>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="ml-auto text-[10px] font-semibold">
                Editing
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ── Scrollable Form Body ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-6" noValidate>

              {/* ── Broker Info ── */}
              <section className="space-y-3.5">
                <SectionHeader icon={Phone} title="Broker Info" description="Primary contact details" />
                <FieldGroup cols={2}>
                  <FormField control={form.control} name="brokerName" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Broker Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Rajesh Sharma" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
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
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
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
                  )} />
                </FieldGroup>
              </section>

              {/* ── Route & Schedule ── */}
              <section className="space-y-3.5">
                <SectionHeader icon={MapPin} title="Route & Schedule" description="Flight route and travel timing" />
                <FieldGroup cols={2}>
                  <FormField control={form.control} name="fromCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">From City <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Delhi" {...field} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="toCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">To City <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="travelDate" render={({ field }) => (
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
                  )} />
                  <FormField control={form.control} name="departureTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Departure Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <Input type="time" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="arrivalTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Arrival Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <Input type="time" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </FieldGroup>
              </section>

              {/* ── Seats & Pricing ── */}
              <section className="space-y-3.5">
                <SectionHeader icon={IndianRupee} title="Seats & Pricing" description="Seating and price details" />
                <FieldGroup cols={2}>
                  <FormField control={form.control} name="seatsAvailable" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Seats Available <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="5" {...field}
                          onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pricePerSeat" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Selling Price / Seat (₹) <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="4500" {...field}
                          onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Our Cost / Seat (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="3800" {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="purchasedFrom" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Purchased From</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <Input placeholder="Vendor / Source name" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="purchasedAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Purchase Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <Input type="date" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </FieldGroup>
              </section>

              {/* ── Airline & Booking ── */}
              <section className="space-y-3.5">
                <SectionHeader icon={Plane} title="Airline & Booking" description="Flight and booking references" />
                <FieldGroup cols={2}>
                  <FormField control={form.control} name="airline" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Airline</FormLabel>
                      <FormControl>
                        <Input placeholder="IndiGo, Air India..." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="flightNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Flight Number</FormLabel>
                      <FormControl>
                        <Input placeholder="6E 234" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pnr" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">PNR</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" className="font-mono" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bookingRef" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Booking Ref</FormLabel>
                      <FormControl>
                        <Input placeholder="REF123" className="font-mono" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ticketClass" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Ticket Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ECONOMY">✈️ Economy</SelectItem>
                          <SelectItem value="BUSINESS">💼 Business</SelectItem>
                          <SelectItem value="FIRST">⭐ First Class</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sourceChannel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Source Channel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="How received" /></SelectTrigger>
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
                  )} />
                </FieldGroup>
              </section>

              {/* ── Notes ── */}
              <section className="space-y-3.5">
                <SectionHeader icon={FileText} title="Notes" description="Additional remarks" />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional details or requirements..."
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </section>

              <div className="pb-1" />

            </form>
          </Form>
        </div>

        {/* ── Sticky Footer ─────────────────────────────────────────────── */}
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
            className="flex-1 gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Listing' : 'Add Listing'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}