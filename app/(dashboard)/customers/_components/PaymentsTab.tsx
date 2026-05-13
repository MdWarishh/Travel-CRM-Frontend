'use client';

import { Payment, PaymentSummary } from '@/types/customer.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/format';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const PAYMENT_STATUS: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PARTIAL: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-blue-50 text-blue-700 border-blue-200',
  UNPAID: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED: 'bg-slate-50 text-slate-600 border-slate-200',
};

interface Props {
  payments: Payment[];
  summary?: PaymentSummary;
  isLoading: boolean;
}

export function PaymentsTab({ payments, summary, isLoading }: Props) {
  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-sm font-semibold">{formatCurrency(summary.totalPaid)}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="text-sm font-semibold">{formatCurrency(summary.totalDue)}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-semibold">{summary.pendingPayments.length} payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {payments.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">No payment records</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {['Date', 'Amount', 'Paid', 'Due', 'Mode', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-xs font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-xs text-emerald-600">{formatCurrency(p.paidAmount)}</td>
                  <td className="px-4 py-3 text-xs text-amber-600">{formatCurrency(p.dueAmount)}</td>
                  <td className="px-4 py-3 text-xs">{p.mode}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PAYMENT_STATUS[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}