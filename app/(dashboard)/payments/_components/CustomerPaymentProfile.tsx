'use client';

import { useEffect, useState } from 'react';
import { Loader2, X, ArrowDownLeft, ArrowUpRight, Phone, Mail, TrendingUp, Clock } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { unifiedPaymentService } from '@/services/payments.service';
import { CustomerPaymentProfile as TCustomerPaymentProfile, UnifiedPayment } from '@/types/payment';

const SOURCE_LABELS: Record<string, string> = {
  BOOKING: 'Booking', INVOICE: 'Invoice', TICKET: 'Flight Deal', MANUAL: 'Manual',
};

interface Props {
  customerId: string | null;
  onClose: () => void;
}

export default function CustomerPaymentProfile({ customerId, onClose }: Props) {
  const [data, setData] = useState<TCustomerPaymentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    unifiedPaymentService.getCustomerProfile(customerId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [customerId]);

  return (
    <Sheet open={!!customerId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-base">Customer Payment Profile</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Customer info */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-violet-600">
                    {data.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-base">{data.customer.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.customer.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />{data.customer.phone}
                      </span>
                    )}
                    {data.customer.email && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />{data.customer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Paid', value: data.totalPaid, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                  { label: 'Pending', value: data.totalPending, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
                  { label: 'Transactions', value: data.totalPayments, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40', isCount: true },
                ].map(({ label, value, color, bg, isCount }) => (
                  <div key={label} className={cn('rounded-xl p-3 text-center', bg)}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                    <p className={cn('font-bold text-sm tabular-nums', color)}>
                      {isCount ? value : formatCurrency(value as number)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Payment history */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Payment History ({data.totalPayments})
                </h4>
                <div className="space-y-2">
                  {data.payments.map((p) => (
                    <PaymentHistoryRow key={p.id} payment={p} />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PaymentHistoryRow({ payment }: { payment: UnifiedPayment }) {
  const isIncoming = payment.type === 'INCOMING';
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors">
      <div className={cn(
        'rounded-full p-1.5 shrink-0',
        isIncoming ? 'bg-emerald-100 dark:bg-emerald-950/60' : 'bg-rose-100 dark:bg-rose-950/60',
      )}>
        {isIncoming
          ? <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
          : <ArrowUpRight className="h-3 w-3 text-rose-600" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{SOURCE_LABELS[payment.source]}</span>
          {payment.invoice?.invoiceNumber && (
            <span className="text-[11px] text-muted-foreground">#{payment.invoice.invoiceNumber}</span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatDate(payment.paidAt)} · {payment.method}
          {payment.reference && ` · ${payment.reference}`}
        </p>
      </div>
      <span className={cn(
        'text-sm font-bold tabular-nums shrink-0',
        isIncoming ? 'text-emerald-600' : 'text-rose-600',
      )}>
        {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
      </span>
    </div>
  );
}