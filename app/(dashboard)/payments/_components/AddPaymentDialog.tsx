'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CreatePaymentData } from '@/types/payment';
import { CustomerSelect, BookingSelect } from './CustomerBookingSelect';

const schema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  bookingId: z.string().optional(),
  amount: z.coerce.number().positive('Must be positive'),
  paidAmount: z.coerce.number().min(0).optional(),
  mode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD']),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentData) => Promise<void>;
  defaultCustomerId?: string;
  defaultBookingId?: string;
}

const MODE_OPTIONS = [
  { value: 'CASH', label: '💵 Cash' },
  { value: 'UPI', label: '📱 UPI' },
  { value: 'BANK_TRANSFER', label: '🏦 Bank Transfer' },
  { value: 'CHEQUE', label: '📄 Cheque' },
  { value: 'CARD', label: '💳 Card' },
];

export function AddPaymentDialog({
  open,
  onClose,
  onSubmit,
  defaultCustomerId,
  defaultBookingId,
}: AddPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      customerId: defaultCustomerId ?? '',
      bookingId: defaultBookingId ?? '',
      mode: 'CASH',
      paidAt: new Date().toISOString().slice(0, 10),
    },
  });

  const customerId = watch('customerId');
  const amount = watch('amount');
  const paidAmount = watch('paidAmount');
  const dueAmount =
    amount && paidAmount !== undefined ? Math.max(0, amount - paidAmount) : undefined;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      await onSubmit({
        ...data,
        dueAmount,
        bookingId: data.bookingId || undefined,
        paidAt: data.paidAt ? new Date(data.paidAt).toISOString() : undefined,
      } as CreatePaymentData);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

          {/* Customer Dropdown */}
          {!defaultCustomerId && (
            <div className="space-y-1.5">
              <Label className="text-xs">Customer</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <CustomerSelect
                    value={field.value}
                    onChange={(id) => {
                      field.onChange(id);
                      setValue('bookingId', '');
                    }}
                    error={errors.customerId?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Booking Dropdown */}
          {!defaultBookingId && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Booking <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Controller
                name="bookingId"
                control={control}
                render={({ field }) => (
                  <BookingSelect
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    customerId={customerId || undefined}
                    disabled={!customerId}
                  />
                )}
              />
              {!customerId && (
                <p className="text-[11px] text-muted-foreground">Select a customer first</p>
              )}
            </div>
          )}

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Total Amount (₹)</Label>
              <Input type="number" className="h-9 text-sm" {...register('amount')} placeholder="0" />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Paid Amount (₹)</Label>
              <Input type="number" className="h-9 text-sm" {...register('paidAmount')} placeholder="0" />
            </div>
          </div>

          {/* Due amount preview */}
          {dueAmount !== undefined && (
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50">
              <span className="text-muted-foreground text-xs">Remaining due</span>
              <span className={`font-medium text-xs ${dueAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{new Intl.NumberFormat('en-IN').format(dueAmount)}
              </span>
            </div>
          )}

          {/* Mode + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Mode</Label>
              <Select defaultValue="CASH" onValueChange={(v) => setValue('mode', v as FormData['mode'])}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Date</Label>
              <Input type="date" className="h-9 text-sm" {...register('paidAt')} />
            </div>
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <Label className="text-xs">Transaction ID <span className="text-muted-foreground">(optional)</span></Label>
            <Input className="h-9 text-sm" {...register('transactionId')} placeholder="UTR / Ref number" />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea className="text-sm min-h-[60px] resize-none" {...register('notes')} placeholder="Any remarks..." />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}