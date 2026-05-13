'use client';

import { useState } from 'react';
import {
  Pencil, Trash2, Clock, Users, IndianRupee,
  ChevronDown, ChevronUp, CreditCard, User2, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { TicketBuyer } from '@/types/ticket.types';
import { format } from 'date-fns';

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface Props {
  buyer: TicketBuyer;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetail?: () => void;
}

export function BuyerCard({ buyer, canEdit, canDelete, onEdit, onDelete, onViewDetail }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dealCount = buyer.deals?.length ?? 0;
  const hasActiveDeals = buyer.deals?.some(d => d.status !== 'REJECTED') ?? false;

  return (
    <>
      <div
        className={cn(
          'rounded-xl border bg-card transition-all duration-150 group',
          'hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm',
          onViewDetail && 'cursor-pointer',
        )}
        onClick={onViewDetail}
      >
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-semibold truncate">{buyer.brokerName}</p>
                {onViewDetail && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-opacity flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {buyer.fromCity} → {buyer.toCity}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              {buyer.paymentStatus && (
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', PAYMENT_STATUS_COLOR[buyer.paymentStatus])}>
                  {buyer.paymentStatus}
                </span>
              )}
              {canEdit && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive/70 hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] bg-muted/60 rounded-full px-2 py-0.5">
              <Clock className="h-2.5 w-2.5" />
              {buyer.preferredTimeFrom} – {buyer.preferredTimeTo}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-muted/60 rounded-full px-2 py-0.5">
              <Users className="h-2.5 w-2.5" />
              {buyer.seatsRequired} seats
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded-full px-2 py-0.5">
              <IndianRupee className="h-2.5 w-2.5" />
              {buyer.budgetPerSeat.toLocaleString('en-IN')}/seat
            </span>
          </div>

          <div className="flex items-center justify-between mt-2" onClick={e => e.stopPropagation()}>
            <p className="text-[11px] text-muted-foreground">
              {format(new Date(buyer.travelDate), 'dd MMM yyyy')}
            </p>
            <div className="flex items-center gap-1.5">
              {dealCount > 0 && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                  hasActiveDeals
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {dealCount} deal{dealCount > 1 ? 's' : ''}
                </span>
              )}
              <button
                onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t px-3.5 py-3 space-y-1.5 bg-muted/20" onClick={e => e.stopPropagation()}>
            {buyer.passengerCount && (
              <div className="flex items-center gap-2 text-xs">
                <User2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Passengers:</span>
                <span>{buyer.passengerCount}</span>
              </div>
            )}
            {buyer.passengerNames && (
              <div className="flex items-start gap-2 text-xs">
                <User2 className="h-3 w-3 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Names:</span>
                <span className="break-words">{buyer.passengerNames}</span>
              </div>
            )}
            {buyer.agreedPricePerSeat && (
              <div className="flex items-center gap-2 text-xs">
                <IndianRupee className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Agreed price:</span>
                <span className="font-medium">₹{buyer.agreedPricePerSeat.toLocaleString('en-IN')}/seat</span>
              </div>
            )}
            {buyer.totalCollected !== undefined && buyer.totalCollected > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Collected:</span>
                <span className="font-medium text-emerald-600">₹{buyer.totalCollected.toLocaleString('en-IN')}</span>
              </div>
            )}
            {buyer.paymentRef && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Ref:</span>
                <span className="font-mono">{buyer.paymentRef}</span>
              </div>
            )}
            {buyer.notes && (
              <p className="text-xs text-muted-foreground italic">{buyer.notes}</p>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove buyer request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {buyer.brokerName}'s request for {buyer.fromCity} → {buyer.toCity}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}