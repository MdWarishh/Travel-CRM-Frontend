'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Plane, ArrowRight } from 'lucide-react';
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
import { FlightBooking, FlightBookingFormData } from '@/types/booking';
import { bookingsService } from '@/services/bookings.service';
import { FlightFormModal } from './FlightFormModal';
import { toast } from 'sonner';

const CLASS_COLORS: Record<string, string> = {
  ECONOMY: 'bg-slate-50 text-slate-600 border-slate-200',
  BUSINESS: 'bg-blue-50 text-blue-700 border-blue-200',
  FIRST: 'bg-amber-50 text-amber-700 border-amber-200',
};

const STATUS_COLORS: Record<string, string> = {
  BOOKED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

interface Props {
  bookingId: string;
  flights: FlightBooking[];
  onChange: (flights: FlightBooking[]) => void;
}

export function FlightSection({ bookingId, flights, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FlightBooking | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async (data: FlightBookingFormData) => {
    const added = await bookingsService.addFlight(bookingId, data);
    onChange([...flights, added]);
    toast.success('Flight added');
  };

  const handleEdit = async (data: FlightBookingFormData) => {
    if (!editTarget) return;
    const updated = await bookingsService.updateFlight(bookingId, editTarget.id, data);
    onChange(flights.map((f) => (f.id === editTarget.id ? updated : f)));
    toast.success('Flight updated');
    setEditTarget(undefined);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await bookingsService.deleteFlight(bookingId, deleteId);
    onChange(flights.filter((f) => f.id !== deleteId));
    toast.success('Flight removed');
    setDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-blue-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <Plane className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Flights</h3>
            <p className="text-xs text-slate-400">
              {flights.length} entr{flights.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          className="h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white gap-1.5 shadow-sm text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Flight
        </Button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {flights.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Plane className="h-6 w-6 text-blue-200" />
            </div>
            <p className="text-sm text-slate-400">No flights added</p>
            <p className="text-xs text-slate-300 mt-1">Optional — add if flights are included</p>
          </div>
        ) : (
          flights.map((flight) => (
            <div
              key={flight.id}
              className="group border border-slate-100 rounded-xl p-3.5 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              {/* Route row */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-bold text-slate-800 truncate">{flight.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-800 truncate">{flight.to}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { setEditTarget(flight); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(flight.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Airline + flight no */}
              {(flight.airline || flight.flightNumber) && (
                <div className="flex items-center gap-2 mb-2">
                  {flight.airline && (
                    <span className="text-xs font-medium text-slate-600">{flight.airline}</span>
                  )}
                  {flight.flightNumber && (
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {flight.flightNumber}
                    </span>
                  )}
                  {flight.pnr && (
                    <span className="text-xs font-mono font-bold text-blue-600 ml-auto bg-blue-50 px-1.5 py-0.5 rounded">
                      PNR: {flight.pnr}
                    </span>
                  )}
                </div>
              )}

              {/* Times */}
              <div className="grid grid-cols-2 gap-2 mb-2.5 bg-slate-50 rounded-lg px-2.5 py-2">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Departure</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {format(new Date(flight.departure), 'dd MMM, HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Arrival</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {format(new Date(flight.arrival), 'dd MMM, HH:mm')}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className={`text-xs border ${CLASS_COLORS[flight.travelClass]}`}>
                  {flight.travelClass}
                </Badge>
                <Badge variant="outline" className={`text-xs border ${STATUS_COLORS[flight.status]}`}>
                  {flight.status}
                </Badge>
                {flight.baggage && (
                  <Badge variant="outline" className="text-xs border border-slate-200 text-slate-500 bg-slate-50">
                    🧳 {flight.baggage}
                  </Badge>
                )}
              </div>

              {flight.notes && (
                <p className="text-xs text-slate-400 mt-2 italic truncate">{flight.notes}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {flights.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{flights.length} flight{flights.length > 1 ? 's' : ''}</span>
            <span className="font-medium text-blue-600">
              {flights.filter((f) => f.status === 'BOOKED').length} confirmed
            </span>
          </div>
        </div>
      )}

      <FlightFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
        onSave={editTarget ? handleEdit : handleAdd}
        initial={editTarget}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove flight?</AlertDialogTitle>
            <AlertDialogDescription>
              This flight entry will be permanently removed from the booking.
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