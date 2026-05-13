// app/invoice/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService } from '@/services/invoice.service';
import {
  GstInvoice, CompanySettings, UpdateInvoicePayload,
  GstType, DiscountType, InvoiceItemInput,
} from '@/types/invoice';
import { CustomerSelector } from '../_components/CustomerSelector';
import { InvoiceItemsEditor } from '../_components/InvoiceItemsEditor';
import { GstSummaryPanel } from '../_components/GstSummaryPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface BillingInfo {
  customerId?: string;
  billingName: string;
  billingPhone?: string;
  billingEmail?: string;
  billingAddress?: string;
  billingState?: string;
  customerGstin?: string;
}

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<GstInvoice | null>(null);

  // Form state
  const [billing, setBilling] = useState<BillingInfo>({ billingName: '' });
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState<GstType>('CGST_SGST');
  const [discountType, setDiscountType] = useState<DiscountType | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  useEffect(() => {
    invoiceService.getById(id)
      .then((inv) => {
        setInvoice(inv);
        setBilling({
          customerId: inv.customerId ?? undefined,
          billingName: inv.billingName,
          billingPhone: inv.billingPhone ?? '',
          billingEmail: inv.billingEmail ?? '',
          billingAddress: inv.billingAddress ?? '',
          billingState: inv.billingState ?? '',
          customerGstin: inv.customerGstin ?? '',
        });
        setItems(inv.items.map((it) => ({
          description: it.description,
          hsn: it.hsn ?? '',
          quantity: it.quantity,
          unit: it.unit ?? 'Nos',
          price: it.price,
        })));
        setIssueDate(inv.issueDate.split('T')[0]);
        setDueDate(inv.dueDate?.split('T')[0] ?? '');
        setGstRate(inv.gstRate);
        setGstType(inv.gstType);
        setDiscountType(inv.discountType ?? null);
        setDiscountValue(inv.discountValue ?? 0);
        setNotes(inv.notes ?? '');
        setTerms(inv.terms ?? '');
      })
      .catch(() => { toast.error('Invoice not found'); router.push('/invoice'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!billing.billingName.trim()) { toast.error('Billing name required'); return; }

    const payload: UpdateInvoicePayload = {
      customerId: billing.customerId,
      billingName: billing.billingName,
      billingPhone: billing.billingPhone,
      billingEmail: billing.billingEmail,
      billingAddress: billing.billingAddress,
      billingState: billing.billingState,
      customerGstin: billing.customerGstin,
      issueDate,
      dueDate: dueDate || undefined,
      items: items.filter((it) => it.description.trim()),
      discountType: discountType ?? undefined,
      discountValue: discountType ? discountValue : undefined,
      gstRate,
      gstType,
      notes: notes || undefined,
      terms: terms || undefined,
    };

    setSaving(true);
    try {
      await invoiceService.update(id, payload);
      toast.success('Invoice updated');
      router.push(`/invoice/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-lg px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-lg px-4 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Edit Invoice</h1>
            <p className="text-xs text-muted-foreground font-mono">{invoice?.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Bill To</h2>
              <CustomerSelector value={billing} onChange={setBilling} />
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Dates</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Issue Date</Label>
                  <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Items</h2>
              <InvoiceItemsEditor items={items} onChange={setItems} />
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Notes & Terms</h2>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Terms & Conditions</Label>
                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} />
              </div>
            </section>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <GstSummaryPanel
              items={items}
              gstRate={gstRate}
              gstType={gstType}
              discountType={discountType}
              discountValue={discountValue}
              onGstRateChange={setGstRate}
              onGstTypeChange={setGstType}
              onDiscountTypeChange={setDiscountType}
              onDiscountValueChange={setDiscountValue}
            />
            <div className="space-y-2">
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}