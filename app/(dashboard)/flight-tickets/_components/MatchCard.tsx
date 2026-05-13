'use client';

import { Zap, ArrowRight, IndianRupee, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TicketMatch } from '@/types/ticket.types';
import { format } from 'date-fns';

interface Props {
  match: TicketMatch;
  canConnect: boolean;
  onConnect: () => void;
}

export function MatchCard({ match, canConnect, onConnect }: Props) {
  const { seller, buyer, margin, feasible } = match;
  const profitPerSeat = buyer.budgetPerSeat - seller.pricePerSeat;
  const seats = Math.min(seller.seatsAvailable, buyer.seatsRequired);

  return (
    <div className={cn(
      'rounded-xl border bg-card p-3 space-y-2.5 transition-all',
      feasible
        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
        : 'border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20',
    )}>
      {/* Route */}
      <div className="flex items-center gap-1.5">
        <Zap className={cn('h-3.5 w-3.5 flex-shrink-0', feasible ? 'text-emerald-500' : 'text-amber-500')} />
        <span className="text-xs font-semibold">{seller.fromCity}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-semibold">{seller.toCity}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {format(new Date(seller.travelDate), 'dd MMM')}
        </span>
      </div>

      {/* Seller vs Buyer */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-background/80 p-2 border">
          <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">SELLER</p>
          <p className="text-xs font-semibold truncate">{seller.brokerName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <IndianRupee className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-xs">{seller.pricePerSeat.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-muted-foreground">· {seller.seatsAvailable}s</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{seller.departureTime}</p>
        </div>

        <div className="rounded-lg bg-background/80 p-2 border">
          <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">BUYER</p>
          <p className="text-xs font-semibold truncate">{buyer.brokerName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <IndianRupee className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-xs">{buyer.budgetPerSeat.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-muted-foreground">· {buyer.seatsRequired}s</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {buyer.preferredTimeFrom}–{buyer.preferredTimeTo}
          </p>
        </div>
      </div>

      {/* P&L Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {feasible ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-amber-500" />
          )}
          <span className={cn('text-xs font-medium', feasible ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
            {feasible ? '+' : ''}₹{Math.abs(profitPerSeat).toLocaleString('en-IN')}/seat
          </span>
          <span className="text-[10px] text-muted-foreground">
            · {seats} seats · ≈₹{Math.abs(profitPerSeat * seats).toLocaleString('en-IN')} total
          </span>
        </div>
      </div>

      {/* Connect Button */}
      {canConnect && (
        <Button
          size="sm"
          className={cn(
            'w-full h-7 text-xs',
            feasible
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          )}
          onClick={onConnect}
        >
          Connect Deal
        </Button>
      )}
    </div>
  );
}