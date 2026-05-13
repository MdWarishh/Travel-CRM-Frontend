// app/invoice/_components/InvoiceActions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GstInvoice } from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  MoreHorizontal, Eye, Pencil, Copy, Send, Trash2,
  Download, IndianRupee,
} from 'lucide-react';
import { RecordPaymentDialog } from './RecordPaymentDialog';

interface Props {
  invoice: GstInvoice;
  onRefresh: () => void;
}

export function InvoiceActions({ invoice, onRefresh }: Props) {
  const router = useRouter();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleMarkSent = async () => {
    try {
      await invoiceService.markAsSent(invoice.id);
      toast.success('Invoice marked as sent');
      onRefresh();
    } catch {
      toast.error('Failed to update invoice');
    }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await invoiceService.duplicate(invoice.id);
      toast.success(`Invoice ${dup.invoiceNumber} created`);
      onRefresh();
    } catch {
      toast.error('Failed to duplicate invoice');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this invoice? This action cannot be undone.')) return;
    try {
      await invoiceService.delete(invoice.id);
      toast.success('Invoice deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  const handleDownloadPdf = () => {
    router.push(`/invoice/${invoice.id}?print=true`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push(`/invoice/${invoice.id}`)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/invoice/${invoice.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {invoice.status === 'DRAFT' && (
            <DropdownMenuItem onClick={handleMarkSent}>
              <Send className="mr-2 h-4 w-4" /> Mark as Sent
            </DropdownMenuItem>
          )}
          {['SENT', 'UNPAID', 'PARTIAL'].includes(invoice.status) && (
            <DropdownMenuItem onClick={() => setPaymentOpen(true)}>
              <IndianRupee className="mr-2 h-4 w-4" /> Record Payment
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RecordPaymentDialog
        invoice={invoice}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}