'use client';

// app/(dashboard)/vendors/_components/tabs/VendorPaymentsTab.tsx

import { CreditCard, TrendingUp, Clock, Banknote } from 'lucide-react';
import { VendorPayments } from '@/types/vendors';
import { formatCurrency, formatDate } from '../vendor.constants';

const PAYMENT_MODE_ICON: Record<string, string> = {
  CASH:          '💵',
  BANK_TRANSFER: '🏦',
  UPI:           '📱',
  CHEQUE:        '📄',
  CARD:          '💳',
};

export function VendorPaymentsTab({ payments }: { payments: VendorPayments }) {
  const { totalPaid, pendingAmount, history } = payments;
  const total = totalPaid + pendingAmount;
  const paidPercent = total > 0 ? Math.round((totalPaid / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Summary cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
              Total Paid
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
              Pending
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(pendingAmount)}</p>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Banknote className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Collection Rate
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-700">{paidPercent}%</p>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Payment history ─────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Payment History
        </p>

        {!history.length ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No payment records yet.</p>
          </div>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
            {history.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl leading-none">
                    {PAYMENT_MODE_ICON[p.mode] ?? '💳'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {p.mode.replace(/_/g, ' ')} · {formatDate(p.paidAt)}
                    </p>
                    {p.note && (
                      <p className="text-[11px] text-slate-400 italic">{p.note}</p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  #{p.bookingId?.slice(-8).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}