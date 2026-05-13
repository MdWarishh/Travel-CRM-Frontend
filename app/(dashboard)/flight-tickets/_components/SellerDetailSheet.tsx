'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plane, Clock, Users, IndianRupee, Hash, Tag,
  Building2, Phone, Mail, ArrowRight,
  Globe, Calendar, MapPin, Edit3,
  CheckCircle2,
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
  onClose:  () => void;
  onEdit?:  (seller: TicketSeller) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  iconClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 group hover:bg-muted/30 -mx-3 px-3 rounded-lg transition-colors">
      <div className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', iconClass ?? 'text-muted-foreground/50')}>
        <Icon className="h-full w-full" />
      </div>
      <span className="text-xs text-muted-foreground min-w-[96px] pt-px leading-relaxed shrink-0">
        {label}
      </span>
      <span className={cn(
        'text-xs font-medium flex-1 leading-relaxed text-foreground break-words',
        mono && 'font-mono tracking-tight',
      )}>
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ label, icon: Icon }: { label: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground/70" />}
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

function StatCard({
  value,
  label,
  variant = 'default',
}: {
  value: React.ReactNode;
  label: string;
  variant?: 'default' | 'success' | 'info';
}) {
  return (
    <div className={cn(
      'rounded-xl border p-3 text-center transition-colors',
      variant === 'default' && 'bg-card',
      variant === 'success' && 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40',
      variant === 'info' && 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40',
    )}>
      <p className={cn(
        'text-xl font-bold leading-none',
        variant === 'success' && 'text-emerald-600 dark:text-emerald-400',
        variant === 'info' && 'text-blue-600 dark:text-blue-400',
      )}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{label}</p>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function SellerDetailSheet({ sellerId, onClose, onEdit }: Props) {
  const { data: seller, isLoading } = useTicketSeller(sellerId);

  const totalDeals     = seller?.deals?.length ?? 0;
  const completedDeals = seller?.deals?.filter((d) => d.status === 'COMPLETED').length ?? 0;
  const classConfig    = seller?.ticketClass ? TICKET_CLASS_CONFIG[seller.ticketClass] : null;
  const sourceConfig   = seller?.sourceChannel ? SOURCE_CHANNEL_CONFIG[seller.sourceChannel] : null;

  const totalValue = seller
    ? (seller.totalValue ?? seller.pricePerSeat * seller.seatsAvailable)
    : 0;

  return (
    <Dialog open={!!sellerId} onOpenChange={(v) => !v && onClose()}>
      {/*
       * Same fix as BuyerDetailSheet:
       * flex flex-col + max-h-[90vh] + overflow-hidden
       * body: overflow-y-auto + min-h-0
       */}
      <DialogContent className="max-w-lg w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <DialogHeader className="flex-shrink-0 px-5 pt-5 pb-4 border-b bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-500/25 flex-shrink-0">
                <Plane className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-[15px] font-bold tracking-tight truncate">
                  {seller?.brokerName}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate font-medium">
                    {seller?.fromCity}
                    <ArrowRight className="inline h-2.5 w-2.5 mx-1" />
                    {seller?.toCity}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {classConfig && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] font-semibold px-2 py-0.5 border', classConfig.color)}
                  >
                    {classConfig.emoji} {classConfig.label}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5',
                    seller?.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                      : 'text-muted-foreground',
                  )}
                >
                  {seller?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* ── Scrollable Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn('h-3', i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-3/4' : 'w-1/2')}
                />
              ))}
            </div>
          ) : seller ? (
            <div className="p-5 space-y-5">

              {/* ── Stats ── */}
              <div className="grid grid-cols-3 gap-2">
                <StatCard value={totalDeals} label="Total Deals" />
                <StatCard value={completedDeals} label="Completed" variant="success" />
                <StatCard
                  value={<span className="text-sm">₹{totalValue.toLocaleString('en-IN')}</span>}
                  label="Total Value"
                  variant="info"
                />
              </div>

              <Separator />

              {/* ── Contact ── */}
              <div>
                <SectionLabel label="Contact" icon={Phone} />
                <InfoRow icon={Phone} label="Phone" value={seller.phone} iconClass="text-blue-500" />
                {seller.email && (
                  <InfoRow icon={Mail} label="Email" value={seller.email} iconClass="text-sky-500" />
                )}
                {sourceConfig && (
                  <InfoRow
                    icon={Globe}
                    label="Source"
                    value={
                      <span className="flex items-center gap-1.5">
                        <span>{sourceConfig.emoji}</span>
                        <span>{sourceConfig.label}</span>
                      </span>
                    }
                  />
                )}
                {seller.emailSource && (
                  <InfoRow icon={Mail} label="Email Source" value={seller.emailSource} mono />
                )}
              </div>

              <Separator />

              {/* ── Flight Details ── */}
              <div>
                <SectionLabel label="Flight Details" icon={Plane} />
                <InfoRow
                  icon={ArrowRight}
                  label="Route"
                  value={
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">{seller.fromCity}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold">{seller.toCity}</span>
                    </span>
                  }
                />
                <InfoRow
                  icon={Calendar}
                  label="Travel Date"
                  value={format(new Date(seller.travelDate), 'dd MMM yyyy, EEE')}
                  iconClass="text-orange-500"
                />
                {(seller.departureTime || seller.arrivalTime) && (
                  <InfoRow
                    icon={Clock}
                    label="Timing"
                    value={`${seller.departureTime ?? '--'} – ${seller.arrivalTime ?? '--'}`}
                    iconClass="text-teal-500"
                  />
                )}
                <InfoRow
                  icon={Users}
                  label="Seats"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <span className="font-bold">{seller.seatsAvailable}</span>
                      <span className="text-muted-foreground">available</span>
                    </span>
                  }
                  iconClass="text-indigo-500"
                />
                <InfoRow
                  icon={IndianRupee}
                  label="Price/Seat"
                  value={`₹${seller.pricePerSeat.toLocaleString('en-IN')}`}
                  iconClass="text-amber-500"
                />
                {seller.airline && (
                  <InfoRow
                    icon={Plane}
                    label="Airline"
                    value={`${seller.airline}${seller.flightNumber ? ` · ${seller.flightNumber}` : ''}`}
                    iconClass="text-sky-500"
                  />
                )}
              </div>

              {/* ── Booking Info ── */}
              {(seller.pnr || seller.bookingRef || seller.ticketClass) && (
                <>
                  <Separator />
                  <div>
                    <SectionLabel label="Booking Info" icon={Tag} />
                    {seller.ticketClass && classConfig && (
                      <InfoRow
                        icon={Tag}
                        label="Class"
                        value={`${classConfig.emoji} ${classConfig.label}`}
                        iconClass="text-violet-500"
                      />
                    )}
                    {seller.pnr && (
                      <InfoRow icon={Hash} label="PNR" value={seller.pnr} mono iconClass="text-slate-400" />
                    )}
                    {seller.bookingRef && (
                      <InfoRow icon={Tag} label="Booking Ref" value={seller.bookingRef} mono iconClass="text-slate-400" />
                    )}
                  </div>
                </>
              )}

              {/* ── Purchase Tracking ── */}
              {(seller.purchasePrice || seller.purchasedFrom) && (
                <>
                  <Separator />
                  <div>
                    <SectionLabel label="Purchase Tracking" icon={Building2} />
                    {seller.purchasePrice !== undefined && (
                      <InfoRow
                        icon={IndianRupee}
                        label="Our Cost"
                        value={`₹${seller.purchasePrice.toLocaleString('en-IN')} / seat`}
                        iconClass="text-emerald-500"
                      />
                    )}
                    {seller.purchasedFrom && (
                      <InfoRow icon={Building2} label="Purchased From" value={seller.purchasedFrom} />
                    )}
                    {seller.purchasedAt && (
                      <InfoRow
                        icon={Calendar}
                        label="Purchase Date"
                        value={format(new Date(seller.purchasedAt), 'dd MMM yyyy')}
                        iconClass="text-orange-500"
                      />
                    )}
                    {seller.purchasePrice !== undefined && (
                      <div className="mt-2 rounded-lg bg-muted/50 border px-3 py-2.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Margin / seat</span>
                        <span className={cn(
                          'text-xs font-bold',
                          seller.pricePerSeat >= seller.purchasePrice
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400',
                        )}>
                          {seller.pricePerSeat >= seller.purchasePrice ? '+' : ''}
                          ₹{(seller.pricePerSeat - seller.purchasePrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Linked Deals ── */}
              {seller.deals && seller.deals.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <SectionLabel label={`Linked Deals (${seller.deals.length})`} icon={CheckCircle2} />
                    <div className="space-y-1.5">
                      {seller.deals.map((d) => {
                        const cfg = DEAL_STATUS_CONFIG[d.status];
                        return (
                          <div
                            key={d.id}
                            className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 hover:bg-muted/40 transition-colors"
                          >
                            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', cfg.dot)} />
                            <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                              {d.id.slice(0, 8)}…
                            </span>
                            <span className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                              cfg.color,
                            )}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── Notes ── */}
              {seller.notes && (
                <>
                  <Separator />
                  <div className="rounded-xl bg-muted/40 border border-dashed p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Notes</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">{seller.notes}</p>
                  </div>
                </>
              )}

              {/* ── Meta ── */}
              <div className="rounded-lg bg-muted/30 border px-3 py-2.5 text-[10px] text-muted-foreground space-y-0.5">
                <p>
                  Added by{' '}
                  <span className="font-semibold text-foreground/70">{seller.createdBy.name}</span>
                  {' · '}
                  <span>{seller.createdBy.role}</span>
                </p>
                <p>Created {format(new Date(seller.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                {seller.updatedAt !== seller.createdAt && (
                  <p>Updated {format(new Date(seller.updatedAt), 'dd MMM yyyy, HH:mm')}</p>
                )}
              </div>

            </div>
          ) : null}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        {seller && onEdit && (
          <div className="flex-shrink-0 px-5 py-4 border-t bg-muted/10">
            <Button
              variant="default"
              className="w-full h-10 gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20 transition-all"
              onClick={() => onEdit(seller)}
            >
              <Edit3 className="h-4 w-4" />
              Edit Listing
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}