'use client';

import { useEffect, useState } from 'react';
import { differenceInDays } from 'date-fns';
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
import { HotelBooking, HotelBookingFormData, RoomType, MealPlan } from '@/types/booking';
import { VendorSelect } from './VendorSelect';

const ROOM_TYPES: RoomType[] = ['STANDARD', 'DELUXE', 'SUITE'];
const MEAL_PLANS: MealPlan[] = ['CP', 'MAP', 'AP', 'EP'];
const MEAL_LABELS: Record<MealPlan, string> = {
  CP: 'CP — Breakfast',
  MAP: 'MAP — Breakfast + Dinner',
  AP: 'AP — All Meals',
  EP: 'EP — No Meals',
};

const EMPTY: HotelBookingFormData = {
  city: '',
  hotelName: '',
  checkIn: '',
  checkOut: '',
  rooms: 1,
  roomType: 'STANDARD',
  mealPlan: 'CP',
  guests: 1,
  extraBed: false,
  notes: '',
  vendorId: null,
  vendorCost: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: HotelBookingFormData) => Promise<void>;
  initial?: HotelBooking;
}

export function HotelFormModal({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<HotelBookingFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              city: initial.city,
              hotelName: initial.hotelName,
              checkIn: initial.checkIn.slice(0, 10),
              checkOut: initial.checkOut.slice(0, 10),
              rooms: initial.rooms,
              roomType: initial.roomType,
              mealPlan: initial.mealPlan,
              guests: initial.guests,
              extraBed: initial.extraBed,
              notes: initial.notes ?? '',
              vendorId: initial.vendorId ?? null,
              vendorCost: initial.vendorCost ?? null,
            }
          : EMPTY
      );
    }
  }, [open, initial]);

  const set = <K extends keyof HotelBookingFormData>(
    key: K,
    value: HotelBookingFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(0, differenceInDays(new Date(form.checkOut), new Date(form.checkIn)))
      : 0;

  const handleSave = async () => {
    if (!form.city || !form.hotelName || !form.checkIn || !form.checkOut) return;
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
            🏨 {initial ? 'Edit' : 'Add'} Hotel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* City & Hotel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Mumbai"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Hotel Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Taj Hotel"
                value={form.hotelName}
                onChange={(e) => set('hotelName', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {/* Dates + nights badge */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Check-in <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.checkIn}
                onChange={(e) => set('checkIn', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Check-out <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.checkOut}
                onChange={(e) => set('checkOut', e.target.value)}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="flex items-center justify-center">
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                📅 {nights} Night{nights !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Rooms, guests, room type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Rooms</Label>
              <Input
                type="number"
                min={1}
                value={form.rooms}
                onChange={(e) => set('rooms', parseInt(e.target.value))}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Guests/Room</Label>
              <Input
                type="number"
                min={1}
                value={form.guests}
                onChange={(e) => set('guests', parseInt(e.target.value))}
                className="rounded-xl border-slate-200 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Room Type</Label>
              <Select
                value={form.roomType}
                onValueChange={(v) => set('roomType', v as RoomType)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meal plan */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Meal Plan</Label>
            <Select
              value={form.mealPlan}
              onValueChange={(v) => set('mealPlan', v as MealPlan)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_PLANS.map((m) => (
                  <SelectItem key={m} value={m}>{MEAL_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Extra bed */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Extra Bed</p>
              <p className="text-xs text-slate-400">Include extra bed / mattress</p>
            </div>
            <Switch
              checked={form.extraBed}
              onCheckedChange={(v) => set('extraBed', v)}
            />
          </div>

          {/* ── Vendor section ── */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Vendor Details
            </p>

            {/* Vendor dropdown — filtered to HOTEL type */}
            <div className="relative">
              <VendorSelect
                vendorType="HOTEL"
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
            disabled={saving || !form.city || !form.hotelName || !form.checkIn || !form.checkOut}
            className="bg-slate-900 hover:bg-slate-800 rounded-xl gap-2"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {initial ? 'Update' : 'Add Hotel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}