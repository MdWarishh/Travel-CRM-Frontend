// app/invoice/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GstInvoice } from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import { InvoiceFormShell } from '../../_components/InvoiceFormShell';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<GstInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceService.getById(id)
      .then(setInvoice)
      .catch(() => {
        toast.error('Invoice not found');
        router.push('/invoice');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoice) return null;

  if (['PAID', 'CANCELLED'].includes(invoice.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold">Cannot edit this invoice</p>
        <p className="text-sm text-muted-foreground">
          Invoices with status <strong>{invoice.status}</strong> cannot be edited.
        </p>
        <button
          onClick={() => router.push(`/invoice/${id}`)}
          className="text-sm text-violet-600 hover:underline"
        >
          ← Back to invoice
        </button>
      </div>
    );
  }

  return <InvoiceFormShell existing={invoice} />;
}