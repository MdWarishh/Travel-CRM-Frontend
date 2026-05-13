'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Hotel, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HotelBooking, HotelBookingFormData } from '@/types/booking';
import { bookingsService } from '@/services/bookings.service';
import { HotelFormModal } from './HotelFormModal';
import { toast } from 'sonner';

const MEAL_COLORS: Record<string, string> = {
  CP: 'bg-green-50 text-green-700 border-green-200',
  MAP: 'bg-blue-50 text-blue-700 border-blue-200',
  AP: 'bg-purple-50 text-purple-700 border-purple-200',
  EP: 'bg-slate-50 text-slate-600 border-slate-200',
};

const ROOM_COLORS: Record<string, string> = {
  STANDARD: 'bg-slate-50 text-slate-600 border-slate-200',
  DELUXE: 'bg-amber-50 text-amber-700 border-amber-200',
  SUITE: 'bg-rose-50 text-rose-700 border-rose-200',
};

interface Props {
  bookingId: string;
  hotels: HotelBooking[];
  onChange: (hotels: HotelBooking[]) => void;
}

export function HotelSection({ bookingId, hotels, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HotelBooking | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async (data: HotelBookingFormData) => {
    const added = await bookingsService.addHotel(bookingId, data);
    onChange([...hotels, added]);
    toast.success('Hotel added');
  };

  const handleEdit = async (data: HotelBookingFormData) => {
    if (!editTarget) return;
    const updated = await bookingsService.updateHotel(bookingId, editTarget.id, data);
    onChange(hotels.map((h) => (h.id === editTarget.id ? updated : h)));
    toast.success('Hotel updated');
    setEditTarget(undefined);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await bookingsService.deleteHotel(bookingId, deleteId);
    onChange(hotels.filter((h) => h.id !== deleteId));
    toast.success('Hotel removed');
    setDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Hotel className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Hotels</h3>
            <p className="text-xs text-slate-400">{hotels.length} entr{hotels.length === 1 ? 'y' : 'ies'}</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          className="h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-sm text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Hotel
        </Button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {hotels.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Hotel className="h-6 w-6 text-amber-300" />
            </div>
            <p className="text-sm text-slate-400">No hotels added yet</p>
            <p className="text-xs text-slate-300 mt-1">Click "+ Add Hotel" to get started</p>
          </div>
        ) : (
          hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="group border border-slate-100 rounded-xl p-3.5 hover:border-amber-200 hover:bg-amber-50/30 transition-all"
            >
              {/* Hotel name + city */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {hotel.hotelName}
                  </p>
                  <p className="text-xs text-slate-400">📍 {hotel.city}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { setEditTarget(hotel); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(hotel.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                <span>{format(new Date(hotel.checkIn), 'dd MMM')}</span>
                <span className="text-slate-300">→</span>
                <span>{format(new Date(hotel.checkOut), 'dd MMM yyyy')}</span>
                <span className="ml-auto flex items-center gap-1 font-semibold text-amber-600">
                  <Moon className="h-3 w-3" />
                  {hotel.nights}N
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className={`text-xs border ${ROOM_COLORS[hotel.roomType]}`}>
                  {hotel.roomType}
                </Badge>
                <Badge variant="outline" className={`text-xs border ${MEAL_COLORS[hotel.mealPlan]}`}>
                  {hotel.mealPlan}
                </Badge>
                <Badge variant="outline" className="text-xs border border-slate-200 text-slate-500 bg-slate-50">
                  {hotel.rooms}R × {hotel.guests}G
                </Badge>
                {hotel.extraBed && (
                  <Badge variant="outline" className="text-xs border border-violet-200 text-violet-600 bg-violet-50">
                    + Bed
                  </Badge>
                )}
              </div>

              {hotel.notes && (
                <p className="text-xs text-slate-400 mt-2 italic truncate">{hotel.notes}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary footer */}
      {hotels.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{hotels.length} hotel{hotels.length > 1 ? 's' : ''}</span>
            <span className="font-medium text-amber-600 flex items-center gap-1">
              <Moon className="h-3 w-3" />
              {hotels.reduce((s, h) => s + h.nights, 0)} total nights
            </span>
          </div>
        </div>
      )}

      <HotelFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
        onSave={editTarget ? handleEdit : handleAdd}
        initial={editTarget}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove hotel booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This hotel entry will be permanently removed from the booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}