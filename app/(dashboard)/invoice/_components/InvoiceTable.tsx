// app/invoice/_components/InvoiceTable.tsx

'use client';

import { useState } from 'react';
import { GstInvoice, InvoiceStatus } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/invoiceUtils';
import { InvoiceActions } from './InvoiceActions';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { invoiceService } from '@/services/invoice.service';
import { toast } from 'sonner';
import { ChevronDown, CheckCircle2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ── Status config — component se BAHAR ────────────────────────
const STATUS_OPTIONS: {
  value: InvoiceStatus;
  label: string;
  color: string;
  bg: string;
  dot: string;
}[] = [
  { value: 'DRAFT',     label: 'Draft',     color: 'text-slate-600',   bg: 'bg-slate-100',  dot: 'bg-slate-400' },
  { value: 'SENT',      label: 'Sent',      color: 'text-blue-600',    bg: 'bg-blue-50',    dot: 'bg-blue-500' },
  { value: 'UNPAID',    label: 'Unpaid',    color: 'text-rose-600',    bg: 'bg-rose-50',    dot: 'bg-rose-500' },
  { value: 'PARTIAL',   label: 'Partial',   color: 'text-amber-600',   bg: 'bg-amber-50',   dot: 'bg-amber-500' },
  { value: 'PAID',      label: 'Paid',      color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600',     bg: 'bg-red-50',     dot: 'bg-red-500' },
];

// ── StatusDropdown — component se BAHAR ───────────────────────
function StatusDropdown({
  invoice,
  onRefresh,
}: {
  invoice: GstInvoice;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_OPTIONS.find((s) => s.value === invoice.status) ?? STATUS_OPTIONS[0];

  const handleSelect = async (newStatus: InvoiceStatus) => {
    if (newStatus === invoice.status) return;
    setLoading(true);
    try {
      await invoiceService.updateStatus(invoice.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      onRefresh();
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
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            'hover:opacity-80 focus:outline-none transition-opacity',
            loading && 'opacity-50 cursor-not-allowed',
            cfg.bg, cfg.color
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
          {cfg.label}
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-40"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Change Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_OPTIONS.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onClick={() => handleSelect(s.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className={cn('h-2 w-2 rounded-full shrink-0', s.dot)} />
            <span className={s.color}>{s.label}</span>
            {s.value === invoice.status && (
              <CheckCircle2 className="h-3 w-3 ml-auto text-violet-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Main Table Component ───────────────────────────────────────
interface Props {
  invoices: GstInvoice[];
  isLoading?: boolean;
  onRefresh: () => void;
}

export function InvoiceTable({ invoices = [], isLoading, onRefresh }: Props) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-3 font-medium text-foreground">No invoices found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="font-semibold">Invoice #</TableHead>
          <TableHead className="font-semibold">Client</TableHead>
          <TableHead className="font-semibold">Issue Date</TableHead>
          <TableHead className="font-semibold">Due Date</TableHead>
          <TableHead className="font-semibold text-right">Amount</TableHead>
          <TableHead className="font-semibold text-right">Paid</TableHead>
          <TableHead className="font-semibold text-right">Due</TableHead>
          <TableHead className="font-semibold">Status</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => router.push(`/invoice/${invoice.id}`)}
          >
            <TableCell>
              <span className="font-mono text-sm font-semibold text-violet-700">
                {invoice.invoiceNumber}
              </span>
            </TableCell>

            <TableCell>
              <div>
                <p className="font-medium text-sm">{invoice.billingName}</p>
                {invoice.billingPhone && (
                  <p className="text-xs text-muted-foreground">{invoice.billingPhone}</p>
                )}
              </div>
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
              {formatDate(invoice.issueDate)}
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
              {formatDate(invoice.dueDate)}
            </TableCell>

            <TableCell className="text-right font-semibold text-sm">
              {formatCurrency(invoice.totalAmount)}
            </TableCell>

            <TableCell className="text-right text-sm text-emerald-600 font-medium">
              {formatCurrency(invoice.paidAmount)}
            </TableCell>

            <TableCell className="text-right text-sm text-rose-600 font-medium">
              {formatCurrency(invoice.dueAmount)}
            </TableCell>

            {/* ── Status Dropdown ── */}
            <TableCell onClick={(e) => e.stopPropagation()}>
              <StatusDropdown invoice={invoice} onRefresh={onRefresh} />
            </TableCell>

            <TableCell onClick={(e) => e.stopPropagation()}>
              <InvoiceActions invoice={invoice} onRefresh={onRefresh} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}