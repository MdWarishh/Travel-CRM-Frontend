'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Plane, Phone, Mail, MapPin, CalendarDays,
  Clock, IndianRupee, CreditCard, Tag, Hash, Building2,
  Radio, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TicketSeller, CreateSellerPayload } from '@/types/ticket.types';
import { format } from 'date-fns';

// ── Schema ────────────────────────────────────────────────────────────────────
// Strict only on required fields. All optional fields have no validation errors.

const sellerSchema = z.object({
  // ── Required ──
  brokerName:    z.string().min(2, 'Broker name required'),
  phone:         z.string().min(7, 'Valid phone required'),
  fromCity:      z.string().min(2, 'From city required'),
  toCity:        z.string().min(2, 'To city required'),
  travelDate:    z.string().min(1, 'Travel date required'),
  seatsAvailable: z.coerce.number().int().min(1, 'At least 1 seat'),
  pricePerSeat:  z.coerce.number().min(0, 'Price required'),

  // ── Optional — saves without errors ──
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

type SellerFormValues = z.infer<typeof sellerSchema>;

const EMPTY_DEFAULTS: SellerFormValues = {
  brokerName: '', phone: '', email: '',
  fromCity: '', toCity: '',
  departureTime: '', arrivalTime: '', travelDate: '',
  seatsAvailable: 1, pricePerSeat: 0,
  airline: '', flightNumber: '', bookingRef: '', pnr: '',
  purchasedFrom: '', emailSource: '', notes: '',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface SellerFormDialogProps {
  open:           boolean;
  onClose:        () => void;
  onSubmit:       (data: CreateSellerPayload) => Promise<void>;
  defaultValues?: TicketSeller | null;
  loading?:       boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 pt-1 pb-0.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted border flex-shrink-0 mt-0.5 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="self-center flex-1 h-px bg-border" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SellerFormDialog({
  open, onClose, onSubmit, defaultValues, loading,
}: SellerFormDialogProps) {
  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: EMPTY_DEFAULTS,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
    if (defaultValues) {
      form.reset({
        brokerName:    defaultValues.brokerName,
        phone:         defaultValues.phone,
        email:         defaultValues.email ?? '',
        fromCity:      defaultValues.fromCity,
        toCity:        defaultValues.toCity,
        departureTime: defaultValues.departureTime ?? '',
        arrivalTime:   defaultValues.arrivalTime ?? '',
        travelDate:    format(new Date(defaultValues.travelDate), 'yyyy-MM-dd'),
        seatsAvailable: defaultValues.seatsAvailable,
        pricePerSeat:  defaultValues.pricePerSeat,
        airline:       defaultValues.airline ?? '',
        flightNumber:  defaultValues.flightNumber ?? '',
        bookingRef:    defaultValues.bookingRef ?? '',
        ticketClass:   defaultValues.ticketClass,
        pnr:           defaultValues.pnr ?? '',
        purchasePrice: defaultValues.purchasePrice ?? '',
        purchasedFrom: defaultValues.purchasedFrom ?? '',
        purchasedAt:   defaultValues.purchasedAt
          ? format(new Date(defaultValues.purchasedAt), 'yyyy-MM-dd') : '',
        sourceChannel: defaultValues.sourceChannel,
        emailSource:   defaultValues.emailSource ?? '',
        notes:         defaultValues.notes ?? '',
      });
    } else {
      form.reset(EMPTY_DEFAULTS);
    }
  }, [open, defaultValues]); // eslint-disable-line

  const handleClose = () => { form.reset(EMPTY_DEFAULTS); onClose(); };

  const handleSubmit = async (values: SellerFormValues) => {
    // Clean empty strings → undefined
    const clean = <T,>(v: T | '' | undefined): T | undefined =>
      v === '' || v === undefined ? undefined : v;

    const payload = {
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
    } as CreateSellerPayload;

    await onSubmit(payload);
  };

  const isEditing = !!defaultValues;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="flex-shrink-0 px-6 pt-5 pb-4 border-b bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-500/25 flex-shrink-0">
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold tracking-tight">
                {isEditing ? 'Edit Seller Listing' : 'New Seller Listing'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? 'Update the ticket seller details below'
                  : 'Add a new flight ticket seller to the marketplace'}
              </p>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="ml-auto text-[10px]">Editing</Badge>
            )}
          </div>
        </DialogHeader>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="px-6 py-5 space-y-5"
              noValidate
            >

              {/* ── Broker Info ── */}
              <Section icon={<Phone className="h-3.5 w-3.5" />} title="Broker Info" description="Primary contact details" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="brokerName" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs">Broker Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Rajesh Sharma" {...field} /></FormControl>
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
              </div>

              {/* ── Route & Schedule ── */}
              <Section icon={<MapPin className="h-3.5 w-3.5" />} title="Route & Schedule" description="Flight route and timing" />
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              {/* ── Seats & Pricing ── */}
              <Section icon={<IndianRupee className="h-3.5 w-3.5" />} title="Seats & Pricing" description="Availability and selling price" />
              <div className="grid grid-cols-2 gap-3">
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
                        <Input placeholder="Vendor name" className="pl-8" {...field} />
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
              </div>

              {/* ── Airline & Booking ── */}
              <Section icon={<Plane className="h-3.5 w-3.5" />} title="Airline & Booking" description="Flight and booking references" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="airline" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Airline</FormLabel>
                    <FormControl><Input placeholder="IndiGo, Air India..." {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="flightNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Flight Number</FormLabel>
                    <FormControl><Input placeholder="6E 234" {...field} /></FormControl>
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
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
              </div>

              {/* ── Source ── */}
              <Section icon={<Radio className="h-3.5 w-3.5" />} title="Source" description="How this ticket came in" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="sourceChannel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Source Channel</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
                <FormField control={form.control} name="emailSource" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email Source</FormLabel>
                    <FormControl><Input placeholder="noreply@airline.com" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>

              {/* ── Notes ── */}
              <Section icon={<FileText className="h-3.5 w-3.5" />} title="Notes" description="Additional remarks" />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional info..."
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <div className="pb-2" />
            </form>
          </Form>
        </div>

        {/* ── Sticky Footer ── */}
        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t bg-muted/10 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20"
            onClick={form.handleSubmit(handleSubmit)}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? 'Update Listing' : 'Add Listing'}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}