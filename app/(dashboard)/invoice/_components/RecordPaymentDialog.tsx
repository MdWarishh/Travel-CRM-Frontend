// app/invoice/_components/RecordPaymentDialog.tsx

'use client';

import { useState } from 'react';
import { GstInvoice, PaymentMode } from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import { formatCurrency } from '@/lib/invoiceUtils';
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
import { toast } from 'sonner';
import { IndianRupee, Loader2 } from 'lucide-react';

interface Props {
  invoice: GstInvoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MODES: { value: PaymentMode; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Card' },
];

export function RecordPaymentDialog({ invoice, open, onOpenChange, onSuccess }: Props) {
  const remaining = invoice.dueAmount;
  const [amount, setAmount] = useState(String(remaining));
  const [mode, setMode] = useState<PaymentMode>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (num > remaining + 0.01) {
      toast.error(`Maximum payable is ${formatCurrency(remaining)}`);
      return;
    }
    setLoading(true);
    try {
      await invoiceService.recordPayment(invoice.id, {
        amount: num,
        mode,
        transactionId: transactionId || undefined,
        note: note || undefined,
      });
      toast.success('Payment recorded successfully');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice</span>
            <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid so far</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="font-medium">Remaining</span>
            <span className="font-bold text-rose-600">{formatCurrency(remaining)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min={1}
              max={remaining}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as PaymentMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Transaction ID <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="UTR / UPI ref / Cheque no."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Note <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any note about this payment"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}