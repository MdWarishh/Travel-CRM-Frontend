'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  MapPin, Calendar, Users, IndianRupee, Copy,
  Trash2, FileText, MoreVertical, Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItineraryStatusBadge } from './ItineraryStatusBadge';
import { Itinerary } from '@/types/itinerary.types';

interface Props {
  itinerary: Itinerary;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onGeneratePdf: (id: string) => void;
}

export function ItineraryCard({ itinerary, onDuplicate, onDelete, onGeneratePdf }: Props) {
  const fmt = (d: string | null | undefined) =>
    d ? format(new Date(d), 'dd MMM yyyy') : null;

  return (
    <Card className="group relative overflow-hidden border border-slate-200 bg-white shadow-none hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Hero strip */}
      {itinerary.heroImageUrl ? (
        <div className="h-36 w-full overflow-hidden bg-slate-100">
          <img
            src={itinerary.heroImageUrl}
            alt={itinerary.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-36 w-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-end p-4">
          <MapPin className="text-white/30 h-16 w-16 absolute right-4 top-4" />
        </div>
      )}

      {/* Badges row on top of image */}
      <div className="absolute top-3 left-3 flex gap-1.5">
        <ItineraryStatusBadge status={itinerary.status} />
        {itinerary.isTemplate && (
          <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <Layers className="h-3 w-3" /> Template
          </span>
        )}
      </div>

      {/* Dropdown menu */}
      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary" className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onGeneratePdf(itinerary.id)}>
              <FileText className="h-4 w-4 mr-2" /> Generate PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(itinerary.id)}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(itinerary.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4">
        <Link href={`/itineraries/${itinerary.id}`}>
          <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1 hover:text-blue-600 transition-colors line-clamp-1">
            {itinerary.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
          {itinerary.destination && (
            <MetaChip icon={<MapPin className="h-3 w-3" />} label={itinerary.destination} />
          )}
          {itinerary.durationLabel && (
            <MetaChip icon={<Calendar className="h-3 w-3" />} label={itinerary.durationLabel} />
          )}
          {itinerary.numberOfTravelers && (
            <MetaChip icon={<Users className="h-3 w-3" />} label={`${itinerary.numberOfTravelers} pax`} />
          )}
          {itinerary.totalPrice && (
            <MetaChip
              icon={<IndianRupee className="h-3 w-3" />}
              label={Number(itinerary.totalPrice).toLocaleString('en-IN')}
            />
          )}
        </div>

        {(itinerary.startDate || itinerary.customer) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {itinerary.customer && (
              <span className="truncate max-w-[55%]">{itinerary.customer.name}</span>
            )}
            {itinerary.startDate && (
              <span className="text-slate-400">{fmt(itinerary.startDate)}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      {icon} {label}
    </span>
  );
}