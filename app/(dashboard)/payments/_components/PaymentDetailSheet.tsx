'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Receipt, FileText, Send, Clock, User, CreditCard, Hash,
} from 'lucide-react';
import { Payment } from '@/types/payment';
import { unifiedPaymentService as paymentsService } from '@/services/payments.service';
import { StatusBadge, ModeBadge } from './PaymentBadges';

interface PaymentDetailSheetProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
  onViewReceipt: (payment: Payment) => void;
  onSendReminder: (payment: Payment) => void;
  onSendConfirmation: (payment: Payment) => void;
}

type ActivityLogEntry = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  performedBy?: { name: string };
};

const fmt = (val: number | null | undefined) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val ?? 0);

const fmtDate = (val: string | null | undefined) =>
  val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

function ActivityLog({ paymentId }: { paymentId: string }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['payment-activity', paymentId],
   queryFn: async () => [] as ActivityLogEntry[],
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!logs.length) return <p className="text-xs text-muted-foreground">No activity yet.</p>;

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium leading-tight">{log.title}</p>
            {log.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{log.description}</p>
            )}
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {fmtDate(log.createdAt)}
              {log.performedBy ? ` · ${log.performedBy.name}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaymentDetailSheet({
  payment,
  open,
  onClose,
  onViewReceipt,
  onSendReminder,
  onSendConfirmation,
}: PaymentDetailSheetProps) {
  if (!payment) return null;

  const due = payment.dueAmount ?? 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50">
          <SheetTitle className="text-base flex items-center justify-between">
            <span>Payment Details</span>
            <StatusBadge status={payment.status} />
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-5">

            {/* Amount breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/40">
                <p className="text-[10px] text-muted-foreground mb-1">Total</p>
                <p className="text-base font-semibold">₹{fmt(payment.amount)}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-emerald-500/10">
                <p className="text-[10px] text-emerald-600 mb-1">Paid</p>
                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">₹{fmt(payment.paidAmount)}</p>
              </div>
              <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${due > 0 ? 'bg-amber-500/10' : 'bg-muted/40'}`}>
                <p className={`text-[10px] mb-1 ${due > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>Due</p>
                <p className={`text-base font-semibold ${due > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                  ₹{fmt(payment.dueAmount)}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Info</p>
              <div className="space-y-2.5">
                {[
                  { icon: User, label: 'Customer', value: payment.customer?.name },
                  { icon: CreditCard, label: 'Mode', value: <ModeBadge mode={payment.mode} /> },
                  { icon: Clock, label: 'Paid At', value: fmtDate(payment.paidAt) },
                  { icon: Hash, label: 'Transaction ID', value: payment.transactionId ?? '—' },
                  { icon: Hash, label: 'Payment ID', value: <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">{payment.id.slice(-12)}</code> },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
                    <span className="text-xs font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {payment.notes && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{payment.notes}</p>
                </div>
              </>
            )}

            {/* Booking info */}
            {payment.booking && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Booking</p>
                  <div className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Booking ID</span>
                      <code className="text-[11px] font-mono">#{payment.bookingId?.slice(-8).toUpperCase()}</code>
                    </div>
                    {payment.booking.travelStart && (
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Travel Start</span>
                        <span className="text-xs">{fmtDate(payment.booking.travelStart)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Payment Status</span>
                      <span className="text-xs font-medium capitalize">{payment.booking.paymentStatus?.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Activity */}
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activity Log</p>
              <ActivityLog paymentId={payment.id} />
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border/50 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => onViewReceipt(payment)}
          >
            <Receipt className="w-3.5 h-3.5" />
            Receipt
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => onSendConfirmation(payment)}
          >
            <FileText className="w-3.5 h-3.5" />
            Confirm
          </Button>
          {due > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => onSendReminder(payment)}
            >
              <Send className="w-3.5 h-3.5" />
              Remind
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}