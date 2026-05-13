'use client';

import { useState } from 'react';
import {
  MoreHorizontal, FileText, Eye, Send, Trash2, Receipt,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Payment } from '@/types/payment';
import { StatusBadge, ModeBadge } from './PaymentBadges';

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  onViewReceipt: (payment: Payment) => void;
  onSendReminder: (payment: Payment) => void;
  onSendConfirmation: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onViewDetail: (payment: Payment) => void;
}

const fmt = (val: number | null | undefined) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val ?? 0);

const fmtDate = (val: string | null | undefined) =>
  val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export function PaymentTable({
  payments,
  isLoading,
  onViewReceipt,
  onSendReminder,
  onSendConfirmation,
  onDelete,
  onViewDetail,
}: PaymentTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Booking</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Paid</TableHead>
              <TableHead className="text-xs">Due</TableHead>
              <TableHead className="text-xs">Mode</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="rounded-lg border border-border/50 border-dashed flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Receipt className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No payments found</p>
        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-medium text-muted-foreground">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Booking</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Amount</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Paid</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Due</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Mode</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow
              key={payment.id}
              className="group hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onViewDetail(payment)}
            >
              <TableCell>
                <div>
                  <p className="text-sm font-medium leading-none">{payment.customer?.name ?? '—'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{payment.customer?.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                {payment.bookingId ? (
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    #{payment.bookingId.slice(-8).toUpperCase()}
                  </code>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm font-medium">₹{fmt(payment.amount)}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  ₹{fmt(payment.paidAmount)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={`text-sm font-medium ${(payment.dueAmount ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                  ₹{fmt(payment.dueAmount)}
                </span>
              </TableCell>
              <TableCell>
                <ModeBadge mode={payment.mode} />
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">{fmtDate(payment.paidAt ?? payment.createdAt)}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={payment.status} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onViewDetail(payment)}>
                      <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewReceipt(payment)}>
                      <Receipt className="w-3.5 h-3.5 mr-2" /> View Receipt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSendConfirmation(payment)}>
                      <Send className="w-3.5 h-3.5 mr-2" /> Send Confirmation
                    </DropdownMenuItem>
                    {(payment.dueAmount ?? 0) > 0 && (
                      <DropdownMenuItem onClick={() => onSendReminder(payment)}>
                        <FileText className="w-3.5 h-3.5 mr-2" /> Send Reminder
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(payment)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}