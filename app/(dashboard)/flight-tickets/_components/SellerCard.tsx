'use client';

import { useState } from 'react';
import {
  Pencil, Trash2, Clock, Users, IndianRupee, Plane,
  ChevronDown, ChevronUp, Building2, Hash, Tag, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { TicketSeller } from '@/types/ticket.types';
import { format } from 'date-fns';

const CLASS_COLOR: Record<string, string> = {
  ECONOMY: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  BUSINESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  FIRST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const SOURCE_ICON: Record<string, string> = {
  EMAIL: '📧', WHATSAPP: '💬', PHONE: '📞', WALK_IN: '🚶', ONLINE: '🌐',
};

interface Props {
  seller: TicketSeller;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetail?: () => void;
}

export function SellerCard({ seller, canEdit, canDelete, onEdit, onDelete, onViewDetail }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dealCount = seller.deals?.length ?? 0;
  const hasActiveDeals = seller.deals?.some(d => d.status !== 'REJECTED') ?? false;

  return (
    <>
      <div
        className={cn(
          'rounded-xl border bg-card transition-all duration-150 group',
          'hover:border-primary/30 hover:shadow-sm',
          onViewDetail && 'cursor-pointer',
        )}
        onClick={onViewDetail}
      >
        {/* Main row */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-semibold truncate">{seller.brokerName}</p>
                {seller.ticketClass && (
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', CLASS_COLOR[seller.ticketClass])}>
                    {seller.ticketClass}
                  </span>
                )}
                {onViewDetail && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-opacity flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {seller.fromCity} → {seller.toCity}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
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

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] bg-muted/60 rounded-full px-2 py-0.5">
              <Clock className="h-2.5 w-2.5" />
              {seller.departureTime} – {seller.arrivalTime}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-muted/60 rounded-full px-2 py-0.5">
              <Users className="h-2.5 w-2.5" />
              {seller.seatsAvailable} seats
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-muted/60 rounded-full px-2 py-0.5">
              <IndianRupee className="h-2.5 w-2.5" />
              {seller.pricePerSeat.toLocaleString('en-IN')}
            </span>
            {seller.airline && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-full px-2 py-0.5">
                <Plane className="h-2.5 w-2.5" />
                {seller.airline} {seller.flightNumber}
              </span>
            )}
          </div>

          {/* Date + deal count */}
          <div className="flex items-center justify-between mt-2" onClick={e => e.stopPropagation()}>
            <p className="text-[11px] text-muted-foreground">
              {format(new Date(seller.travelDate), 'dd MMM yyyy')}
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

        {/* Expanded */}
        {expanded && (
          <div className="border-t px-3.5 py-3 space-y-1.5 bg-muted/20" onClick={e => e.stopPropagation()}>
            {seller.pnr && (
              <div className="flex items-center gap-2 text-xs">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">PNR:</span>
                <span className="font-mono font-medium">{seller.pnr}</span>
              </div>
            )}
            {seller.bookingRef && (
              <div className="flex items-center gap-2 text-xs">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Booking Ref:</span>
                <span className="font-mono">{seller.bookingRef}</span>
              </div>
            )}
            {seller.purchasePrice && (
              <div className="flex items-center gap-2 text-xs">
                <IndianRupee className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Purchase Price:</span>
                <span>₹{seller.purchasePrice.toLocaleString('en-IN')}/seat</span>
              </div>
            )}
            {seller.purchasedFrom && (
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Purchased from:</span>
                <span>{seller.purchasedFrom}</span>
              </div>
            )}
            {seller.sourceChannel && (
              <div className="flex items-center gap-2 text-xs">
                <span>{SOURCE_ICON[seller.sourceChannel]}</span>
                <span className="text-muted-foreground">Source:</span>
                <span>{seller.sourceChannel}</span>
              </div>
            )}
            {seller.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">{seller.notes}</p>
            )}
            {seller.totalValue && (
              <div className="pt-1 border-t mt-1.5">
                <p className="text-xs font-medium">
                  Total value: ₹{seller.totalValue.toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove seller listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {seller.brokerName}'s listing for {seller.fromCity} → {seller.toCity}.
              {hasActiveDeals && ' This seller has active deals — they will also be affected.'}
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