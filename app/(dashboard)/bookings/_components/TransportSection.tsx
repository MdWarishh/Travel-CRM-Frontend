'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Car, MapPin } from 'lucide-react';
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
import { TransportBooking, TransportBookingFormData } from '@/types/booking';
import { bookingsService } from '@/services/bookings.service';
import { TransportFormModal } from './TransportFormModal';
import { toast } from 'sonner';

interface Props {
  bookingId: string;
  transports: TransportBooking[];
  onChange: (transports: TransportBooking[]) => void;
}

export function TransportSection({ bookingId, transports, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransportBooking | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async (data: TransportBookingFormData) => {
    const added = await bookingsService.addTransport(bookingId, data);
    onChange([...transports, added]);
    toast.success('Transport added');
  };

  const handleEdit = async (data: TransportBookingFormData) => {
    if (!editTarget) return;
    const updated = await bookingsService.updateTransport(bookingId, editTarget.id, data);
    onChange(transports.map((t) => (t.id === editTarget.id ? updated : t)));
    toast.success('Transport updated');
    setEditTarget(undefined);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await bookingsService.deleteTransport(bookingId, deleteId);
    onChange(transports.filter((t) => t.id !== deleteId));
    toast.success('Transport removed');
    setDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-violet-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <Car className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Transport</h3>
            <p className="text-xs text-slate-400">
              {transports.length} entr{transports.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          className="h-8 rounded-xl bg-violet-500 hover:bg-violet-600 text-white gap-1.5 shadow-sm text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Transport
        </Button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transports.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Car className="h-6 w-6 text-violet-200" />
            </div>
            <p className="text-sm text-slate-400">No transport added</p>
            <p className="text-xs text-slate-300 mt-1">Add cabs, transfers & local transport</p>
          </div>
        ) : (
          transports.map((transport) => (
            <div
              key={transport.id}
              className="group border border-slate-100 rounded-xl p-3.5 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
            >
              {/* Vehicle + actions */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <Car className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm truncate">
                    {transport.vehicleType}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { setEditTarget(transport); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(transport.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Route */}
              <div className="bg-slate-50 rounded-lg px-2.5 py-2 mb-2.5 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 leading-tight">{transport.pickup}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 leading-tight">{transport.drop}</span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
                <span>🕐</span>
                <span className="font-medium">
                  {format(new Date(transport.datetime), 'dd MMM yyyy, HH:mm')}
                </span>
                {transport.days && (
                  <span className="text-slate-400">· {transport.days} day{transport.days > 1 ? 's' : ''}</span>
                )}
              </div>

              {/* Driver */}
              {transport.driverName && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <span>👤</span>
                  <span>{transport.driverName}</span>
                  {transport.driverPhone && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{transport.driverPhone}</span>
                    </>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-xs border ${
                    transport.transportType === 'PRIVATE'
                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {transport.transportType}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs border ${
                    transport.included
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {transport.included ? '✓ Included' : 'Not Included'}
                </Badge>
              </div>

              {transport.notes && (
                <p className="text-xs text-slate-400 mt-2 italic truncate">{transport.notes}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {transports.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{transports.length} vehicle{transports.length > 1 ? 's' : ''}</span>
            <span className="font-medium text-violet-600">
              {transports.filter((t) => t.included).length} included
            </span>
          </div>
        </div>
      )}

      <TransportFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
        onSave={editTarget ? handleEdit : handleAdd}
        initial={editTarget}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove transport?</AlertDialogTitle>
            <AlertDialogDescription>
              This transport entry will be permanently removed.
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