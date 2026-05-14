'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import type { UnifiedPayment as Payment } from '@/types/payment';

interface DeletePaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

const fmt = (val: number | null | undefined) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val ?? 0);

export function DeletePaymentDialog({ payment, open, onClose, onConfirm }: DeletePaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!payment) return;
    setIsLoading(true);
    try {
      await onConfirm(payment.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            Are you sure you want to delete the payment of{' '}
            <strong>₹{fmt(payment?.amount)}</strong> for{' '}
            <strong>{payment?.customer?.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}