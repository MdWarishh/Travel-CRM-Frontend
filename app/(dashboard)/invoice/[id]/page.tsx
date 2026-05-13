// app/invoice/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { GstInvoice, CompanySettings, InvoiceStatus } from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import { InvoicePdfTemplate } from '../_components/InvoicePdfTemplate';
import { InvoiceStatusBadge } from '../_components/InvoiceStatusBadge';
import { RecordPaymentDialog } from '../_components/RecordPaymentDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  ArrowLeft, Download, Pencil, Send, Copy,
  Trash2, IndianRupee, Printer, Share2,
  CheckCircle2, CreditCard, Eye, ChevronDown,
  FileText, Building2, Calendar, User, Hash,
  Percent, Receipt, AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, PAYMENT_MODE_LABELS, getPaymentProgress } from '@/lib/invoiceUtils';
import { cn } from '@/lib/utils';

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string; dot: string }> = {
  DRAFT:     { label: 'Draft',     color: 'text-slate-600',  bg: 'bg-slate-100',  dot: 'bg-slate-400' },
  SENT:      { label: 'Sent',      color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500' },
  UNPAID:    { label: 'Unpaid',    color: 'text-rose-600',   bg: 'bg-rose-50',    dot: 'bg-rose-500' },
  PARTIAL:   { label: 'Partial',   color: 'text-amber-600',  bg: 'bg-amber-50',   dot: 'bg-amber-500' },
  PAID:      { label: 'Paid',      color: 'text-emerald-600',bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600',    bg: 'bg-red-50',     dot: 'bg-red-500' },
};

const ALL_STATUSES: InvoiceStatus[] = ['DRAFT', 'SENT', 'UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'];

// ── Status Dropdown Component ──────────────────────────────────
function StatusDropdown({
  status,
  invoiceId,
  onUpdate,
}: {
  status: InvoiceStatus;
  invoiceId: string;
  onUpdate: (updated: GstInvoice) => void;
}) {
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_CONFIG[status];

  const handleSelect = async (newStatus: InvoiceStatus) => {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const updated = await invoiceService.updateStatus(invoiceId, newStatus);
      onUpdate(updated);
      toast.success(`Invoice marked as ${STATUS_CONFIG[newStatus].label}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
            'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1',
            cfg.bg, cfg.color,
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_STATUSES.map((s) => {
          const c = STATUS_CONFIG[s];
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleSelect(s)}
              className={cn('flex items-center gap-2 cursor-pointer', s === status && 'font-semibold')}
            >
              <span className={cn('h-2 w-2 rounded-full shrink-0', c.dot)} />
              <span className={c.color}>{c.label}</span>
              {s === status && <CheckCircle2 className="h-3 w-3 ml-auto text-violet-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoPrint = searchParams.get('print') === 'true';

  const [invoice, setInvoice] = useState<GstInvoice | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'payments'>('preview');

  const fetchData = useCallback(async () => {
    try {
      const [inv, comp] = await Promise.all([
        invoiceService.getById(id),
        invoiceService.getCompanySettings(),
      ]);
      setInvoice(inv);
      setCompany(comp);
    } catch {
      toast.error('Invoice not found');
      router.push('/invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (autoPrint && invoice && company) {
      setTimeout(() => handlePrint(), 800);
    }
  }, [autoPrint, invoice, company]);

  const handlePrint = () => {
    const el = document.getElementById('invoice-pdf-root');
    if (!el) return;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    const styles = Array.from(document.styleSheets)
      .map((ss) => { try { return Array.from(ss.cssRules).map((r) => r.cssText).join('\n'); } catch { return ''; } })
      .join('\n');
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${invoice?.invoiceNumber ?? 'Invoice'}</title><style>@page{size:A4;margin:0}body{margin:0;padding:0;font-family:'Noto Sans',sans-serif}${styles}</style><link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head><body>${el.outerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`);
    printWindow.document.close();
  };

  const handleDuplicate = async () => {
    if (!invoice) return;
    try {
      const dup = await invoiceService.duplicate(invoice.id);
      toast.success(`Invoice ${dup.invoiceNumber} created`);
      router.push(`/invoice/${dup.id}`);
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    try {
      await invoiceService.delete(invoice.id);
      toast.success('Invoice deleted');
      router.push('/invoice');
    } catch { toast.error('Failed to delete invoice'); }
  };

  const handleWhatsApp = () => {
    if (!invoice) return;
    const msg = encodeURIComponent(`Dear ${invoice.billingName},\n\nPlease find your invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.totalAmount)}.\n\nDue Date: ${formatDate(invoice.dueDate)}\n\nThank you!`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-[600px] rounded-xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice || !company) return null;

  const progress = getPaymentProgress(invoice);
  const canEdit = !['PAID', 'CANCELLED'].includes(invoice.status);
  const canPay = ['SENT', 'UNPAID', 'PARTIAL'].includes(invoice.status);
  const cfg = STATUS_CONFIG[invoice.status];

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-0 min-h-screen bg-slate-50/60">

        {/* ── Top Bar ── */}
        <div className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push('/invoice')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-base">{invoice.invoiceNumber}</span>
                  {/* Status badge — clickable dropdown in topbar too */}
                  <StatusDropdown
                    status={invoice.status}
                    invoiceId={invoice.id}
                    onUpdate={setInvoice}
                  />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {invoice.billingName} · {formatDate(invoice.issueDate)}
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 h-8">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download / Print as PDF</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1.5 h-8">
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share via WhatsApp</TooltipContent>
              </Tooltip>

              {canPay && (
                <Button
                  size="sm"
                  onClick={() => setPaymentOpen(true)}
                  className="gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700"
                >
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Record Payment</span>
                  <span className="sm:hidden">Pay</span>
                </Button>
              )}

              {canEdit && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/invoice/${invoice.id}/edit`)}
                  className="gap-1.5 h-8 bg-violet-600 hover:bg-violet-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" /> Duplicate Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Invoice
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="mx-auto w-full max-w-7xl grid gap-5 px-4 sm:px-6 py-5 lg:grid-cols-[1fr_340px]">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-4 min-w-0">

            {/* Tab switcher */}
            <div className="flex rounded-lg border bg-white p-1 w-fit shadow-sm">
              {(['preview', 'payments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                    activeTab === tab
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
                  )}
                >
                  {tab === 'preview' ? (
                    <><Eye className="h-3.5 w-3.5" /> Preview</>
                  ) : (
                    <>
                      <CreditCard className="h-3.5 w-3.5" /> Payments
                      {invoice.payments.length > 0 && (
                        <Badge
                          className={cn(
                            'ml-1 px-1.5 py-0 text-[10px] h-4',
                            activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                          )}
                        >
                          {invoice.payments.length}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Preview tab */}
            {activeTab === 'preview' && (
              <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="border-b bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Invoice Preview · A4</p>
                  <Button variant="ghost" size="sm" onClick={handlePrint} className="h-7 gap-1 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print / Download
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[210mm]">
                    <InvoicePdfTemplate invoice={invoice} company={company} />
                  </div>
                </div>
              </div>
            )}

            {/* Payments tab */}
            {activeTab === 'payments' && (
              <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div>
                    <h3 className="font-semibold text-sm">Payment History</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {invoice.payments.length} payment{invoice.payments.length !== 1 ? 's' : ''} recorded
                    </p>
                  </div>
                  {canPay && (
                    <Button size="sm" onClick={() => setPaymentOpen(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 h-8">
                      <IndianRupee className="h-3.5 w-3.5" /> Record Payment
                    </Button>
                  )}
                </div>

                {invoice.payments.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center px-6">
                    <div className="rounded-2xl bg-slate-100 p-4 mb-3">
                      <CreditCard className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No payments yet</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                      Record a payment to track collections against this invoice.
                    </p>
                    {canPay && (
                      <Button size="sm" onClick={() => setPaymentOpen(true)} className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                        <IndianRupee className="h-3.5 w-3.5" /> Record First Payment
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y">
                    {invoice.payments.map((pmt, idx) => (
                      <div key={pmt.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{PAYMENT_MODE_LABELS[pmt.mode]}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(pmt.paidAt)}
                              {pmt.transactionId && (
                                <span className="ml-1.5 font-mono bg-slate-100 px-1 rounded">{pmt.transactionId}</span>
                              )}
                            </p>
                            {pmt.note && <p className="text-xs text-muted-foreground truncate mt-0.5">{pmt.note}</p>}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 shrink-0 ml-3">
                          +{formatCurrency(pmt.amount)}
                        </span>
                      </div>
                    ))}

                    {/* Summary footer */}
                    <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Total Collected</span>
                      <span className="font-mono font-bold text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="flex flex-col gap-4">

            {/* Invoice Total Card */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {/* Gradient header */}
              <div className="relative bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-5 py-5 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <p className="text-xs font-medium text-violet-200 uppercase tracking-widest">Invoice Total</p>
                <p className="mt-1 text-4xl font-bold font-mono tracking-tight">
                  {formatCurrency(invoice.totalAmount)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-violet-300 font-mono">{invoice.invoiceNumber}</span>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Progress */}
                {invoice.totalAmount > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Collection Progress</span>
                      <span className="font-semibold text-violet-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          progress >= 100 ? 'bg-emerald-500' : 'bg-violet-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Amounts */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {(invoice.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> Discount</span>
                      <span className="font-mono">−{formatCurrency(invoice.discountAmount ?? 0)}</span>
                    </div>
                  )}

                  {invoice.gstType === 'CGST_SGST' && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>CGST ({invoice.cgstRate}%)</span>
                        <span className="font-mono">{formatCurrency(invoice.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>SGST ({invoice.sgstRate}%)</span>
                        <span className="font-mono">{formatCurrency(invoice.sgstAmount)}</span>
                      </div>
                    </>
                  )}
                  {invoice.gstType === 'IGST' && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>IGST ({invoice.igstRate}%)</span>
                      <span className="font-mono">{formatCurrency(invoice.igstAmount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="font-mono text-violet-700">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Paid</span>
                      <span className="font-mono font-semibold">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    <div className={cn('flex justify-between font-bold', invoice.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600')}>
                      <span className="flex items-center gap-1">
                        {invoice.dueAmount > 0 ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Balance Due
                      </span>
                      <span className="font-mono">{formatCurrency(invoice.dueAmount)}</span>
                    </div>
                  </div>
                </div>

                {canPay && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 gap-1.5 mt-2"
                    onClick={() => setPaymentOpen(true)}
                  >
                    <IndianRupee className="h-4 w-4" /> Record Payment
                  </Button>
                )}
              </div>
            </div>

            {/* Invoice Details Card */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-slate-50/80">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-violet-500" /> Invoice Details
                </h3>
              </div>
              <div className="p-5 space-y-3 text-sm">

                {/* Invoice # */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> Invoice #
                  </span>
                  <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
                </div>

                {/* Status — DROPDOWN HERE */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <StatusDropdown
                    status={invoice.status}
                    invoiceId={invoice.id}
                    onUpdate={setInvoice}
                  />
                </div>

                {/* Issue Date */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Issue Date
                  </span>
                  <span>{formatDate(invoice.issueDate)}</span>
                </div>

                {/* Due Date */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Due Date
                  </span>
                  <span className={cn(
                    invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID'
                      ? 'text-rose-600 font-medium'
                      : ''
                  )}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>

                <Separator />

                {/* GST */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">GST Type</span>
                  <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">
                    {invoice.gstType === 'CGST_SGST' ? 'CGST + SGST' : invoice.gstType === 'IGST' ? 'IGST' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">GST Rate</span>
                  <span className="font-medium">{invoice.gstRate}%</span>
                </div>

                <Separator />

                {/* Created by */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Created By
                  </span>
                  <span className="font-medium">{invoice.createdBy?.name ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Client Card */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-slate-50/80">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-500" /> Client
                </h3>
              </div>
              <div className="p-5 space-y-1.5 text-sm">
                <p className="font-bold text-base">{invoice.billingName}</p>
                {invoice.billingPhone && (
                  <p className="text-muted-foreground text-xs">📞 {invoice.billingPhone}</p>
                )}
                {invoice.billingEmail && (
                  <p className="text-muted-foreground text-xs">✉️ {invoice.billingEmail}</p>
                )}
                {invoice.billingAddress && (
                  <p className="text-muted-foreground text-xs">📍 {invoice.billingAddress}</p>
                )}
                {invoice.customerGstin && (
                  <p className="font-mono text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded mt-2 border border-violet-100">
                    GSTIN: {invoice.customerGstin}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-slate-50/80">
                <h3 className="font-semibold text-sm">Quick Actions</h3>
              </div>
              <div className="p-3 flex flex-col gap-1">
                <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={handlePrint}>
                  <Download className="h-4 w-4 text-violet-500" /> Download PDF
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={handleWhatsApp}>
                  <Share2 className="h-4 w-4 text-green-500" /> Share on WhatsApp
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 text-blue-500" /> Duplicate Invoice
                </Button>
                {canEdit && (
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={() => router.push(`/invoice/${invoice.id}/edit`)}>
                    <Pencil className="h-4 w-4 text-amber-500" /> Edit Invoice
                  </Button>
                )}
                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive hover:bg-rose-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" /> Delete Invoice
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <RecordPaymentDialog
        invoice={invoice}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={fetchData}
      />
    </TooltipProvider>
  );
}