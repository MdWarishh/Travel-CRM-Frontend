'use client';

import { ItinerarySummary } from '@/types/customer.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/format';
import { Eye, Send, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  FINALIZED: { label: 'Finalized', variant: 'default' },
  SENT: { label: 'Sent', variant: 'default' },
  ARCHIVED: { label: 'Archived', variant: 'outline' },
};

interface Props {
  itineraries: ItinerarySummary[];
  isLoading: boolean;
  customerId: string;
}

export function ItinerariesTab({ itineraries, isLoading, customerId }: Props) {
  const router = useRouter();

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {itineraries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No itineraries yet</p>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => router.push(`/itineraries/create?customerId=${customerId}`)}
          >
            Create Itinerary
          </Button>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {['Title', 'Destination', 'Dates', 'Price', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itineraries.map((it) => {
              const s = STATUS_MAP[it.status] ?? STATUS_MAP.DRAFT;
              return (
                <tr key={it.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium">{it.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{it.destination ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(it.startDate)} → {formatDate(it.endDate)}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{formatCurrency(it.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => router.push(`/itineraries/${it.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Convert to booking">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}