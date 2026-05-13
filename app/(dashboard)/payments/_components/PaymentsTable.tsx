'use client';

import { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, MoreHorizontal,
  Loader2, Inbox, ExternalLink, Trash2, Eye,
  Building2, User,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { UnifiedPayment, UnifiedPaymentPagination } from '@/types/payment';

interface Props {
  payments: UnifiedPayment[];
  pagination: UnifiedPaymentPagination | undefined;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onDelete: (payment: UnifiedPayment) => void;
  onViewCustomer: (customerId: string) => void;
  onViewVendor: (vendorId: string) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  BOOKING: 'Booking',
  INVOICE: 'Invoice',
  TICKET: 'Flight Deal',
  MANUAL: 'Manual',
};

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  PARTIAL: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  UNPAID: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  REFUNDED: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  CHEQUE: 'Cheque',
};

export default function PaymentsTable({
  payments, pagination, isLoading, onPageChange, onDelete, onViewCustomer, onViewVendor,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm">Loading payments...</span>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Inbox className="h-10 w-10 opacity-30" />
        <p className="text-sm">No payments found</p>
        <p className="text-xs opacity-70">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Party</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Source</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Method</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {payments.map((payment) => {
              const isIncoming = payment.type === 'INCOMING';
              const partyName = payment.customer?.name ?? payment.vendor?.name ?? payment.deal?.buyer.brokerName ?? '—';
              const partyType = payment.customer ? 'customer' : payment.vendor ? 'vendor' : 'deal';

              return (
                <TableRow key={payment.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Type */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'rounded-full p-1',
                          isIncoming
                            ? 'bg-emerald-100 dark:bg-emerald-950/60'
                            : 'bg-rose-100 dark:bg-rose-950/60',
                        )}
                      >
                        {isIncoming
                          ? <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                          : <ArrowUpRight className="h-3 w-3 text-rose-600" />
                        }
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          isIncoming ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400',
                        )}
                      >
                        {isIncoming ? 'Incoming' : 'Outgoing'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Party */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="rounded-full bg-muted p-0.5">
                        {partyType === 'customer'
                          ? <User className="h-3 w-3 text-muted-foreground" />
                          : <Building2 className="h-3 w-3 text-muted-foreground" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[140px]">{partyName}</p>
                        {payment.customer?.phone && (
                          <p className="text-[11px] text-muted-foreground">{payment.customer.phone}</p>
                        )}
                        {payment.deal && (
                          <p className="text-[11px] text-muted-foreground">
                            {payment.deal.seller.fromCity} → {payment.deal.seller.toCity}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <div className="space-y-1">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {SOURCE_LABELS[payment.source] ?? payment.source}
                      </span>
                      {payment.invoice?.invoiceNumber && (
                        <p className="text-[11px] text-muted-foreground">
                          #{payment.invoice.invoiceNumber}
                        </p>
                      )}
                      {payment.reference && (
                        <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]">
                          {payment.reference}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        isIncoming ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
                    </span>
                  </TableCell>

                  {/* Method */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {METHOD_LABELS[payment.method] ?? payment.method}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-[11px] font-medium', STATUS_STYLES[payment.status])}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(payment.paidAt)}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {payment.customer && (
                          <DropdownMenuItem onClick={() => onViewCustomer(payment.customer!.id)}>
                            <User className="h-3.5 w-3.5 mr-2" />
                            Customer Profile
                          </DropdownMenuItem>
                        )}
                        {payment.vendor && (
                          <DropdownMenuItem onClick={() => onViewVendor(payment.vendor!.id)}>
                            <Building2 className="h-3.5 w-3.5 mr-2" />
                            Vendor Profile
                          </DropdownMenuItem>
                        )}
                        {payment.source !== 'MANUAL' && (
                          <DropdownMenuItem asChild>
                            <a
                              href={
                                payment.source === 'BOOKING'
                                  ? `/bookings/${payment.bookingId}`
                                  : payment.source === 'INVOICE'
                                  ? `/invoices/${payment.invoiceId}`
                                  : `/tickets/deals/${payment.dealId}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-2" />
                              View Source
                            </a>
                          </DropdownMenuItem>
                        )}
                        {payment.source === 'MANUAL' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              onClick={() => onDelete(payment)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(pagination.page - 1)}
                  className={cn(
                    'cursor-pointer',
                    pagination.page <= 1 && 'pointer-events-none opacity-40',
                  )}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-xs px-3 py-1.5 font-medium">
                  {pagination.page} / {pagination.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(pagination.page + 1)}
                  className={cn(
                    'cursor-pointer',
                    pagination.page >= pagination.totalPages && 'pointer-events-none opacity-40',
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}