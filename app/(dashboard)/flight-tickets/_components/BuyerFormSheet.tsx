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
import { ticketBuyerService } from '@/services/ticket.service';
import type { TicketBuyer } from '@/types/ticket.types';

const schema = z.object({
  brokerName: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Valid phone required'),
  email: z.string().email().optional().or(z.literal('')),
  fromCity: z.string().min(2, 'Required'),
  toCity: z.string().min(2, 'Required'),
  preferredTimeFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  preferredTimeTo: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
  travelDate: z.string().min(1, 'Required'),
  seatsRequired: z.coerce.number().int().positive('Must be positive'),
  budgetPerSeat: z.coerce.number().positive('Must be positive'),
  passengerCount: z.coerce.number().int().positive().optional(),
  passengerNames: z.string().optional(),
  agreedPricePerSeat: z.coerce.number().positive().optional(),
  totalCollected: z.coerce.number().min(0).optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']).optional(),
  paymentDate: z.string().optional(),
  paymentRef: z.string().optional(),
  sourceChannel: z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
  emailSource: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  buyer: TicketBuyer | null;
  onClose: () => void;
  onSuccess: (buyer: TicketBuyer, isNew: boolean) => void;
}

export function BuyerFormSheet({ open, buyer, onClose, onSuccess }: Props) {
  const isEditing = !!buyer;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brokerName: '', phone: '', email: '', fromCity: '', toCity: '',
      preferredTimeFrom: '', preferredTimeTo: '', travelDate: '',
      seatsRequired: 1, budgetPerSeat: 0,
    },
  });

  useEffect(() => {
    if (buyer) {
      form.reset({
        brokerName: buyer.brokerName,
        phone: buyer.phone,
        email: buyer.email ?? '',
        fromCity: buyer.fromCity,
        toCity: buyer.toCity,
        preferredTimeFrom: buyer.preferredTimeFrom,
        preferredTimeTo: buyer.preferredTimeTo,
        travelDate: buyer.travelDate?.split('T')[0],
        seatsRequired: buyer.seatsRequired,
        budgetPerSeat: buyer.budgetPerSeat,
        passengerCount: buyer.passengerCount,
        passengerNames: buyer.passengerNames ?? '',
        agreedPricePerSeat: buyer.agreedPricePerSeat,
        totalCollected: buyer.totalCollected,
        paymentMethod: buyer.paymentMethod,
        paymentStatus: buyer.paymentStatus,
        paymentDate: buyer.paymentDate?.split('T')[0] ?? '',
        paymentRef: buyer.paymentRef ?? '',
        sourceChannel: buyer.sourceChannel,
        emailSource: buyer.emailSource ?? '',
        notes: buyer.notes ?? '',
      });
    } else {
      form.reset({
        brokerName: '', phone: '', email: '', fromCity: '', toCity: '',
        preferredTimeFrom: '', preferredTimeTo: '', travelDate: '',
        seatsRequired: 1, budgetPerSeat: 0,
      });
    }
  }, [buyer, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      const clean = (v: any) => v === '' || v === undefined ? undefined : v;
      const payload = {
        ...values,
        email: clean(values.email),
        passengerNames: clean(values.passengerNames),
        paymentRef: clean(values.paymentRef),
        emailSource: clean(values.emailSource),
        notes: clean(values.notes),
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
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{isEditing ? 'Edit Buyer Request' : 'New Buyer Request'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the buyer request details' : 'Add a new ticket buyer to the marketplace'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-5">

              {/* Broker */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Broker Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="brokerName" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Broker Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. Sunita Verma" {...field} /></FormControl>
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Route & Preferred Time</p>
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
                  <FormField control={form.control} name="preferredTimeFrom" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred From *</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preferredTimeTo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred To *</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Seats & Budget */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seats & Budget</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="seatsRequired" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats Required *</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="budgetPerSeat" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget / Seat (₹) *</FormLabel>
                      <FormControl><Input type="number" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="agreedPricePerSeat" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreed Price / Seat (₹)</FormLabel>
                      <FormControl><Input type="number" min="0" placeholder="Final negotiated" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="totalCollected" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Collected (₹)</FormLabel>
                      <FormControl><Input type="number" min="0" placeholder="Amount received" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Passengers */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Passenger Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="passengerCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger Count</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
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
                  <FormField control={form.control} name="passengerNames" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Passenger Names</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Comma separated names..." rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Payment */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Payment Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PARTIAL">Partial</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="CARD">Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="paymentDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="paymentRef" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Ref</FormLabel>
                      <FormControl><Input placeholder="UTR / UPI Ref" className="font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-3 pt-2 pb-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? 'Saving...'
                    : isEditing ? 'Update Request' : 'Add Request'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}