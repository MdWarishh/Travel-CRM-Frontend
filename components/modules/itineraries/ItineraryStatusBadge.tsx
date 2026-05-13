'use client';

import { Badge } from '@/components/ui/badge';
import { ItineraryStatus } from '@/types/itinerary.types';

interface Props {
  status: ItineraryStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ItineraryStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  DRAFT: {
    label: 'Draft',
    variant: 'secondary',
    className: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
  },
  FINALIZED: {
    label: 'Finalized',
    variant: 'default',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
  },
  SENT: {
    label: 'Sent',
    variant: 'default',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  },
  ARCHIVED: {
    label: 'Archived',
    variant: 'outline',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  },
};

export function ItineraryStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2.5 py-0.5 ${config.className} ${className ?? ''}`}
    >
      {config.label}
    </Badge>
  );
}