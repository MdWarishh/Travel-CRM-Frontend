'use client';

import { CustomerActivity, CustomerActivityType } from '@/types/customer.types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/format';
import {
  MessageCircle,
  Mail,
  CalendarPlus,
  PlusCircle,
  FileText,
  StickyNote,
  User,
  CreditCard,
  Phone,
  CheckCircle2,
} from 'lucide-react';

const ACTIVITY_CONFIG: Record<
  CustomerActivityType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  WHATSAPP_SENT:        { icon: MessageCircle, color: 'text-green-600',  bg: 'bg-green-50' },
  EMAIL_SENT:           { icon: Mail,          color: 'text-blue-600',   bg: 'bg-blue-50' },
  ITINERARY_CREATED:    { icon: CalendarPlus,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
  BOOKING_CREATED:      { icon: PlusCircle,    color: 'text-emerald-600',bg: 'bg-emerald-50' },
  PDF_SHARED:           { icon: FileText,      color: 'text-orange-600', bg: 'bg-orange-50' },
  NOTE_ADDED:           { icon: StickyNote,    color: 'text-amber-600',  bg: 'bg-amber-50' },
  NOTE_UPDATED:         { icon: StickyNote,    color: 'text-amber-600',  bg: 'bg-amber-50' },
  CUSTOMER_CREATED:     { icon: User,          color: 'text-slate-600',  bg: 'bg-slate-100' },
  CUSTOMER_UPDATED:     { icon: User,          color: 'text-slate-600',  bg: 'bg-slate-100' },
  PAYMENT_RECEIVED:     { icon: CreditCard,    color: 'text-emerald-600',bg: 'bg-emerald-50' },
  FOLLOW_UP_ADDED:      { icon: Phone,         color: 'text-blue-600',   bg: 'bg-blue-50' },
  FOLLOW_UP_COMPLETED:  { icon: CheckCircle2,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
  DOCUMENT_UPLOADED:    { icon: FileText,      color: 'text-slate-600',  bg: 'bg-slate-100' },
};

interface Props {
  logs: CustomerActivity[];
  isLoading: boolean;
}

export function ActivityTab({ logs, isLoading }: Props) {
  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl py-16 text-center">
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        {logs.map((log, index) => {
          const config = ACTIVITY_CONFIG[log.type] ?? {
            icon: User,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
          };
          const Icon = config.icon;

          return (
            <div key={log.id} className="relative flex gap-4 pb-5 last:pb-0">
              {/* Icon bubble */}
              <div className={`relative z-10 shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm leading-snug">{log.title}</p>
                {log.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{log.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {log.performedBy && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {log.performedBy.name}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}