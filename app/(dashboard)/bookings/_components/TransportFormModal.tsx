'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { TransportBooking, TransportBookingFormData, TransportType } from '@/types/booking';
import { VendorSelect } from './VendorSelect';

const VEHICLE_TYPES = [
  'Swift Dzire', 'Toyota Innova', 'Toyota Innova Crysta',
  'Maruti Ertiga', 'Tempo Traveller', 'Mini Bus',
  'Luxury Bus', 'Auto Rickshaw', 'Taxi', 'Other',
];

const EMPTY: TransportBookingFormData = {
  vehicleType: '',
  pickup: '',
  drop: '',
  datetime: '',
  driverName: '',
  driverPhone: '',
  transportType: 'PRIVATE',
  days: undefined,
  included: false,
  notes: '',
  vendorId: null,
  vendorCost: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransportBookingFormData) => Promise<void>;
  initial?: TransportBooking;
}

export function TransportFormModal({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<TransportBookingFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [customVehicle, setCustomVehicle] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        const isCustom = !VEHICLE_TYPES.slice(0, -1).includes(initial.vehicleType);
        setCustomVehicle(isCustom);
        setForm({
          vehicleType: initial.vehicleType,
          pickup: initial.pickup,
          drop: initial.drop,
          datetime: initial.datetime.slice(0, 16),
          driverName: initial.driverName ?? '',
          driverPhone: initial.driverPhone ?? '',
          transportType: initial.transportType,
          days: initial.days ?? undefined,
          included: initial.included,
          notes: initial.notes ?? '',
          vendorId: initial.vendorId ?? null,
          vendorCost: initial.vendorCost ?? null,
        });
      } else {
        setCustomVehicle(false);
        setForm(EMPTY);
      }
    }
  }, [open, initial]);

  const set = <K extends keyof TransportBookingFormData>(
    key: K,
    value: TransportBookingFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.vehicleType || !form.pickup || !form.drop || !form.datetime) return;
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
            🚗 {initial ? 'Edit' : 'Add'} Transport Booking
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Vehicle type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Vehicle Type <span className="text-red-500">*</span>
            </Label>
            {!customVehicle ? (
              <Select
                value={form.vehicleType}
                onValueChange={(v) => {
                  if (v === 'Other') {
                    setCustomVehicle(true);
                    set('vehicleType', '');
                  } else {
                    set('vehicleType', v);
                  }
                }}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter vehicle type"
                  value={form.vehicleType}
                  onChange={(e) => set('vehicleType', e.target.value)}
                  className="rounded-xl border-slate-200 h-9 text-sm flex-1"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCustomVehicle(false); set('vehicleType', ''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 h-9 rounded-xl"
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>

          {/* Pickup & Drop */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Pickup <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. IGI Airport T3"
                value={form.pickup}
                onChange={(e) => set('pickup', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Drop <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Connaught Place"
                value={form.drop}
                onChange={(e) => set('drop', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {/* Datetime & Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={form.datetime}
                onChange={(e) => set('datetime', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Days (optional)</Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 3"
                value={form.days ?? ''}
                onChange={(e) =>
                  set('days', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {/* Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Driver Name</Label>
              <Input
                placeholder="e.g. Ramesh Kumar"
                value={form.driverName ?? ''}
                onChange={(e) => set('driverName', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Driver Phone</Label>
              <Input
                type="tel"
                placeholder="e.g. 98XXXXXXXX"
                value={form.driverPhone ?? ''}
                onChange={(e) => set('driverPhone', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {/* Transport type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Transport Type</Label>
            <Select
              value={form.transportType}
              onValueChange={(v) => set('transportType', v as TransportType)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="SHARED">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Included */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Included in Package</p>
              <p className="text-xs text-slate-400">Transport cost included in booking</p>
            </div>
            <Switch
              checked={form.included}
              onCheckedChange={(v) => set('included', v)}
            />
          </div>

          {/* ── Vendor section ── */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Vendor / Provider Details
            </p>

            {/* Vendor dropdown — filtered to TRANSPORT type */}
            <div className="relative">
              <VendorSelect
                vendorType="TRANSPORT"
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
              placeholder="Any special instructions..."
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
            disabled={saving || !form.vehicleType || !form.pickup || !form.drop || !form.datetime}
            className="bg-slate-900 hover:bg-slate-800 rounded-xl gap-2"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {initial ? 'Update' : 'Add Transport'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}