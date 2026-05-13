'use client';

// app/(dashboard)/vendors/_components/tabs/VendorBookingsTab.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { VendorBooking } from '@/types/vendors';
import { BOOKING_STATUS_COLOR, formatCurrency, formatDate } from '../vendor.constants';

// ── Pill helpers ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const cls = BOOKING_STATUS_COLOR[status] ?? 'bg-slate-100 text-slate-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PaymentPill({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    PAID:            'bg-emerald-100 text-emerald-700',
    PARTIAL:         'bg-amber-100 text-amber-700',
    PARTIALLY_PAID:  'bg-amber-100 text-amber-700',
    PENDING:         'bg-slate-100 text-slate-500',
    UNPAID:          'bg-red-100 text-red-600',
    REFUNDED:        'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function VendorBookingsTab({ bookings }: { bookings: VendorBooking[] }) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const sliced = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">No bookings yet</p>
        <p className="text-xs text-slate-400">This vendor hasn't been used in any booking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Booking</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Travel Date</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sliced.map((b) => (
              <tr
                key={b.bookingItemId}
                className="hover:bg-blue-50/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-semibold text-slate-600">
                    #{b.bookingId?.slice(-8).toUpperCase() ?? '—'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                    {b.type.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">{b.customerName}</p>
                  {b.customerPhone && (
                    <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(b.date)}
                </td>
                <td className="px-4 py-3">
                  {b.amount != null ? (
                    <span className="text-sm font-bold text-slate-700">
                      {formatCurrency(b.amount)}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={b.status} />
                </td>
                <td className="px-4 py-3">
                  <PaymentPill status={b.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  {b.bookingId && (
                    <button
                      onClick={() => router.push(`/bookings/${b.bookingId}`)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-600
                        hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, bookings.length)} of {bookings.length}
          </p>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}