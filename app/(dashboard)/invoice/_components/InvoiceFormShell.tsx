// app/invoice/_components/InvoiceFormShell.tsx
'use client';

import { GstInvoice } from '@/types/invoice';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { CustomerSelector } from './CustomerSelector';
import { BookingSelector } from './BookingSelector';
import { VendorSelector } from './VendorSelector';
import { BookingPaymentSummary } from './BookingPaymentSummary';
import { InvoiceItemsEditor } from './InvoiceItemsEditor';
import { GstSummaryPanel } from './GstSummaryPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Loader2,
  User, Calendar, Package, Calculator, StickyNote,
  Link2, Building2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/invoiceUtils';

interface Props {
  existing?: GstInvoice;
  defaultCompanyState?: string;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{title}</p>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export function InvoiceFormShell({ existing, defaultCompanyState }: Props) {
  const router = useRouter();
  const form = useInvoiceForm(existing);

  const isEdit = !!existing;

  // Find selected vendor from options (for display)
  const selectedVendorOption =
    form.vendorId
      ? form.vendorOptions.find((v) => v.id === form.vendorId) ?? null
      : null;

  return (
    <div className="flex flex-col gap-0 min-h-screen bg-muted/30">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-base">
              {isEdit ? `Edit ${existing.invoiceNumber}` : 'New Invoice'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? 'Update invoice details' : 'Create a GST-compliant invoice'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border bg-violet-50 px-4 py-1.5 sm:flex">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-bold text-violet-700 font-mono">
              {formatCurrency(form.totals.totalAmount)}
            </span>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit}
            disabled={form.saving}
            className="gap-1.5 bg-violet-600 hover:bg-violet-700"
          >
            {form.saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto w-full max-w-5xl flex flex-col gap-5 px-6 py-6">

        {/* ── Section 1: Client Details ── */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <SectionHeader
              icon={User}
              title="Client Details"
              subtitle="Select existing or enter manually"
            />
          </div>
          <div className="p-5">
            <CustomerSelector
              value={form.billing}
              onChange={form.setBilling}
            />
            {form.errors.billingName && (
              <p className="mt-2 text-xs text-destructive">{form.errors.billingName}</p>
            )}
          </div>
        </div>

        {/* ── Section 2: Booking & Vendor Link ── */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <SectionHeader
              icon={Link2}
              title="Link Booking & Vendor"
              subtitle="Optional — links invoice to booking and/or vendor"
              badge={
                (form.bookingId || form.vendorId) ? (
                  <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Linked
                  </span>
                ) : null
              }
            />
          </div>
          <div className="p-5 space-y-5">
            {/* Booking dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Booking
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              {!form.billing.customerId ? (
                <p className="text-xs text-muted-foreground rounded-lg border border-dashed px-3 py-2.5">
                  Select a customer first to see their bookings
                </p>
              ) : (
                <BookingSelector
                  bookings={form.customerBookings}
                  value={form.bookingId}
                  onChange={form.setBookingId}
                  loading={form.bookingsLoading}
                />
              )}
            </div>
          
{form.bookingId && !form.summaryLoading && (
  <p className="text-[11px] text-violet-600 flex items-center gap-1.5">
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
    Invoice items auto-filled from booking — edit karo agar zaroori ho
  </p>
)}

            {/* Booking payment summary */}
            <BookingPaymentSummary
              summary={form.bookingPaymentSummary}
              loading={form.summaryLoading}
            />

            {/* Divider */}
            <div className="border-t" />

            {/* Vendor dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Vendor
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <VendorSelector
                value={form.vendorId}
                selectedVendor={selectedVendorOption}
                onSearch={form.searchVendors}
                onSelect={form.setVendorId}
                options={form.vendorOptions}
                loading={form.vendorSearchLoading}
              />
              {form.vendorId && (
                <p className="text-[11px] text-muted-foreground">
                  Vendor will be linked. Outgoing payment entry will be created when payment is recorded.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Invoice Dates ── */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <SectionHeader icon={Calendar} title="Invoice Dates" />
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Issue Date *</Label>
              <Input
                type="date"
                value={form.issueDate}
                onChange={(e) => form.setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Due Date{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => form.setDueDate(e.target.value)}
                min={form.issueDate}
              />
            </div>
          </div>
        </div>

        {/* ── Section 4: Items ── */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <SectionHeader
              icon={Package}
              title="Invoice Items"
              subtitle="Add services or products"
            />
            {form.errors.items && (
              <Badge variant="destructive" className="text-xs">{form.errors.items}</Badge>
            )}
          </div>
          <div className="p-5">
            <InvoiceItemsEditor items={form.items} onChange={form.setItems} />
          </div>
        </div>

        {/* ── Section 5: GST & Totals ── */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <SectionHeader
              icon={Calculator}
              title="Tax & Discount"
              subtitle="GST auto-calculated"
            />
          </div>
          <div className="p-5">
            <GstSummaryPanel
              items={form.items}
              gstRate={form.gstRate}
              gstType={form.gstType}
              discountType={form.discountType}
              discountValue={form.discountValue}
              onGstRateChange={form.setGstRate}
              onGstTypeChange={form.setGstType}
              onDiscountTypeChange={form.setDiscountType}
              onDiscountValueChange={form.setDiscountValue}
            />
          </div>
        </div>

        {/* ── Section 6: Notes & Terms ── */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <SectionHeader
              icon={StickyNote}
              title="Notes & Terms"
              subtitle="Visible on invoice PDF"
            />
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => form.setNotes(e.target.value)}
                placeholder="Thank you for your business!"
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={form.terms}
                onChange={(e) => form.setTerms(e.target.value)}
                placeholder="Payment due within 30 days."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
          <div className="text-sm text-muted-foreground">
            Grand Total:{' '}
            <span className="text-lg font-bold text-violet-700 font-mono">
              {formatCurrency(form.totals.totalAmount)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit}
              disabled={form.saving}
              className="gap-1.5 bg-violet-600 hover:bg-violet-700"
            >
              {form.saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}