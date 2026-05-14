'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, Clock, Users, IndianRupee, Phone, Mail,
  ArrowRight, Globe, CalendarDays, CreditCard, User2,
  Edit3, MapPin, Banknote, Hash, FileText, TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TicketBuyer } from '@/types/ticket.types';
import { useTicketBuyer } from './useTicketData';
import {
  SOURCE_CHANNEL_CONFIG,
  DEAL_STATUS_CONFIG,
  BUYER_PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from './ticket.constants';

interface Props {
  buyerId: string | null;
  onClose: () => void;
  onEdit?: (buyer: TicketBuyer) => void;
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
      <span
        className={cn(
          'text-xs font-medium flex-1 leading-relaxed text-foreground break-words',
          mono && 'font-mono tracking-tight',
        )}
      >
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
    <div
      className={cn(
        'rounded-xl border p-3 text-center transition-colors',
        variant === 'default' && 'bg-card',
        variant === 'success' &&
          'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40',
        variant === 'info' &&
          'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40',
      )}
    >
      <p
        className={cn(
          'text-xl font-bold leading-none',
          variant === 'success' && 'text-emerald-600 dark:text-emerald-400',
          variant === 'info' && 'text-blue-600 dark:text-blue-400',
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{label}</p>
    </div>
  );
}

// ── FIX: null/undefined safe INR formatter ────────────────────────────────────
function formatINR(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('en-IN');
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BuyerDetailSheet({ buyerId, onClose, onEdit }: Props) {
  const { data: buyer, isLoading } = useTicketBuyer(buyerId);

  const totalDeals = buyer?.deals?.length ?? 0;
  const completedDeals = buyer?.deals?.filter((d) => d.status === 'COMPLETED').length ?? 0;
  const sourceConfig = buyer?.sourceChannel ? SOURCE_CHANNEL_CONFIG[buyer.sourceChannel] : null;
  const paymentStatusConfig = buyer?.paymentStatus
    ? BUYER_PAYMENT_STATUS_CONFIG[buyer.paymentStatus]
    : null;
  const paymentMethodConfig = buyer?.paymentMethod
    ? PAYMENT_METHOD_CONFIG[buyer.paymentMethod]
    : null;

  return (
    <Dialog open={!!buyerId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <DialogHeader className="flex-shrink-0 px-5 pt-5 pb-4 border-b bg-gradient-to-br from-violet-500/[0.06] via-transparent to-transparent">
          {isLoading ? (
            <div className="flex items-center gap-3">
              {/* FIX: Radix requires DialogTitle in DOM at all times — hidden while loading */}
              <VisuallyHidden>
                <DialogTitle>Buyer Details</DialogTitle>
              </VisuallyHidden>
              <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/25 flex-shrink-0">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-[15px] font-bold tracking-tight truncate">
                  {buyer?.brokerName}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate font-medium">
                    {buyer?.fromCity}
                    <ArrowRight className="inline h-2.5 w-2.5 mx-1" />
                    {buyer?.toCity}
                  </span>
                </p>
              </div>
              {paymentStatusConfig && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-semibold flex-shrink-0 px-2 py-0.5 border',
                    paymentStatusConfig.color,
                  )}
                >
                  {paymentStatusConfig.label}
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        {/* ── Scrollable Body ───────────────────────────────────────────── */}
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
          ) : buyer ? (
            <div className="p-5 space-y-5">

              {/* ── Stats ── */}
              <div className="grid grid-cols-3 gap-2">
                <StatCard value={totalDeals} label="Total Deals" />
                <StatCard value={completedDeals} label="Completed" variant="success" />
                <StatCard
                  value={
                    <span className="text-sm">
                      ₹{formatINR(buyer.totalCollected)}
                    </span>
                  }
                  label="Collected"
                  variant="info"
                />
              </div>

              <Separator />

              {/* ── Contact ── */}
              <div>
                <SectionLabel label="Contact" icon={User2} />
                <InfoRow icon={Phone} label="Phone" value={buyer.phone} iconClass="text-blue-500" />
                {buyer.email && (
                  <InfoRow icon={Mail} label="Email" value={buyer.email} iconClass="text-violet-500" />
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
              </div>

              <Separator />

              {/* ── Request Details ── */}
              <div>
                <SectionLabel label="Request Details" icon={TrendingUp} />
                <InfoRow
                  icon={ArrowRight}
                  label="Route"
                  value={
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">{buyer.fromCity}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold">{buyer.toCity}</span>
                    </span>
                  }
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Travel Date"
                  value={format(new Date(buyer.travelDate), 'dd MMM yyyy, EEE')}
                  iconClass="text-orange-500"
                />
                <InfoRow
                  icon={Clock}
                  label="Preferred Time"
                  value={`${buyer.preferredTimeFrom} – ${buyer.preferredTimeTo}`}
                  iconClass="text-teal-500"
                />
                <InfoRow
                  icon={Users}
                  label="Seats Needed"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <span className="font-bold">{buyer.seatsRequired}</span>
                      <span className="text-muted-foreground">seats</span>
                    </span>
                  }
                  iconClass="text-indigo-500"
                />
                <InfoRow
                  icon={IndianRupee}
                  label="Budget / Seat"
                  value={`₹${formatINR(buyer.budgetPerSeat)}`}
                  iconClass="text-amber-500"
                />
              </div>

              {/* ── Passenger Info ── */}
              {(buyer.passengerCount || buyer.passengerNames) && (
                <>
                  <Separator />
                  <div>
                    <SectionLabel label="Passengers" icon={Users} />
                    {buyer.passengerCount && (
                      <InfoRow
                        icon={Users}
                        label="Count"
                        value={`${buyer.passengerCount} passengers`}
                        iconClass="text-indigo-400"
                      />
                    )}
                    {buyer.passengerNames && (
                      <InfoRow icon={User2} label="Names" value={buyer.passengerNames} />
                    )}
                  </div>
                </>
              )}

              {/* ── Payment ── */}
              {(buyer.agreedPricePerSeat ||
                buyer.totalCollected !== undefined ||
                buyer.paymentMethod ||
                buyer.paymentRef) && (
                <>
                  <Separator />
                  <div>
                    <SectionLabel label="Payment" icon={CreditCard} />
                    {buyer.agreedPricePerSeat && (
                      <InfoRow
                        icon={IndianRupee}
                        label="Agreed Price"
                        value={`₹${formatINR(buyer.agreedPricePerSeat)} / seat`}
                        iconClass="text-emerald-500"
                      />
                    )}
                    {buyer.totalCollected !== undefined && (
                      <InfoRow
                        icon={Banknote}
                        label="Collected"
                        value={
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ₹{formatINR(buyer.totalCollected)}
                          </span>
                        }
                        iconClass="text-emerald-500"
                      />
                    )}
                    {paymentMethodConfig && (
                      <InfoRow
                        icon={CreditCard}
                        label="Method"
                        value={`${paymentMethodConfig.emoji} ${paymentMethodConfig.label}`}
                      />
                    )}
                    {buyer.paymentDate && (
                      <InfoRow
                        icon={CalendarDays}
                        label="Payment Date"
                        value={format(new Date(buyer.paymentDate), 'dd MMM yyyy')}
                        iconClass="text-orange-500"
                      />
                    )}
                    {buyer.paymentRef && (
                      <InfoRow
                        icon={Hash}
                        label="Ref"
                        value={buyer.paymentRef}
                        mono
                        iconClass="text-slate-400"
                      />
                    )}
                  </div>
                </>
              )}

              {/* ── Linked Deals ── */}
              {buyer.deals && buyer.deals.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <SectionLabel label={`Linked Deals (${buyer.deals.length})`} icon={CheckCircle2} />
                    <div className="space-y-1.5">
                      {buyer.deals.map((d) => {
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
                            <span
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                cfg.color,
                              )}
                            >
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
              {buyer.notes && (
                <>
                  <Separator />
                  <div className="rounded-xl bg-muted/40 border border-dashed p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText className="h-3 w-3 text-muted-foreground/70" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Notes
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {buyer.notes}
                    </p>
                  </div>
                </>
              )}

              {/* ── Meta ── */}
              <div className="rounded-lg bg-muted/30 border px-3 py-2.5 text-[10px] text-muted-foreground space-y-0.5">
                <p>
                  Added by{' '}
                  <span className="font-semibold text-foreground/70">{buyer.createdBy.name}</span>
                  {' · '}
                  <span>{buyer.createdBy.role}</span>
                </p>
                <p>Created {format(new Date(buyer.createdAt), 'dd MMM yyyy, HH:mm')}</p>
              </div>

            </div>
          ) : null}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        {buyer && onEdit && (
          <div className="flex-shrink-0 px-5 py-4 border-t bg-muted/10">
            <Button
              variant="default"
              className="w-full h-10 gap-2 bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-all"
              onClick={() => onEdit(buyer)}
            >
              <Edit3 className="h-4 w-4" />
              Edit Request
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}