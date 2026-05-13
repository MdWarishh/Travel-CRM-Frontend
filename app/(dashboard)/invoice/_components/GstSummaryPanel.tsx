// app/invoice/_components/GstSummaryPanel.tsx

'use client';

import { GstType, InvoiceItemInput, DiscountType } from '@/types/invoice';
import { calculateTotals, formatCurrency, GST_TYPE_LABELS } from '@/lib/invoiceUtils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Props {
  items: InvoiceItemInput[];
  gstRate: number;
  gstType: GstType;
  discountType?: DiscountType | null;
  discountValue?: number;
  onGstRateChange: (rate: number) => void;
  onGstTypeChange: (type: GstType) => void;
  onDiscountTypeChange: (type: DiscountType | null) => void;
  onDiscountValueChange: (value: number) => void;
}

const GST_RATES = [0, 5, 12, 18, 28];

export function GstSummaryPanel({
  items, gstRate, gstType, discountType, discountValue = 0,
  onGstRateChange, onGstTypeChange, onDiscountTypeChange, onDiscountValueChange,
}: Props) {
  const totals = calculateTotals({ items, discountType, discountValue, gstRate, gstType });

  return (
    <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
      <h3 className="font-semibold text-sm">Tax & Discount</h3>

      {/* Discount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Discount Type</Label>
          <Select
            value={discountType ?? 'none'}
            onValueChange={(v) => onDiscountTypeChange(v === 'none' ? null : v as DiscountType)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Discount</SelectItem>
              <SelectItem value="PERCENT">Percentage (%)</SelectItem>
              <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {discountType && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              {discountType === 'PERCENT' ? 'Discount %' : 'Discount ₹'}
            </Label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
              min={0}
              className="h-9 font-mono"
            />
          </div>
        )}
      </div>

      {/* GST Config */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">GST Rate (%)</Label>
          <Select
            value={String(gstRate)}
            onValueChange={(v) => onGstRateChange(Number(v))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GST_RATES.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r === 0 ? 'No GST (0%)' : `${r}%`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">GST Type</Label>
          <Select value={gstType} onValueChange={(v) => onGstTypeChange(v as GstType)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(GST_TYPE_LABELS) as [GstType, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Totals breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Discount</span>
            <span className="font-mono">− {formatCurrency(totals.discountAmount)}</span>
          </div>
        )}
        {gstType !== 'NONE' && (
          <>
            {gstType === 'CGST_SGST' ? (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>CGST ({totals.cgstRate}%)</span>
                  <span className="font-mono">{formatCurrency(totals.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>SGST ({totals.sgstRate}%)</span>
                  <span className="font-mono">{formatCurrency(totals.sgstAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-muted-foreground">
                <span>IGST ({totals.igstRate}%)</span>
                <span className="font-mono">{formatCurrency(totals.igstAmount)}</span>
              </div>
            )}
          </>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="font-mono text-violet-700">{formatCurrency(totals.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}