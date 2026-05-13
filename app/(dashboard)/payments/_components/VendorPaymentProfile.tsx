'use client';

import { useEffect, useState } from 'react';
import { Loader2, Building2, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { unifiedPaymentService } from '@/services/payments.service';
import { VendorPaymentProfile as TVendorPaymentProfile, UnifiedPayment } from '@/types/payment';

interface Props {
  vendorId: string | null;
  onClose: () => void;
}

export default function VendorPaymentProfile({ vendorId, onClose }: Props) {
  const [data, setData] = useState<TVendorPaymentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    unifiedPaymentService.getVendorProfile(vendorId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <Sheet open={!!vendorId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-base">Vendor Payment Profile</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Vendor info */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{data.vendor.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{data.vendor.serviceType}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.vendor.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />{data.vendor.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Paid', value: data.totalPaid, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
                  { label: 'Pending', value: data.totalPending, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
                  { label: 'Transactions', value: data.totalPayments, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', isCount: true },
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
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="rounded-full p-1.5 bg-rose-100 dark:bg-rose-950/60 shrink-0">
                        <ArrowUpRight className="h-3 w-3 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{p.source}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDate(p.paidAt)} · {p.method}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-rose-600 tabular-nums shrink-0">
                        -{formatCurrency(p.amount)}
                      </span>
                    </div>
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