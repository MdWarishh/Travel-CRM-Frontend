// app/invoice/_components/InvoiceItemsEditor.tsx

'use client';

import { InvoiceItemInput } from '@/types/invoice';
import { formatCurrency } from '@/lib/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Props {
  items: InvoiceItemInput[];
  onChange: (items: InvoiceItemInput[]) => void;
}

const emptyItem = (): InvoiceItemInput => ({
  description: '',
  hsn: '',
  quantity: 1,
  unit: 'Nos',
  price: 0,
});

export function InvoiceItemsEditor({ items, onChange }: Props) {
  const update = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  };

  const addItem = () => onChange([...items, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((s, it) => s + (it.quantity || 0) * (it.price || 0), 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden grid-cols-[1fr_80px_80px_100px_120px_36px] gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
        <span>Description</span>
        <span>HSN/SAC</span>
        <span>Unit</span>
        <span>Qty</span>
        <span className="text-right">Price (₹)</span>
        <span />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="group relative rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
          >
            <div className="grid gap-2 lg:grid-cols-[1fr_80px_80px_100px_120px_36px]">
              {/* Description */}
              <div>
                <Label className="text-xs text-muted-foreground lg:hidden">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => update(i, 'description', e.target.value)}
                  placeholder="Service or product description"
                  className="h-9"
                />
              </div>

              {/* HSN */}
              <div>
                <Label className="text-xs text-muted-foreground lg:hidden">HSN/SAC</Label>
                <Input
                  value={item.hsn ?? ''}
                  onChange={(e) => update(i, 'hsn', e.target.value)}
                  placeholder="HSN"
                  className="h-9"
                />
              </div>

              {/* Unit */}
              <div>
                <Label className="text-xs text-muted-foreground lg:hidden">Unit</Label>
                <Input
                  value={item.unit ?? ''}
                  onChange={(e) => update(i, 'unit', e.target.value)}
                  placeholder="Nos"
                  className="h-9"
                />
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-xs text-muted-foreground lg:hidden">Qty</Label>
              
<Input
  type="number"
  value={item.price}
  onChange={(e) => update(i, 'price', parseFloat(e.target.value) || 0)}
  // min={0}  ← YE LINE HATAO
  className="h-9 text-right font-mono"
  placeholder="0.00"
/>
              </div>

              {/* Price */}
              <div>
                <Label className="text-xs text-muted-foreground lg:hidden">Price (₹)</Label>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => update(i, 'price', parseFloat(e.target.value) || 0)}
                  min={0}
                  className="h-9 text-right font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Delete */}
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Row total */}
            <div className="mt-1 flex justify-end">
              <span className="text-xs text-muted-foreground">
                Total:{' '}
                <span className="font-semibold text-foreground font-mono">
                  {formatCurrency((item.quantity || 0) * (item.price || 0))}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add + Subtotal row */}
      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
        <div className="text-sm">
          <span className="text-muted-foreground">Subtotal: </span>
          <span className="font-mono font-bold text-foreground">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}