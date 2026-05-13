'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ticketPaymentService } from '@/services/ticket.service';
import type { TicketPayment } from '@/types/ticket.types';

const schema = z.object({
  type: z.enum(['RECEIVED', 'PAID']),
  amount: z.coerce.number().positive('Amount must be positive'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
  reference: z.string().optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  dealId: string;
  onClose: () => void;
  onSuccess: (payment: TicketPayment) => void;
}

export function PaymentDialog({ open, dealId, onClose, onSuccess }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'RECEIVED',
      amount: 0,
      paidAt: new Date().toISOString().split('T')[0],
    },
  });

  const watchType = form.watch('type');

  const onSubmit = async (values: FormValues) => {
    try {
      const payment = await ticketPaymentService.add(dealId, {
        ...values,
        amount: Number(values.amount),
        reference: values.reference || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Payment recorded successfully');
      form.reset();
      onSuccess(payment);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Add a payment entry to the deal ledger
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Type Toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange('RECEIVED')}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                          field.value === 'RECEIVED'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        )}
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                        Received
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('PAID')}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                          field.value === 'PAID'
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                            : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        )}
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                        Paid Out
                      </button>
                    </div>
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {watchType === 'RECEIVED'
                      ? '💰 Money received from buyer'
                      : '💸 Money paid out to seller'}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          min="1"
                          className="pl-7"
                          placeholder="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">💵 Cash</SelectItem>
                        <SelectItem value="UPI">📱 UPI</SelectItem>
                        <SelectItem value="BANK_TRANSFER">🏦 Bank Transfer</SelectItem>
                        <SelectItem value="CARD">💳 Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reference */}
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTR / Ref No.</FormLabel>
                    <FormControl>
                      <Input
                        className="font-mono text-sm"
                        placeholder="TXN12345"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      className="resize-none text-sm"
                      placeholder="Any remarks..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={cn(
                  'flex-1',
                  watchType === 'RECEIVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                )}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : watchType === 'RECEIVED'
                  ? 'Record Receipt'
                  : 'Record Payment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}