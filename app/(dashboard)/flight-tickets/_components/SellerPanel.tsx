'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Phone, Clock, Plane, Coins, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TicketSeller, TicketMatch } from '@/types/ticket.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SellerPanelProps {
  sellers: TicketSeller[];
  matches: TicketMatch[];
  canEdit: boolean;   // false for BUYER role
  canDelete: boolean; // only ADMIN
  onAdd: () => void;
  onEdit: (seller: TicketSeller) => void;
  onDelete: (seller: TicketSeller) => void;
}

export default function SellerPanel({
  sellers,
  matches,
  canEdit,
  canDelete,
  onAdd,
  onEdit,
  onDelete,
}: SellerPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const matchedSellerIds = new Set(matches.map((m) => m.seller.id));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Plane className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Sellers</h2>
            <p className="text-xs text-muted-foreground">{sellers.length} listings</p>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                size="sm"
                disabled={!canEdit}
                onClick={onAdd}
                className="h-8 gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </TooltipTrigger>
          {!canEdit && (
            <TooltipContent>You can only edit your panel</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-3 py-3">
        <AnimatePresence initial={false}>
          {sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Plane className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No seller listings yet</p>
              {canEdit && (
                <p className="mt-1 text-xs text-muted-foreground/70">Click Add to create one</p>
              )}
            </div>
          ) : (
            sellers.map((seller) => {
              const isMatched = matchedSellerIds.has(seller.id);
              const isExpanded = expandedId === seller.id;

              return (
                <motion.div
                  key={seller.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'mb-2.5 cursor-pointer rounded-xl border p-3.5 transition-all duration-200',
                    isMatched
                      ? 'border-emerald-400/60 bg-emerald-50/60 dark:border-emerald-600/40 dark:bg-emerald-950/30 ring-1 ring-emerald-400/30'
                      : 'border-border bg-background hover:border-blue-300 dark:hover:border-blue-700'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : seller.id)}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {seller.brokerName}
                        </p>
                        {isMatched && (
                          <Badge className="h-4 shrink-0 bg-emerald-500 px-1.5 text-[10px] text-white hover:bg-emerald-600">
                            Match
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{seller.fromCity}</span>
                        <span>→</span>
                        <span className="font-medium text-foreground">{seller.toCity}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {canEdit && (
                      <div
                        className="flex shrink-0 gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => onEdit(seller)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {canDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(seller)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick info */}
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {seller.departureTime} – {seller.arrivalTime}
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Users2 className="h-3 w-3" />
                      {seller.seatsAvailable} seats
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      ₹{seller.pricePerSeat.toLocaleString()}
                    </span>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{seller.phone}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Date: {format(new Date(seller.travelDate), 'dd MMM yyyy')}
                          </div>
                          {seller.notes && (
                            <p className="rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">
                              {seller.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}