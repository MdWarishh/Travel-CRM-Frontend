'use client';

// ═══════════════════════════════════════════════
// TRAVELLERS TAB
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, User, Loader2, MessageCircle, CheckCircle2,
  Circle, Clock, IndianRupee, X, AlertCircle, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BookingTraveller, BookingDay, BookingPayment, BookingLog,
  Booking, PaymentsResponse,
} from '@/types/booking';
import { bookingsService } from '@/services/bookings.service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ── Travellers ────────────────────────────────
export function TravellersTab({ bookingId, travellers, onChange }: {
  bookingId: string;
  travellers: BookingTraveller[];
  onChange: (t: BookingTraveller[]) => void;
}) {
  const [form, setForm] = useState({ name: '', age: '', gender: '', idProof: '' });
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    try {
      setAdding(true);
      const t = await bookingsService.addTraveller(bookingId, {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        idProof: form.idProof || undefined,
      });
      onChange([...travellers, t]);
      setForm({ name: '', age: '', gender: '', idProof: '' });
      toast.success('Traveller added');
    } catch { toast.error('Failed to add traveller'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await bookingsService.deleteTraveller(bookingId, id);
      onChange(travellers.filter((t) => t.id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
    finally { setDeleteId(null); }
  };

  const GENDER_COLORS: Record<string, string> = {
    MALE: 'bg-blue-50 text-blue-600 border-blue-200',
    FEMALE: 'bg-pink-50 text-pink-600 border-pink-200',
    OTHER: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div className="space-y-5">
      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Travellers</h3>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-0.5">
            {travellers.length} added
          </span>
        </div>
        <div className="divide-y divide-slate-50">
          {travellers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No travellers added</p>
              <p className="text-xs text-slate-300 mt-1">Add pax details below</p>
            </div>
          ) : travellers.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 group transition-colors">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {t.age && <span className="text-xs text-slate-400">{t.age} yrs</span>}
                  {t.gender && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${GENDER_COLORS[t.gender] ?? ''}`}>
                      {t.gender}
                    </Badge>
                  )}
                  {t.idProof && (
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">{t.idProof}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDeleteId(t.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Add Traveller</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Full Name *</Label>
            <Input
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Age</Label>
            <Input
              type="number"
              placeholder="e.g. 32"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Gender</Label>
            <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
              <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">ID Proof</Label>
            <Input
              placeholder="Aadhar / Passport no."
              value={form.idProof}
              onChange={(e) => set('idProof', e.target.value)}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={adding || !form.name.trim()}
          className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 gap-2"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Traveller
        </Button>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove traveller?</AlertDialogTitle>
            <AlertDialogDescription>This traveller will be removed from the booking.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ═══════════════════════════════════════════════
// PAYMENTS TAB
// ═══════════════════════════════════════════════

const PAYMENT_STATUS_CONFIG = {
  PAID:           { label: 'Fully Paid',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  PARTIAL:        { label: 'Partially Paid', cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  PARTIALLY_PAID: { label: 'Partially Paid', cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  PENDING:        { label: 'Payment Pending',cls: 'bg-red-50 text-red-600 border-red-200',              dot: 'bg-red-500' },
  UNPAID:         { label: 'Unpaid',         cls: 'bg-red-50 text-red-600 border-red-200',              dot: 'bg-red-500' },
};

const MODE_ICONS: Record<string, string> = {
  CASH: '💵', UPI: '📱', BANK_TRANSFER: '🏦', CHEQUE: '📄', CARD: '💳',
};

export function PaymentsTab({ bookingId, booking, onChange }: {
  bookingId: string;
  booking: Booking;
  onChange: (b: Booking) => void;
}) {
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [form, setForm] = useState({ amount: '', mode: 'CASH', note: '', paidAt: '' });
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const loadPayments = async () => {
    try {
      setLoadingPayments(true);
      const data = await bookingsService.getPayments(bookingId);
      setPaymentsData(data);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoadingPayments(false); }
  };

  useEffect(() => { loadPayments(); }, [bookingId]);

  const handleAdd = async () => {
    if (!form.amount) return;
    try {
      setAdding(true);
      await bookingsService.addPayment(bookingId, {
        amount: parseFloat(form.amount),
        mode: form.mode,
        note: form.note || undefined,
        paidAt: form.paidAt || undefined,
      });
      // Refresh payments + full booking (for header summary update)
      const [updatedData, updatedBooking] = await Promise.all([
        bookingsService.getPayments(bookingId),
        bookingsService.getById(bookingId),
      ]);
      setPaymentsData(updatedData);
      onChange(updatedBooking);
      setForm({ amount: '', mode: 'CASH', note: '', paidAt: '' });
      toast.success('Payment recorded');
    } catch { toast.error('Failed to record payment'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (paymentId: string) => {
    try {
      await bookingsService.deletePayment(bookingId, paymentId);
      const [updatedData, updatedBooking] = await Promise.all([
        bookingsService.getPayments(bookingId),
        bookingsService.getById(bookingId),
      ]);
      setPaymentsData(updatedData);
      onChange(updatedBooking);
      toast.success('Payment removed');
    } catch { toast.error('Failed to remove payment'); }
    finally { setDeleteId(null); }
  };

  if (loadingPayments) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const summary = paymentsData?.summary;
  const payments = paymentsData?.payments ?? [];
  const totalAmount = summary?.totalAmount ?? 0;
  const totalPaid = summary?.totalPaid ?? 0;
  const dueAmount = summary?.dueAmount ?? 0;
  const paymentStatus = summary?.paymentStatus ?? booking.paymentStatus ?? 'PENDING';
  const statusCfg = PAYMENT_STATUS_CONFIG[paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG] ?? PAYMENT_STATUS_CONFIG.PENDING;
  const progressPct = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  return (
    <div className="space-y-5">

      {/* ── Payment Status + Progress ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Payment Summary</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 ${statusCfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Paid</span>
            <span className="font-semibold">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                progressPct === 100 ? 'bg-emerald-500' : progressPct > 50 ? 'bg-blue-500' : 'bg-amber-500'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Amount cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Total</p>
            <p className="text-lg font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">Paid</p>
            <p className="text-lg font-bold text-emerald-700">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className={cn('rounded-xl p-3 text-center', dueAmount > 0 ? 'bg-red-50 border border-red-100' : 'bg-slate-50')}>
            <p className={cn('text-[10px] font-semibold uppercase tracking-wide mb-1', dueAmount > 0 ? 'text-red-500' : 'text-slate-400')}>
              Due
            </p>
            <p className={cn('text-lg font-bold', dueAmount > 0 ? 'text-red-600' : 'text-slate-400')}>
              ₹{dueAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Per-person breakdown */}
        {summary?.breakdown && summary.breakdown.length > 0 && (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Per Person Breakdown</p>
            </div>
            <div className="divide-y divide-slate-50">
              {summary.breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">₹{item.unitPrice.toLocaleString('en-IN')} × {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">₹{item.total.toLocaleString('en-IN')}</p>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <p className="text-sm font-semibold text-slate-700">Total Package</p>
                <p className="text-sm font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Payment History ── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Payment History</h3>
          <span className="text-xs text-slate-400">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="divide-y divide-slate-50">
          {payments.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <IndianRupee className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No payments recorded yet</p>
            </div>
          ) : payments.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group transition-colors">
              {/* Index circle */}
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-emerald-600">{payments.length - i}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">₹{p.amount.toLocaleString('en-IN')}</p>
                  <span className="text-sm">{MODE_ICONS[p.mode] ?? '💰'}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-500 font-mono">
                    {p.mode}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{format(new Date(p.paidAt), 'dd MMM yyyy, h:mm a')}</span>
                  {p.note && (
                    <>
                      <span className="text-slate-200">·</span>
                      <span className="text-xs text-slate-500 italic truncate max-w-[180px]">{p.note}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setDeleteId(p.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Running total footer */}
        {payments.length > 1 && (
          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Total collected
            </span>
            <span className="text-sm font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* ── Record Payment ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Record Payment</h3>
          {dueAmount > 0 && (
            <button
              onClick={() => setField('amount', String(dueAmount))}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              Fill due: ₹{dueAmount.toLocaleString('en-IN')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Amount (₹) *</Label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Mode</Label>
            <Select value={form.mode} onValueChange={(v) => setField('mode', v)}>
              <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD'].map((m) => (
                  <SelectItem key={m} value={m}>{MODE_ICONS[m]} {m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Payment Date</Label>
            <Input
              type="date"
              value={form.paidAt}
              onChange={(e) => setField('paidAt', e.target.value)}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Note (optional)</Label>
            <Input
              placeholder="e.g. Advance via UPI"
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          disabled={adding || !form.amount}
          className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 gap-2"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
          Record Payment
        </Button>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This payment entry will be deleted and the balance will be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TIMELINE TAB
// ═══════════════════════════════════════════════

export function TimelineTab({ bookingId, logs, onChange }: {
  bookingId: string;
  logs: BookingLog[];
  onChange: (logs: BookingLog[]) => void;
}) {
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!note.trim()) return;
    try {
      setAdding(true);
      const log = await bookingsService.addLog(bookingId, note.trim());
      onChange([log, ...logs]);
      setNote('');
      toast.success('Note added');
    } catch { toast.error('Failed'); }
    finally { setAdding(false); }
  };

  return (
    <div className="space-y-5">
      {/* Add manual note */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Add Note</h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Called driver, confirmed pickup..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="rounded-xl border-slate-200"
          />
          <Button
            onClick={handleAdd}
            disabled={adding || !note.trim()}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 gap-2 shrink-0"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Activity Timeline</h3>
          <span className="text-xs text-slate-400">{logs.length} events</span>
        </div>
        <div className="p-5">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">No activity yet</div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white',
                      log.type === 'MANUAL' ? 'bg-blue-100' : 'bg-slate-100'
                    )}>
                      {log.type === 'MANUAL'
                        ? <User className="h-3.5 w-3.5 text-blue-500" />
                        : <Clock className="h-3.5 w-3.5 text-slate-400" />
                      }
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm text-slate-700 leading-snug">{log.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-1.5 py-0',
                            log.type === 'MANUAL' ? 'border-blue-200 text-blue-500' : 'border-slate-200 text-slate-400'
                          )}
                        >
                          {log.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// DAYS TAB
// ═══════════════════════════════════════════════

interface DaysTabProps {
  bookingId: string;
  days: BookingDay[];
  hasItinerary: boolean;
  travelStart?: string;
  onChange: (days: BookingDay[]) => void;
}

export function DaysTab({ bookingId, days, hasItinerary, travelStart, onChange }: DaysTabProps) {
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Add day modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', date: '' });
  const [addLoading, setAddLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const generated = await bookingsService.generateDays(bookingId);
      onChange(generated);
      toast.success('Days generated from itinerary');
    } catch { toast.error('Failed to generate days'); }
    finally { setGenerating(false); }
  };

  const handleStatusChange = async (day: BookingDay, status: BookingDay['status']) => {
    try {
      const updated = await bookingsService.updateDay(bookingId, day.id, { status });
      onChange(days.map((d) => (d.id === day.id ? updated : d)));
    } catch { toast.error('Failed to update'); }
  };

  const handleSaveNotes = async (day: BookingDay) => {
    try {
      const updated = await bookingsService.updateDay(bookingId, day.id, { notes });
      onChange(days.map((d) => (d.id === day.id ? updated : d)));
      setEditingId(null);
      toast.success('Notes saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleAddDay = async () => {
    if (!addForm.title.trim()) return;
    try {
      setAddLoading(true);
      const nextNum = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
      const newDay = await bookingsService.addDay(bookingId, {
        dayNumber: nextNum,
        title: addForm.title,
        description: addForm.description || undefined,
        date: addForm.date || undefined,
      });
      onChange([...days, newDay].sort((a, b) => a.dayNumber - b.dayNumber));
      setAddForm({ title: '', description: '', date: '' });
      setAddOpen(false);
      toast.success(`Day ${nextNum} added`);
    } catch { toast.error('Failed to add day'); }
    finally { setAddLoading(false); }
  };

  const handleDeleteDay = async (dayId: string) => {
    try {
      await bookingsService.deleteDay(bookingId, dayId);
      onChange(days.filter((d) => d.id !== dayId));
      toast.success('Day removed');
    } catch { toast.error('Failed to delete day'); }
    finally { setDeleteId(null); }
  };

  const STATUS_CONFIG = {
    PENDING:     { icon: Circle,       color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
    IN_PROGRESS: { icon: Clock,        color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
    COMPLETED:   { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  };

  const completedCount = days.filter((d) => d.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {hasItinerary && (
          <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-800">Generate from Itinerary</p>
              <p className="text-xs text-blue-600 mt-0.5">Auto-fill day titles and descriptions</p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              size="sm"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 gap-2 shrink-0"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {days.length > 0 ? 'Regenerate' : 'Generate Days'}
            </Button>
          </div>
        )}
        <Button
          onClick={() => setAddOpen(true)}
          size="sm"
          variant="outline"
          className="rounded-xl h-9 gap-1.5 text-xs shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Day
        </Button>
      </div>

      {/* Progress summary */}
      {days.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            {days.length} days total
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            {completedCount}/{days.length} completed
          </span>
        </div>
      )}

      {/* Days list */}
      {days.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 text-center py-14">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📅</span>
          </div>
          <p className="text-sm text-slate-400">No days added yet</p>
          {hasItinerary && <p className="text-xs text-slate-300 mt-1">Click "Generate Days" or add manually</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => {
            const cfg = STATUS_CONFIG[day.status];
            const Icon = cfg.icon;
            return (
              <div key={day.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group">
                <div className="flex items-center gap-3 px-5 py-4">
                  {/* Day number */}
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">D{day.dayNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {day.title ?? `Day ${day.dayNumber}`}
                    </p>
                    {day.date && (
                      <p className="text-xs text-slate-400">{format(new Date(day.date), 'EEE, dd MMM yyyy')}</p>
                    )}
                  </div>

                  {/* Status selector */}
                  <Select
                    value={day.status}
                    onValueChange={(v) => handleStatusChange(day, v as BookingDay['status'])}
                  >
                    <SelectTrigger className={`w-36 h-8 rounded-xl border text-xs font-medium ${cfg.bg}`}>
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteId(day.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Description */}
                {day.description && (
                  <div className="px-5 pb-3">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{day.description}</p>
                  </div>
                )}

                {/* Notes inline editor */}
                <div className="px-5 pb-4">
                  {editingId === day.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add notes for this day..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="rounded-xl border-slate-200 text-sm resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveNotes(day)} className="rounded-xl h-7 text-xs bg-slate-900 hover:bg-slate-800">
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl h-7 text-xs">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(day.id); setNotes(day.notes ?? ''); }}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {day.notes ? `📝 ${day.notes}` : '+ Add notes'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Day Modal ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold">📅 Add Day</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Day Title *</Label>
              <Input
                placeholder="e.g. Arrival & Local Sightseeing"
                value={addForm.title}
                onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                className="rounded-xl border-slate-200 h-9 text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Date (optional)</Label>
              <Input
                type="date"
                value={addForm.date}
                onChange={(e) => setAddForm((p) => ({ ...p, date: e.target.value }))}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Description (optional)</Label>
              <Textarea
                placeholder="Day plan details..."
                value={addForm.description}
                onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                className="rounded-xl border-slate-200 text-sm resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-0 gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl" disabled={addLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDay}
              disabled={addLoading || !addForm.title.trim()}
              className="bg-slate-900 hover:bg-slate-800 rounded-xl gap-2"
            >
              {addLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add Day {days.length > 0 ? `(Day ${Math.max(...days.map((d) => d.dayNumber)) + 1})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove day?</AlertDialogTitle>
            <AlertDialogDescription>This day will be permanently removed from the booking.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeleteDay(deleteId)} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── WhatsApp Modal ────────────────────────────
export function WhatsAppModal({ open, onClose, bookingId }: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}) {
  const [type, setType] = useState('TRIP_START');
  const [data, setData] = useState<{ message: string; phone: string; whatsappUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (t: string) => {
    try {
      setLoading(true);
      const result = await bookingsService.getWhatsappMessage(bookingId, t);
      setData(result);
    } catch { toast.error('Failed to load message'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open) load(type);
  }, [open]);

  const handleTypeChange = (t: string) => { setType(t); load(t); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Send WhatsApp
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Message Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIP_START">🚀 Trip Start (Day Before)</SelectItem>
                <SelectItem value="DAILY">📅 Daily Update</SelectItem>
                <SelectItem value="FINAL_DAY">🌟 Final Day</SelectItem>
                <SelectItem value="POST_TRIP">💌 Post Trip Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : data ? (
            <div className="space-y-3">
              <Label className="text-xs font-medium text-slate-600">Message Preview</Label>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{data.message}</pre>
              </div>
              {data.phone && (
                <p className="text-xs text-slate-400">
                  Sending to: <span className="font-mono font-semibold text-slate-600">{data.phone}</span>
                </p>
              )}
            </div>
          ) : null}
        </div>
        <DialogFooter className="px-6 pb-6 pt-0 gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          {data?.whatsappUrl && (
            <Button onClick={() => window.open(data.whatsappUrl, '_blank')} className="rounded-xl bg-green-600 hover:bg-green-700 gap-2">
              <MessageCircle className="h-4 w-4" />
              Open WhatsApp
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}