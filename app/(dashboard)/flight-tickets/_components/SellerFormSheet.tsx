'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ticketSellerService } from '@/services/ticket.service';
import type { TicketSeller } from '@/types/ticket.types';

const schema = z.object({
  brokerName: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Valid phone required'),
  email: z.string().email().optional().or(z.literal('')),
  fromCity: z.string().min(2, 'Required'),
  toCity: z.string().min(2, 'Required'),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  arrivalTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  travelDate: z.string().min(1, 'Required'),
  seatsAvailable: z.coerce.number().int().positive('Must be positive'),
  pricePerSeat: z.coerce.number().positive('Must be positive'),
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  bookingRef: z.string().optional(),
  ticketClass: z.enum(['ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  pnr: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  purchasedFrom: z.string().optional(),
  purchasedAt: z.string().optional(),
  sourceChannel: z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
  emailSource: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  seller: TicketSeller | null;
  onClose: () => void;
  onSuccess: (seller: TicketSeller, isNew: boolean) => void;
}

export function SellerFormSheet({ open, seller, onClose, onSuccess }: Props) {
  const isEditing = !!seller;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brokerName: '', phone: '', email: '', fromCity: '', toCity: '',
      departureTime: '', arrivalTime: '', travelDate: '',
      seatsAvailable: 1, pricePerSeat: 0,
    },
  });

  useEffect(() => {
    if (seller) {
      form.reset({
        brokerName: seller.brokerName,
        phone: seller.phone,
        email: seller.email ?? '',
        fromCity: seller.fromCity,
        toCity: seller.toCity,
        departureTime: seller.departureTime,
        arrivalTime: seller.arrivalTime,
        travelDate: seller.travelDate?.split('T')[0],
        seatsAvailable: seller.seatsAvailable,
        pricePerSeat: seller.pricePerSeat,
        airline: seller.airline ?? '',
        flightNumber: seller.flightNumber ?? '',
        bookingRef: seller.bookingRef ?? '',
        ticketClass: seller.ticketClass,
        pnr: seller.pnr ?? '',
        purchasePrice: seller.purchasePrice,
        purchasedFrom: seller.purchasedFrom ?? '',
        purchasedAt: seller.purchasedAt?.split('T')[0] ?? '',
        sourceChannel: seller.sourceChannel,
        emailSource: seller.emailSource ?? '',
        notes: seller.notes ?? '',
      });
    } else {
      form.reset({
        brokerName: '', phone: '', email: '', fromCity: '', toCity: '',
        departureTime: '', arrivalTime: '', travelDate: '',
        seatsAvailable: 1, pricePerSeat: 0,
      });
    }
  }, [seller, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        seatsAvailable: Number(values.seatsAvailable),
        pricePerSeat: Number(values.pricePerSeat),
        purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
        email: values.email || undefined,
        airline: values.airline || undefined,
        flightNumber: values.flightNumber || undefined,
        bookingRef: values.bookingRef || undefined,
        pnr: values.pnr || undefined,
        purchasedFrom: values.purchasedFrom || undefined,
        purchasedAt: values.purchasedAt || undefined,
        sourceChannel: values.sourceChannel || undefined,
        emailSource: values.emailSource || undefined,
        notes: values.notes || undefined,
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

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{isEditing ? 'Edit Seller Listing' : 'New Seller Listing'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the ticket seller details' : 'Add a new flight ticket seller to the marketplace'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-5">

              {/* Broker Info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Broker Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="brokerName" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Broker Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. Rajesh Sharma" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="broker@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Route */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Route & Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="fromCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>From City *</FormLabel>
                      <FormControl><Input placeholder="Delhi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="toCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>To City *</FormLabel>
                      <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="travelDate" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Travel Date *</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="departureTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Time *</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="arrivalTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Time *</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Seats & Pricing */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seats & Pricing</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="seatsAvailable" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats Available *</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pricePerSeat" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price / Seat (₹) *</FormLabel>
                      <FormControl><Input type="number" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Our Purchase Price (₹)</FormLabel>
                      <FormControl><Input type="number" min="0" placeholder="Cost to us" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="purchasedFrom" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchased From</FormLabel>
                      <FormControl><Input placeholder="Vendor / Source name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="purchasedAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Airline & Booking */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Airline & Booking Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="airline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Airline</FormLabel>
                      <FormControl><Input placeholder="IndiGo, Air India..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="flightNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Number</FormLabel>
                      <FormControl><Input placeholder="6E 234" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pnr" render={({ field }) => (
                    <FormItem>
                      <FormLabel>PNR</FormLabel>
                      <FormControl><Input placeholder="ABC123" className="font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bookingRef" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Ref</FormLabel>
                      <FormControl><Input placeholder="REF123" className="font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ticketClass" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ECONOMY">Economy</SelectItem>
                          <SelectItem value="BUSINESS">Business</SelectItem>
                          <SelectItem value="FIRST">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sourceChannel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Channel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="How received" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="PHONE">Phone</SelectItem>
                          <SelectItem value="WALK_IN">Walk-In</SelectItem>
                          <SelectItem value="ONLINE">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? 'Saving...'
                    : isEditing ? 'Update Listing' : 'Add Listing'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}