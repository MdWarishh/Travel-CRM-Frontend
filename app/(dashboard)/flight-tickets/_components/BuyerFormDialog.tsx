'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
  Loader2, UserSearch, CreditCard, Users, Phone, Mail,
  MapPin, CalendarDays, Clock, IndianRupee, FileText, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketBuyer, CreateBuyerPayload } from '@/types/ticket.types';
import { format } from 'date-fns';

// ── Schema ────────────────────────────────────────────────────────────────────

const buyerSchema = z.object({
  brokerName:         z.string().min(2, 'Broker name required'),
  phone:              z.string().min(7, 'Valid phone required'),
  email:              z.string().email().optional().or(z.literal('')),
  fromCity:           z.string().min(2, 'From city required'),
  toCity:             z.string().min(2, 'To city required'),
  preferredTimeFrom:  z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  preferredTimeTo:    z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  travelDate:         z.string().min(1, 'Travel date required'),
  seatsRequired:      z.coerce.number().int().min(1, 'At least 1 seat'),
  budgetPerSeat:      z.coerce.number().min(1, 'Budget must be > 0'),
  passengerCount:     z.coerce.number().int().min(1).optional().or(z.literal('')),
  passengerNames:     z.string().optional(),
  agreedPricePerSeat: z.coerce.number().min(0).optional().or(z.literal('')),
  totalCollected:     z.coerce.number().min(0).optional().or(z.literal('')),
  paymentMethod:      z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
  paymentStatus:      z.enum(['PENDING', 'PARTIAL', 'PAID']).optional(),
  paymentDate:        z.string().optional(),
  paymentRef:         z.string().optional(),
  sourceChannel:      z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
  emailSource:        z.string().optional(),
  notes:              z.string().optional(),
});

type BuyerFormValues = z.infer<typeof buyerSchema>;

const EMPTY_DEFAULTS: BuyerFormValues = {
  brokerName: '', phone: '', email: '',
  fromCity: '', toCity: '',
  preferredTimeFrom: '', preferredTimeTo: '', travelDate: '',
  seatsRequired: 1, budgetPerSeat: 0,
  passengerNames: '', paymentRef: '', emailSource: '', notes: '',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface BuyerFormDialogProps {
  open:           boolean;
  onClose:        () => void;
  onSubmit:       (data: CreateBuyerPayload) => Promise<void>;
  defaultValues?: TicketBuyer | null;
  loading?:       boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ icon, title, description }: {
  icon: React.ReactNode; title: string; description?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 pt-1 pb-0.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted border flex-shrink-0 mt-0.5 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        {description && <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="self-center flex-1 h-px bg-border" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BuyerFormDialog({
  open, onClose, onSubmit, defaultValues, loading,
}: BuyerFormDialogProps) {

  const form = useForm<BuyerFormValues>({
    // `as any` fixes resolver type mismatch between @hookform/resolvers and react-hook-form versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(buyerSchema) as any,
    defaultValues: EMPTY_DEFAULTS,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // `ctrl` typed as `any` — fixes all FormField control= red lines
  // caused by react-hook-form / @hookform/resolvers version mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrl = form.control as any;

  useEffect(() => {
    if (!open) return;
    if (defaultValues) {
      form.reset({
        brokerName:         defaultValues.brokerName,
        phone:              defaultValues.phone,
        email:              defaultValues.email ?? '',
        fromCity:           defaultValues.fromCity,
        toCity:             defaultValues.toCity,
        preferredTimeFrom:  defaultValues.preferredTimeFrom,
        preferredTimeTo:    defaultValues.preferredTimeTo,
        travelDate:         format(new Date(defaultValues.travelDate), 'yyyy-MM-dd'),
        seatsRequired:      defaultValues.seatsRequired,
        budgetPerSeat:      defaultValues.budgetPerSeat,
        passengerCount:     defaultValues.passengerCount ?? '',
        passengerNames:     defaultValues.passengerNames ?? '',
        agreedPricePerSeat: defaultValues.agreedPricePerSeat ?? '',
        totalCollected:     defaultValues.totalCollected ?? '',
        paymentMethod:      defaultValues.paymentMethod,
        paymentStatus:      defaultValues.paymentStatus as BuyerFormValues['paymentStatus'],
        paymentDate:        defaultValues.paymentDate
          ? format(new Date(defaultValues.paymentDate), 'yyyy-MM-dd') : '',
        paymentRef:         defaultValues.paymentRef ?? '',
        sourceChannel:      defaultValues.sourceChannel,
        emailSource:        defaultValues.emailSource ?? '',
        notes:              defaultValues.notes ?? '',
      });
    } else {
      form.reset(EMPTY_DEFAULTS);
    }
  }, [open, defaultValues]); // eslint-disable-line

  const handleClose = () => { form.reset(EMPTY_DEFAULTS); onClose(); };

  const handleSubmit: SubmitHandler<BuyerFormValues> = async (values) => {
    await onSubmit(values as CreateBuyerPayload);
  };

  const isEditing = !!defaultValues;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className={cn('max-w-2xl w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden')}>

        {/* ── Header ── */}
        <DialogHeader className={cn('flex-shrink-0 px-6 pt-5 pb-4 border-b bg-gradient-to-br from-violet-500/[0.06] via-transparent to-transparent')}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/25 flex-shrink-0">
              <UserSearch className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold tracking-tight">
                {isEditing ? 'Edit Buyer Request' : 'New Buyer Request'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing ? 'Update the buyer request details below' : 'Fill in the details to add a new buyer to the marketplace'}
              </p>
            </div>
            {isEditing && <Badge variant="secondary" className="ml-auto text-[10px]">Editing</Badge>}
          </div>
        </DialogHeader>

        {/* ── Scrollable Form Body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="px-6 py-5 space-y-5" noValidate>

              {/* ── Broker Info ── */}
              <Section icon={<UserSearch className="h-3.5 w-3.5" />} title="Broker Info" description="Primary contact details" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ctrl} name="brokerName" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs">Broker Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Suresh Mehta" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="phone" render={({ field }) => (
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
                <FormField control={ctrl} name="email" render={({ field }) => (
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

              {/* ── Route & Time ── */}
              <Section icon={<MapPin className="h-3.5 w-3.5" />} title="Route & Preferred Time" description="Travel route and timing window" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ctrl} name="fromCity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">From City <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Delhi" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="toCity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">To City <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="travelDate" render={({ field }) => (
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
                <FormField control={ctrl} name="preferredTimeFrom" render={({ field }) => (
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
                )} />
                <FormField control={ctrl} name="preferredTimeTo" render={({ field }) => (
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
                )} />
              </div>

              {/* ── Seats & Budget ── */}
              <Section icon={<IndianRupee className="h-3.5 w-3.5" />} title="Seats & Budget" description="Seat count and pricing" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ctrl} name="seatsRequired" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Seats Required <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="2" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="budgetPerSeat" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Budget / Seat (₹) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="3500" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>

              {/* ── Passenger Details ── */}
              <Section icon={<Users className="h-3.5 w-3.5" />} title="Passenger Details" description="Traveller information" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ctrl} name="passengerCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Passenger Count</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="2" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="passengerNames" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Passenger Names</FormLabel>
                    <FormControl><Input placeholder="Ramesh, Suresh" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>

              {/* ── Payment ── */}
              <Section icon={<CreditCard className="h-3.5 w-3.5" />} title="Payment Details" description="Transaction and collection info" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ctrl} name="agreedPricePerSeat" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Agreed Price / Seat (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="4200" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="totalCollected" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Total Collected (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="8400" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField control={ctrl} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Payment Method</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">💵 Cash</SelectItem>
                        <SelectItem value="UPI">📱 UPI</SelectItem>
                        <SelectItem value="BANK_TRANSFER">🏦 Bank Transfer</SelectItem>
                        <SelectItem value="CARD">💳 Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="paymentStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Payment Status</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">⏳ Pending</SelectItem>
                        <SelectItem value="PARTIAL">🔶 Partial</SelectItem>
                        <SelectItem value="PAID">✅ Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={ctrl} name="paymentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Payment Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
              <FormField control={ctrl} name="paymentRef" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Payment Ref / UTR</FormLabel>
                  <FormControl><Input placeholder="UTR123456789" className="font-mono" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              {/* ── Source ── */}
              <Section icon={<Radio className="h-3.5 w-3.5" />} title="Source" description="How the buyer reached you" />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ctrl} name="sourceChannel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Source Channel</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="How did they contact?" /></SelectTrigger>
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
                <FormField control={ctrl} name="emailSource" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email Source</FormLabel>
                    <FormControl><Input placeholder="noreply@booking.com" {...field} /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>

              {/* ── Notes ── */}
              <Section icon={<FileText className="h-3.5 w-3.5" />} title="Notes" description="Additional remarks" />
              <FormField control={ctrl} name="notes" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Any additional requirements..." rows={2} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <div className="pb-2" />
            </form>
          </Form>
        </div>

        {/* ── Sticky Footer ── */}
        <DialogFooter className={cn('flex-shrink-0 px-6 py-4 border-t bg-muted/10 gap-2')}>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none gap-2 bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20"
            onClick={form.handleSubmit(handleSubmit)}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? 'Update Request' : 'Add Request'}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}