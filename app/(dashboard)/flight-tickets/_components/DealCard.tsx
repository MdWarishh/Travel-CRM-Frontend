'use client';

import { ArrowRight, IndianRupee, TrendingUp, CheckCircle2, Clock, XCircle, Link2, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TicketDeal } from '@/types/ticket.types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <Clock className="h-3 w-3" />,
  },
  CONNECTED: {
    label: 'Connected',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Link2 className="h-3 w-3" />,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="h-3 w-3" />,
  },
};

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: 'text-amber-600 dark:text-amber-400',
  PARTIAL: 'text-blue-600 dark:text-blue-400',
  RECEIVED: 'text-emerald-600 dark:text-emerald-400',
};

interface Props {
  deal: TicketDeal;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: Props) {
  const statusCfg = STATUS_CONFIG[deal.status] ?? STATUS_CONFIG.PENDING;
  const grossProfit = deal.grossProfit ?? (
    deal.buyerPricePerSeat && deal.sellerCostPerSeat && deal.seatsBooked
      ? (deal.buyerPricePerSeat - deal.sellerCostPerSeat) * deal.seatsBooked
      : undefined
  );

  return (
    <button
      className={cn(
        'w-full rounded-xl border bg-card p-3 text-left transition-all',
        'hover:border-primary/30 hover:shadow-sm hover:bg-muted/20',
        deal.status === 'REJECTED' && 'opacity-60',
      )}
      onClick={onClick}
    >
      {/* Route + Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span className="truncate max-w-[80px]">{deal.seller.fromCity}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[80px]">{deal.seller.toCity}</span>
        </div>
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0', statusCfg.color)}>
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </div>

      {/* Seller → Buyer */}
      <div className="text-[11px] text-muted-foreground mb-1.5">
        <span className="font-medium text-foreground">{deal.seller.brokerName}</span>
        <span className="mx-1">→</span>
        <span className="font-medium text-foreground">{deal.buyer.brokerName}</span>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(deal.seller.travelDate), 'dd MMM yyyy')}
        </span>
        {deal.seatsBooked && (
          <span className="inline-flex items-center gap-0.5 text-[10px] bg-muted/60 rounded-full px-1.5 py-0.5">
            <Ticket className="h-2.5 w-2.5" />
            {deal.seatsBooked} seats
          </span>
        )}
        {grossProfit !== undefined && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-[10px] rounded-full px-1.5 py-0.5',
            grossProfit >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
          )}>
            <TrendingUp className="h-2.5 w-2.5" />
            ₹{Math.abs(grossProfit).toLocaleString('en-IN')}
          </span>
        )}
        {deal.paymentStatus && (
          <span className={cn('text-[10px] font-medium ml-auto', PAYMENT_STATUS[deal.paymentStatus] ?? '')}>
            {deal.paymentStatus}
          </span>
        )}
      </div>

      {/* Confirmation badges */}
      {(deal.bookingConfirmed || deal.ticketsSent) && (
        <div className="flex gap-1.5 mt-1.5 pt-1.5 border-t">
          {deal.bookingConfirmed && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-2.5 w-2.5" /> Booking confirmed
            </span>
          )}
          {deal.ticketsSent && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5 ml-auto">
              <Ticket className="h-2.5 w-2.5" /> Tickets sent
            </span>
          )}
        </div>
      )}
    </button>
  );
}