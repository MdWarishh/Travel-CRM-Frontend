'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FlightBooking,
  FlightBookingFormData,
  TravelClass,
  FlightStatus,
} from '@/types/booking';
import { VendorSelect } from './VendorSelect';

const EMPTY: FlightBookingFormData = {
  from: '',
  to: '',
  departure: '',
  arrival: '',
  airline: '',
  flightNumber: '',
  pnr: '',
  travelClass: 'ECONOMY',
  baggage: '',
  status: 'PENDING',
  notes: '',
  vendorId: null,
  vendorCost: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FlightBookingFormData) => Promise<void>;
  initial?: FlightBooking;
}

export function FlightFormModal({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<FlightBookingFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              from: initial.from,
              to: initial.to,
              departure: initial.departure.slice(0, 16),
              arrival: initial.arrival.slice(0, 16),
              airline: initial.airline ?? '',
              flightNumber: initial.flightNumber ?? '',
              pnr: initial.pnr ?? '',
              travelClass: initial.travelClass,
              baggage: initial.baggage ?? '',
              status: initial.status,
              notes: initial.notes ?? '',
              vendorId: initial.vendorId ?? null,
              vendorCost: initial.vendorCost ?? null,
            }
          : EMPTY
      );
    }
  }, [open, initial]);

  const set = <K extends keyof FlightBookingFormData>(
    key: K,
    value: FlightBookingFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.from || !form.to || !form.departure || !form.arrival) return;
    try {
      setSaving(true);
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            ✈️ {initial ? 'Edit' : 'Add'} Flight Booking
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Route */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                From <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Delhi (DEL)"
                value={form.from}
                onChange={(e) => set('from', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                To <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Mumbai (BOM)"
                value={form.to}
                onChange={(e) => set('to', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {/* Departure & Arrival */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Departure <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={form.departure}
                onChange={(e) => set('departure', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Arrival <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={form.arrival}
                onChange={(e) => set('arrival', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {/* Airline, Flight No */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Airline</Label>
              <Input
                placeholder="e.g. IndiGo"
                value={form.airline ?? ''}
                onChange={(e) => set('airline', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Flight No.</Label>
              <Input
                placeholder="e.g. 6E-2341"
                value={form.flightNumber ?? ''}
                onChange={(e) => set('flightNumber', e.target.value)}
                className="rounded-xl border-slate-200 h-9 font-mono text-sm"
              />
            </div>
          </div>

          {/* PNR, Class, Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">PNR</Label>
              <Input
                placeholder="e.g. AB1234"
                value={form.pnr ?? ''}
                onChange={(e) => set('pnr', e.target.value)}
                className="rounded-xl border-slate-200 h-9 font-mono text-sm uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Class</Label>
              <Select
                value={form.travelClass}
                onValueChange={(v) => set('travelClass', v as TravelClass)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Economy</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="FIRST">First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as FlightStatus)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Baggage */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Baggage Info</Label>
            <Input
              placeholder="e.g. 15kg check-in + 7kg cabin"
              value={form.baggage ?? ''}
              onChange={(e) => set('baggage', e.target.value)}
              className="rounded-xl border-slate-200 h-9 text-sm"
            />
          </div>

          {/* ── Vendor section ── */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Vendor / Agent Details
            </p>

            {/* Vendor dropdown — filtered to AIRLINE type */}
            <div className="relative">
              <VendorSelect
                vendorType="AIRLINE"
                value={form.vendorId}
                onChange={(id) => set('vendorId', id)}
              />
            </div>

            {/* Vendor cost */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Vendor Cost <span className="text-slate-400 font-normal">(what we pay)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.vendorCost ?? ''}
                  onChange={(e) =>
                    set('vendorCost', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  className="rounded-xl border-slate-200 h-9 text-sm pl-7"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Notes</Label>
            <Textarea
              placeholder="Any special requirements..."
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              className="rounded-xl border-slate-200 text-sm resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-0 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.from || !form.to || !form.departure || !form.arrival}
            className="bg-slate-900 hover:bg-slate-800 rounded-xl gap-2"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {initial ? 'Update' : 'Add Flight'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}