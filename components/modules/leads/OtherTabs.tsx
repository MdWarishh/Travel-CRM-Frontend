'use client';

// ─── History Tab ──────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { leadsService } from '@/services/leads.service';
import { PipelineLead } from '@/types/leads.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Activity, Loader2, Plus, Trash2, FileText, Clock, CheckCircle2,
  XCircle, User, Tag, Bell,
} from 'lucide-react';

const ACTION_ICONS: Record<string, any> = {
  created:            { icon: Plus,         color: 'bg-emerald-100 text-emerald-600' },
  updated:            { icon: Activity,     color: 'bg-blue-100 text-blue-600'      },
  stage_changed:      { icon: Activity,     color: 'bg-purple-100 text-purple-600'  },
  assigned:           { icon: User,         color: 'bg-violet-100 text-violet-600'  },
  note_added:         { icon: FileText,     color: 'bg-amber-100 text-amber-600'    },
  followup_added:     { icon: Bell,         color: 'bg-orange-100 text-orange-600'  },
  followup_completed: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600'},
  task_created:       { icon: Tag,          color: 'bg-blue-100 text-blue-600'      },
  meeting_created:    { icon: User,         color: 'bg-pink-100 text-pink-600'      },
  converted:          { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600'},
  quotation_created:  { icon: FileText,     color: 'bg-indigo-100 text-indigo-600'  },
  invoice_created:    { icon: FileText,     color: 'bg-teal-100 text-teal-600'      },
};

export function HistoryTab({ lead }: { lead: PipelineLead }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['lead-activities', lead.id],
    queryFn: () => leadsService.getActivities(lead.id),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    </div>
  );

  if (activities.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Activity className="w-10 h-10 mb-3 text-slate-200" />
      <p className="text-sm font-medium text-slate-500">No activity yet</p>
    </div>
  );

  return (
    <div className="space-y-1">
      {activities.map((act: any, i: number) => {
        const config = ACTION_ICONS[act.action] ?? { icon: Activity, color: 'bg-slate-100 text-slate-500' };
        const Icon = config.icon;
        return (
          <div key={act.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[12px]" />}
            </div>
            <div className="pb-3 flex-1 min-w-0 pt-0.5">
              <p className="text-[12.5px] font-medium text-slate-700 leading-snug">{act.description || act.action.replace(/_/g, ' ')}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {act.user && <span className="text-[11px] text-slate-400">by <span className="font-medium text-slate-500">{act.user.name}</span></span>}
                <span className="text-[11px] text-slate-400">
                  {new Date(act.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Quotation Tab ────────────────────────────────────────────────────────────

const QT_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT:    { label: 'Draft',    cls: 'bg-slate-100 text-slate-500 border-slate-200'   },
  SENT:     { label: 'Sent',     cls: 'bg-blue-50 text-blue-600 border-blue-200'       },
  ACCEPTED: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200'},
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-500 border-red-200'         },
  EXPIRED:  { label: 'Expired',  cls: 'bg-slate-100 text-slate-400 border-slate-200'  },
};

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const emptyItem = (): LineItem => ({ description: '', quantity: 1, unitPrice: 0 });

export function QuotationTab({ lead }: { lead: PipelineLead }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['lead-quotations', lead.id],
    queryFn: () => leadsService.getQuotations(lead.id),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => leadsService.createQuotation(lead.id, data),
    onSuccess: () => {
      toast.success('Quotation created');
      qc.invalidateQueries({ queryKey: ['lead-quotations', lead.id] });
      setShowForm(false);
      setItems([emptyItem()]); setDiscount('0'); setTax('0'); setNotes(''); setValidUntil('');
    },
    onError: () => toast.error('Failed to create quotation'),
  });

  const updateMut = useMutation({
    mutationFn: ({ qtId, data }: { qtId: string; data: any }) =>
      leadsService.updateQuotation(lead.id, qtId, data),
    onSuccess: () => {
      toast.success('Quotation updated');
      qc.invalidateQueries({ queryKey: ['lead-quotations', lead.id] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (qtId: string) => leadsService.deleteQuotation(lead.id, qtId),
    onSuccess: () => {
      toast.success('Quotation deleted');
      qc.invalidateQueries({ queryKey: ['lead-quotations', lead.id] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const subtotal = items.reduce((a, it) => a + it.quantity * it.unitPrice, 0);
  const total    = subtotal - Number(discount) + Number(tax);

  const setItem = (i: number, key: keyof LineItem, val: string | number) =>
    setItems((p) => p.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{quotations.length} Quotation{quotations.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create Quotation
        </Button>
      </div>

      {showForm && (
        <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">New Quotation</p>
          {/* Items */}
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_60px_90px_24px] gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-1">
              <span>Description</span><span className="text-center">Qty</span><span className="text-center">Price (₹)</span><span />
            </div>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-[1fr_60px_90px_24px] gap-2 items-center">
                <Input value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)}
                  placeholder="Item description" className="h-7 text-xs border-slate-200" />
                <Input type="number" min={1} value={it.quantity} onChange={(e) => setItem(i, 'quantity', Number(e.target.value))}
                  className="h-7 text-xs border-slate-200 text-center" />
                <Input type="number" min={0} value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', Number(e.target.value))}
                  className="h-7 text-xs border-slate-200 text-right" />
                <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                  className="w-5 h-5 rounded text-slate-300 hover:text-red-500 flex items-center justify-center">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setItems((p) => [...p, emptyItem()])}
              className="h-6 text-[11px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1 px-2">
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>
          {/* Totals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs text-slate-600">Discount (₹)</Label>
              <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-7 text-xs border-slate-200" />
            </div>
            <div className="space-y-1"><Label className="text-xs text-slate-600">Tax (₹)</Label>
              <Input type="number" min={0} value={tax} onChange={(e) => setTax(e.target.value)} className="h-7 text-xs border-slate-200" />
            </div>
            <div className="space-y-1"><Label className="text-xs text-slate-600">Valid Until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="h-7 text-xs border-slate-200" />
            </div>
          </div>
          <div className="space-y-1"><Label className="text-xs text-slate-600">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes…" className="text-xs border-slate-200 resize-none" />
          </div>
          {/* Summary */}
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-[12px] space-y-0.5">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-slate-500"><span>Discount</span><span>-₹{Number(discount).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-slate-500"><span>Tax</span><span>+₹{Number(tax).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-1 mt-1">
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="h-7 text-xs">Cancel</Button>
            <Button size="sm" disabled={createMut.isPending} onClick={() => {
              if (items.some((it) => !it.description.trim())) { toast.error('All items need a description'); return; }
              createMut.mutate({
                items, discount: Number(discount), tax: Number(tax), notes,
                ...(validUntil && { validUntil }),
              });
            }} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Quotation'}
            </Button>
          </div>
        </div>
      )}

      {quotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mb-3 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No quotations yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quotations.map((qt: any) => {
            const st = QT_STATUS[qt.status] ?? QT_STATUS.DRAFT;
            return (
              <div key={qt.id} className="border border-slate-200 rounded-xl p-3.5 bg-white hover:shadow-sm transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{qt.quotationNumber}</p>
                    <p className="text-[11px] text-slate-400">{new Date(qt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', st.cls)}>{st.label}</span>
                    {qt.status === 'DRAFT' && (
                      <button onClick={() => updateMut.mutate({ qtId: qt.id, data: { status: 'SENT' } })}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium">
                        Mark Sent
                      </button>
                    )}
                    <button onClick={() => deleteMut.mutate(qt.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-[11px] space-y-0.5 border border-slate-100">
                  {qt.items?.map((it: any, i: number) => (
                    <div key={i} className="flex justify-between text-slate-500">
                      <span>{it.description} × {it.quantity}</span>
                      <span>₹{it.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-bold text-slate-700">
                    <span>Total</span><span>₹{qt.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Invoice Tab ──────────────────────────────────────────────────────────────

const INV_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-500 border-slate-200'   },
  SENT:      { label: 'Sent',      cls: 'bg-blue-50 text-blue-600 border-blue-200'       },
  PAID:      { label: 'Paid',      cls: 'bg-emerald-50 text-emerald-600 border-emerald-200'},
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-500 border-red-200'         },
};

export function InvoiceTab({ lead }: { lead: PipelineLead }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['lead-invoices', lead.id],
    queryFn: () => leadsService.getInvoices(lead.id),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => leadsService.createInvoice(lead.id, data),
    onSuccess: () => {
      toast.success('Invoice created');
      qc.invalidateQueries({ queryKey: ['lead-invoices', lead.id] });
      setShowForm(false);
      setItems([emptyItem()]); setDiscount('0'); setTax('0'); setNotes(''); setDueDate('');
    },
    onError: () => toast.error('Failed to create invoice'),
  });

  const updateMut = useMutation({
    mutationFn: ({ invId, data }: { invId: string; data: any }) =>
      leadsService.updateInvoice(lead.id, invId, data),
    onSuccess: () => {
      toast.success('Invoice updated');
      qc.invalidateQueries({ queryKey: ['lead-invoices', lead.id] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (invId: string) => leadsService.deleteInvoice(lead.id, invId),
    onSuccess: () => {
      toast.success('Invoice deleted');
      qc.invalidateQueries({ queryKey: ['lead-invoices', lead.id] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const subtotal = items.reduce((a, it) => a + it.quantity * it.unitPrice, 0);
  const total    = subtotal - Number(discount) + Number(tax);
  const setItem  = (i: number, key: keyof LineItem, val: string | number) =>
    setItems((p) => p.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{invoices.length} Invoice{invoices.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create Invoice
        </Button>
      </div>

      {showForm && (
        <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">New Invoice</p>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_60px_90px_24px] gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-1">
              <span>Description</span><span className="text-center">Qty</span><span className="text-center">Price (₹)</span><span />
            </div>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-[1fr_60px_90px_24px] gap-2 items-center">
                <Input value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)}
                  placeholder="Item description" className="h-7 text-xs border-slate-200" />
                <Input type="number" min={1} value={it.quantity} onChange={(e) => setItem(i, 'quantity', Number(e.target.value))}
                  className="h-7 text-xs border-slate-200 text-center" />
                <Input type="number" min={0} value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', Number(e.target.value))}
                  className="h-7 text-xs border-slate-200 text-right" />
                <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                  className="w-5 h-5 rounded text-slate-300 hover:text-red-500 flex items-center justify-center">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setItems((p) => [...p, emptyItem()])}
              className="h-6 text-[11px] text-indigo-600 hover:bg-indigo-50 gap-1 px-2">
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs text-slate-600">Discount (₹)</Label>
              <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-7 text-xs border-slate-200" />
            </div>
            <div className="space-y-1"><Label className="text-xs text-slate-600">Tax (₹)</Label>
              <Input type="number" min={0} value={tax} onChange={(e) => setTax(e.target.value)} className="h-7 text-xs border-slate-200" />
            </div>
            <div className="space-y-1"><Label className="text-xs text-slate-600">Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-7 text-xs border-slate-200" />
            </div>
          </div>
          <div className="space-y-1"><Label className="text-xs text-slate-600">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes…" className="text-xs border-slate-200 resize-none" />
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-[12px] space-y-0.5">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-slate-500"><span>Discount</span><span>-₹{Number(discount).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-slate-500"><span>Tax</span><span>+₹{Number(tax).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold text-slate-800 border-t pt-1 mt-1">
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="h-7 text-xs">Cancel</Button>
            <Button size="sm" disabled={createMut.isPending} onClick={() => {
              if (items.some((it) => !it.description.trim())) { toast.error('All items need a description'); return; }
              createMut.mutate({
                items, discount: Number(discount), tax: Number(tax), notes,
                ...(dueDate && { dueDate }),
              });
            }} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Invoice'}
            </Button>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mb-3 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv: any) => {
            const st = INV_STATUS[inv.status] ?? INV_STATUS.DRAFT;
            const remaining = inv.total - (inv.paidAmount ?? 0);
            return (
              <div key={inv.id} className="border border-slate-200 rounded-xl p-3.5 bg-white hover:shadow-sm transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-slate-400">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', st.cls)}>{st.label}</span>
                    {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                      <button onClick={() => updateMut.mutate({ invId: inv.id, data: { status: 'PAID', paidAmount: inv.total } })}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium">
                        Mark Paid
                      </button>
                    )}
                    <button onClick={() => deleteMut.mutate(inv.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-[11px] space-y-0.5 border border-slate-100">
                  {inv.items?.map((it: any, i: number) => (
                    <div key={i} className="flex justify-between text-slate-500">
                      <span>{it.description} × {it.quantity}</span>
                      <span>₹{it.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-1 mt-1 space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Total</span><span>₹{inv.total.toLocaleString('en-IN')}</span>
                    </div>
                    {inv.paidAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Paid</span><span>₹{inv.paidAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {remaining > 0 && inv.status !== 'CANCELLED' && (
                      <div className="flex justify-between text-red-500 font-medium">
                        <span>Remaining</span><span>₹{remaining.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
                {inv.dueDate && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    Due: {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}