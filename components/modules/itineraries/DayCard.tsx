'use client';

import { format } from 'date-fns';
import { Hotel, UtensilsCrossed, Bus, Map, Zap, StickyNote, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ItineraryDay } from '@/types/itinerary.types';

interface Props {
  day: ItineraryDay;
  onEdit: (day: ItineraryDay) => void;
  onDelete: (dayId: string) => void;
}

const LAYOUT_LABELS: Record<string, string> = {
  IMAGE_TOP: 'Image Top',
  IMAGE_RIGHT: 'Image Right',
  GRID: 'Grid',
};

export function DayCard({ day, onEdit, onDelete }: Props) {
  const quickFacts = [
    { icon: <Hotel className="h-3.5 w-3.5" />, label: day.hotel },
    { icon: <UtensilsCrossed className="h-3.5 w-3.5" />, label: day.meals },
    { icon: <Bus className="h-3.5 w-3.5" />, label: day.transfers },
    { icon: <Map className="h-3.5 w-3.5" />, label: day.sightseeing },
    { icon: <Zap className="h-3.5 w-3.5" />, label: day.activities },
  ].filter((f) => f.label);

  return (
    <Card className="border border-slate-200 bg-white shadow-none">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
              {day.dayNumber}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm leading-tight">
                {day.title || `Day ${day.dayNumber}`}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {day.date && (
                  <span className="text-xs text-slate-400">
                    {format(new Date(day.date), 'dd MMM yyyy')}
                  </span>
                )}
                {day.destination && (
                  <span className="text-xs text-slate-500">· {day.destination}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              {LAYOUT_LABELS[day.imageLayout]}
            </Badge>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(day)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(day.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 space-y-3">
        {day.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{day.description}</p>
        )}

        {quickFacts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickFacts.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full"
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        )}

        {day.notes && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
            <StickyNote className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">{day.notes}</p>
          </div>
        )}

        {/* Images */}
        {day.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {day.images.map((img) => (
              <div key={img.id} className="relative h-16 w-24 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {day.images.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ImageIcon className="h-3.5 w-3.5" /> No images added
          </div>
        )}
      </CardContent>
    </Card>
  );
}