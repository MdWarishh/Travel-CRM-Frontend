'use client';

import { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plane, Clock, Users, IndianRupee, Hash, Tag,
  Building2, Phone, Mail, ArrowRight, Link2,
  CheckCircle2, XCircle, Package, Globe, MessageSquare,
  Calendar, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TicketSeller } from '@/types/ticket.types';
import { useTicketSeller } from './useTicketData';
import {
  TICKET_CLASS_CONFIG,
  SOURCE_CHANNEL_CONFIG,
  DEAL_STATUS_CONFIG,
} from './ticket.constants';

interface Props {
  sellerId: string | null;
  onClose: () => void;
  onEdit?: (seller: TicketSeller) => void;
}

function InfoRow({ icon: Icon, label, value, mono = false }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <span className="text-xs text-muted-foreground min-w-[90px]">{label}</span>
      <span className={cn('text-xs font-medium flex-1', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

export function SellerDetailSheet({ sellerId, onClose, onEdit }: Props) {
  const { data: seller, isLoading } = useTicketSeller(sellerId);

  const totalDeals = seller?.deals?.length ?? 0;
  const activeDeals = seller?.deals?.filter(d => d.status !== 'REJECTED').length ?? 0;
  const completedDeals = seller?.deals?.filter(d => d.status === 'COMPLETED').length ?? 0;

  const classConfig = seller?.ticketClass ? TICKET_CLASS_CONFIG[seller.ticketClass] : null;
  const sourceConfig = seller?.sourceChannel ? SOURCE_CHANNEL_CONFIG[seller.sourceChannel] : null;

  return (
    <Sheet open={!!sellerId} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
              <Plane className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-sm font-semibold leading-none">
                {isLoading ? <Skeleton className="h-4 w-28" /> : seller?.brokerName}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? <Skeleton className="h-3 w-36 mt-1" /> : `${seller?.fromCity} → ${seller?.toCity}`}
              </p>
            </div>
            {seller && (
              <div className="flex items-center gap-1.5">
                {classConfig && (
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', classConfig.color)}>
                    {classConfig.emoji} {classConfig.label}
                  </span>
                )}
                <span className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full',
                  seller.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {seller.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : seller ? (
            <div className="p-5 space-y-5">

              {/* Deal Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{totalDeals}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Total Deals</p>
                </div>
                <div className="rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completedDeals}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
                </div>
                <div className="rounded-xl border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    ₹{(seller.totalValue ?? seller.pricePerSeat * seller.seatsAvailable).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Total Value</p>
                </div>
              </div>

              <Separator />

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
                <InfoRow icon={Phone} label="Phone" value={seller.phone} />
                {seller.email && <InfoRow icon={Mail} label="Email" value={seller.email} />}
                {sourceConfig && (
                  <InfoRow icon={Globe} label="Source" value={`${sourceConfig.emoji} ${sourceConfig.label}`} />
                )}
                {seller.emailSource && <InfoRow icon={Mail} label="Email Source" value={seller.emailSource} mono />}
              </div>

              <Separator />

              {/* Flight Details */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Flight Details</p>
                <InfoRow icon={ArrowRight} label="Route" value={`${seller.fromCity} → ${seller.toCity}`} />
                <InfoRow icon={Calendar} label="Travel Date" value={format(new Date(seller.travelDate), 'dd MMM yyyy, EEE')} />
                <InfoRow icon={Clock} label="Timing" value={`${seller.departureTime} – ${seller.arrivalTime}`} />
                <InfoRow icon={Users} label="Seats" value={`${seller.seatsAvailable} available`} />
                <InfoRow
                  icon={IndianRupee}
                  label="Price/Seat"
                  value={`₹${seller.pricePerSeat.toLocaleString('en-IN')}`}
                />
                {seller.airline && (
                  <InfoRow icon={Plane} label="Airline" value={`${seller.airline}${seller.flightNumber ? ` · ${seller.flightNumber}` : ''}`} />
                )}
              </div>

              {/* Booking Info */}
              {(seller.pnr || seller.bookingRef || seller.ticketClass) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Booking Info</p>
                    {seller.pnr && <InfoRow icon={Hash} label="PNR" value={seller.pnr} mono />}
                    {seller.bookingRef && <InfoRow icon={Tag} label="Booking Ref" value={seller.bookingRef} mono />}
                  </div>
                </>
              )}

              {/* Purchase Tracking */}
              {(seller.purchasePrice || seller.purchasedFrom) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Purchase Tracking</p>
                    {seller.purchasePrice && (
                      <InfoRow icon={IndianRupee} label="Purchase Price" value={`₹${seller.purchasePrice.toLocaleString('en-IN')}/seat`} />
                    )}
                    {seller.purchasedFrom && <InfoRow icon={Building2} label="Purchased From" value={seller.purchasedFrom} />}
                    {seller.purchasedAt && (
                      <InfoRow icon={Calendar} label="Purchase Date" value={format(new Date(seller.purchasedAt), 'dd MMM yyyy')} />
                    )}
                    {seller.purchasePrice && (
                      <div className="mt-2 rounded-lg bg-muted/50 p-2.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Margin/seat</span>
                        <span className={cn(
                          'text-xs font-bold',
                          seller.pricePerSeat >= seller.purchasePrice
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}>
                          {seller.pricePerSeat >= seller.purchasePrice ? '+' : ''}
                          ₹{(seller.pricePerSeat - seller.purchasePrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Linked Deals */}
              {seller.deals && seller.deals.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Linked Deals ({seller.deals.length})
                    </p>
                    <div className="space-y-1.5">
                      {seller.deals.map(d => {
                        const cfg = DEAL_STATUS_CONFIG[d.status];
                        return (
                          <div
                            key={d.id}
                            className="flex items-center gap-2 rounded-lg border px-3 py-2"
                          >
                            <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
                            <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                              {d.id.slice(0, 8)}…
                            </span>
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', cfg.color)}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {seller.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 italic">
                      {seller.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Meta */}
              <div className="text-[10px] text-muted-foreground pt-1 border-t space-y-0.5">
                <p>Added by {seller.createdBy.name} ({seller.createdBy.role})</p>
                <p>Created {format(new Date(seller.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                {seller.updatedAt !== seller.createdAt && (
                  <p>Updated {format(new Date(seller.updatedAt), 'dd MMM yyyy, HH:mm')}</p>
                )}
              </div>

              {/* Edit Button */}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onEdit(seller)}
                >
                  Edit Listing
                </Button>
              )}
            </div>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}