'use client';

import { Customer } from '@/types/customer.types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getInitials } from '@/lib/format';

const TAG_STYLES: Record<string, string> = {
  VIP: 'bg-amber-50 text-amber-700 border-amber-200',
  Repeat: 'bg-blue-50 text-blue-700 border-blue-200',
  New: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface Props {
  customer: Customer;
}

export function CustomerCard({ customer }: Props) {
  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-xl p-5',
        'hover:border-primary/40 hover:shadow-sm',
        'transition-all duration-200 cursor-pointer'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm leading-tight">{customer.name}</p>
            {customer.city && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-2.5 w-2.5" />
                {customer.city}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap justify-end">
          {customer.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded border',
                TAG_STYLES[tag] ?? 'bg-muted text-muted-foreground border-border'
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>{formatCurrency(customer.totalSpend)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{customer.totalTrips} trips</span>
          {customer.lastTripDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(customer.lastTripDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}