'use client';

// app/(dashboard)/vendors/_components/tabs/VendorOverviewTab.tsx
// ─────────────────────────────────────────────────────────────

import { Building2, Phone, Mail, MapPin, Percent, CreditCard, FileText } from 'lucide-react';
import { VendorDetail } from '@/types/vendors';
import { formatDate } from '../vendor.constants';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50/60 rounded-xl p-4 space-y-1">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

export function VendorOverviewTab({ vendor }: { vendor: VendorDetail }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Section title="Basic Details">
        <InfoRow label="Vendor Name"    value={vendor.name} />
        <InfoRow label="Types"          value={vendor.types?.join(', ') || vendor.serviceType} />
        <InfoRow label="City"           value={vendor.city} />
        <InfoRow label="Country"        value={vendor.country} />
        <InfoRow label="Address"        value={vendor.address} />
        <InfoRow label="Since"          value={formatDate(vendor.createdAt)} />
      </Section>

      <Section title="Contact Information">
        <InfoRow label="Contact Person" value={vendor.contactPerson} />
        <InfoRow label="Phone"          value={vendor.phone} />
        <InfoRow label="Email"          value={vendor.email} />
      </Section>

      <Section title="GST & Legal">
        <InfoRow label="GSTIN" value={vendor.gstin} />
        <InfoRow label="PAN"   value={vendor.pan} />
      </Section>

      <Section title="Financial">
        <InfoRow label="Commission"     value={vendor.commissionPercentage ? `${vendor.commissionPercentage}%` : undefined} />
        <InfoRow label="Negotiated Rates" value={vendor.negotiatedRates} />
      </Section>

      <Section title="Bank Details">
        <InfoRow label="Bank Name"      value={vendor.bankName} />
        <InfoRow label="Account Name"   value={vendor.accountName} />
        <InfoRow label="Account No."    value={vendor.accountNumber} />
        <InfoRow label="IFSC"           value={vendor.ifscCode} />
        <InfoRow label="UPI ID"         value={vendor.upiId} />
      </Section>

      {vendor.notes && (
        <Section title="Internal Notes">
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{vendor.notes}</p>
        </Section>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// VendorBookingsTab
// ─────────────────────────────────────────────────────────────

import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { VendorBooking } from '@/types/vendors';

const BOOKING_STATUS_COLOR: Record<string, string> = {
  CONFIRMED:    'bg-emerald-100 text-emerald-700',
  PENDING:      'bg-amber-100 text-amber-700',
  COMPLETED:    'bg-slate-100 text-slate-600',
  CANCELLED:    'bg-red-100 text-red-600',
  IN_PROGRESS:  'bg-blue-100 text-blue-700',
  DRAFT:        'bg-slate-100 text-slate-500',
};

export function VendorBookingsTab({ bookings }: { bookings: VendorBooking[] }) {
  const router = useRouter();

  if (!bookings.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-400">No bookings found for this vendor.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Booking</th>
            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-3 py-2.5 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {bookings.map((b) => (
            <tr key={b.bookingItemId} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-3 py-2.5">
                <p className="font-mono text-xs text-slate-500">#{b.bookingId?.slice(-6).toUpperCase() ?? '—'}</p>
                <p className="text-[11px] text-slate-400">{b.type}</p>
              </td>
              <td className="px-3 py-2.5">
                <p className="font-medium text-slate-700 text-sm">{b.customerName}</p>
                {b.customerPhone && <p className="text-[11px] text-slate-400">{b.customerPhone}</p>}
              </td>
              <td className="px-3 py-2.5 text-xs text-slate-500">{formatDate(b.date)}</td>
              <td className="px-3 py-2.5">
                {b.amount != null
                  ? <span className="font-semibold text-slate-700">{formatCurrency(b.amount)}</span>
                  : <span className="text-slate-300">—</span>
                }
              </td>
              <td className="px-3 py-2.5">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${BOOKING_STATUS_COLOR[b.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {b.status}
                </span>
              </td>
              <td className="px-3 py-2.5">
                {b.bookingId && (
                  <button
                    onClick={() => router.push(`/bookings/${b.bookingId}`)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// VendorPaymentsTab
// ─────────────────────────────────────────────────────────────

import { VendorPayments } from '@/types/vendors';

export function VendorPaymentsTab({ payments }: { payments: VendorPayments }) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(payments.totalPaid)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(payments.pendingAmount)}</p>
        </div>
      </div>

      {/* History */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment History</p>
        {!payments.history.length ? (
          <p className="text-sm text-slate-400 text-center py-8">No payment records yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.history.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">{formatCurrency(p.amount)}</p>
                  <p className="text-[11px] text-slate-400">{p.mode} · {formatDate(p.paidAt)}</p>
                  {p.note && <p className="text-[11px] text-slate-400">{p.note}</p>}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  #{p.bookingId?.slice(-6).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// VendorPerformanceTab
// ─────────────────────────────────────────────────────────────

import { VendorPerformance, VendorSummary } from '@/types/vendors';

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function VendorPerformanceTab({
  performance,
  summary,
}: {
  performance: VendorPerformance;
  summary: VendorSummary;
}) {
  const reliabilityColor =
    performance.reliabilityScore >= 70
      ? 'bg-emerald-500'
      : performance.reliabilityScore >= 40
      ? 'bg-amber-500'
      : 'bg-red-500';

  const cancellationColor =
    performance.cancellationRate <= 10
      ? 'bg-emerald-500'
      : performance.cancellationRate <= 30
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Metrics */}
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reliability Score</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-800">{performance.reliabilityScore}</p>
            <p className="text-sm text-slate-400 pb-1">/ 100</p>
          </div>
          <ScoreBar score={performance.reliabilityScore} color={reliabilityColor} />
          <p className="text-[11px] text-slate-400">Based on total bookings and cancellation rate</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cancellation Rate</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-800">{performance.cancellationRate}%</p>
            <p className="text-sm text-slate-400 pb-1">{performance.cancelledCount} cancelled</p>
          </div>
          <ScoreBar score={Math.min(performance.cancellationRate, 100)} color={cancellationColor} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 content-start">
        {[
          { label: 'Total Bookings',  value: performance.totalBookings,  color: 'text-blue-600' },
          { label: 'Active Now',       value: performance.activeCount,    color: 'text-emerald-600' },
          { label: 'Cancelled',        value: performance.cancelledCount, color: 'text-red-500' },
          { label: 'Last Used',        value: formatDate(performance.lastUsedDate), color: 'text-slate-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-4">
            <p className="text-[11px] font-medium text-slate-400 mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// VendorNotesTab
// ─────────────────────────────────────────────────────────────

import { useState as useStateFn } from 'react';
import { useMutation as useMutationFn, useQueryClient as useQCFn } from '@tanstack/react-query';
import { Plus, Trash2, Pencil as PencilIcon, Check, X } from 'lucide-react';
import { Button as Btn } from '@/components/ui/button';
import { Textarea as TA } from '@/components/ui/textarea';
import { vendorNotesService } from '@/services';
import { VendorNote } from '@/types/vendors';

export function VendorNotesTab({ vendorId, notes }: { vendorId: string; notes: VendorNote[] }) {
  const qc = useQCFn();
  const [newNote, setNewNote] = useStateFn('');
  const [editId, setEditId]   = useStateFn<string | null>(null);
  const [editVal, setEditVal] = useStateFn('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['vendors', vendorId] });

  const addMutation = useMutationFn({
    mutationFn: () => vendorNotesService.add(vendorId, { content: newNote }),
    onSuccess: () => { invalidate(); setNewNote(''); toast.success('Note added'); },
  });

  const updateMutation = useMutationFn({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      vendorNotesService.update(vendorId, noteId, { content }),
    onSuccess: () => { invalidate(); setEditId(null); toast.success('Note updated'); },
  });

  const deleteMutation = useMutationFn({
    mutationFn: (noteId: string) => vendorNotesService.delete(vendorId, noteId),
    onSuccess: () => { invalidate(); toast.success('Note deleted'); },
  });

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Note</p>
        <TA
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          placeholder="Service quality remarks, pricing notes, warnings..."
          className="bg-white text-sm"
        />
        <div className="flex justify-end">
          <Btn
            size="sm"
            onClick={() => addMutation.mutate()}
            disabled={!newNote.trim() || addMutation.isPending}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Note
          </Btn>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {!notes.length && (
          <p className="text-sm text-slate-400 text-center py-8">No notes yet. Add your first note above.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            {editId === note.id ? (
              <div className="space-y-2">
                <TA
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  rows={3}
                  className="bg-white text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Btn
                    size="sm" variant="outline"
                    onClick={() => setEditId(null)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Btn>
                  <Btn
                    size="sm"
                    onClick={() => updateMutation.mutate({ noteId: note.id, content: editVal })}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {note.createdBy?.name ?? 'Unknown'} · {formatDate(note.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditId(note.id); setEditVal(note.content); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(note.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}