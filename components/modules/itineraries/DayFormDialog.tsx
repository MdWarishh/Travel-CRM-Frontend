'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DayPayload, ItineraryDay } from '@/types/itinerary.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: DayPayload) => Promise<void>;
  initialData?: ItineraryDay | null;
  nextDayNumber: number;
  loading?: boolean;
}

type FormValues = DayPayload & { images: { url: string; altText?: string; position?: number }[] };

export function DayFormDialog({ open, onClose, onSave, initialData, nextDayNumber, loading }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      dayNumber: nextDayNumber,
      imageLayout: 'IMAGE_TOP',
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'images' });

  useEffect(() => {
    if (initialData) {
      reset({
        dayNumber: initialData.dayNumber,
        date: initialData.date ? initialData.date.split('T')[0] : '',
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        imageLayout: initialData.imageLayout,
        destination: initialData.destination ?? '',
        hotel: initialData.hotel ?? '',
        meals: initialData.meals ?? '',
        transfers: initialData.transfers ?? '',
        sightseeing: initialData.sightseeing ?? '',
        activities: initialData.activities ?? '',
        notes: initialData.notes ?? '',
        images: initialData.images.map((img) => ({
          url: img.url,
          altText: img.altText ?? '',
          position: img.position,
        })),
      });
    } else {
      reset({ dayNumber: nextDayNumber, imageLayout: 'IMAGE_TOP', images: [] });
    }
  }, [initialData, nextDayNumber, open, reset]);

  const onSubmit = async (values: FormValues) => {
    await onSave(values);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold">
            {initialData ? `Edit Day ${initialData.dayNumber}` : 'Add New Day'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <form id="day-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Day Number *</Label>
                <Input
                  type="number"
                  {...register('dayNumber', { required: true, min: 1, valueAsNumber: true })}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Date</Label>
                <Input type="date" {...register('date')} className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Image Layout</Label>
                <Select
                  defaultValue={initialData?.imageLayout ?? 'IMAGE_TOP'}
                  onValueChange={(v) => setValue('imageLayout', v as any)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE_TOP">Image Top</SelectItem>
                    <SelectItem value="IMAGE_RIGHT">Image Right</SelectItem>
                    <SelectItem value="GRID">Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Title</Label>
                <Input {...register('title')} placeholder="e.g. Arrival & Local Sightseeing" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Destination</Label>
                <Input {...register('destination')} placeholder="e.g. Manali" className="h-9" />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Description</Label>
              <Textarea {...register('description')} placeholder="Describe the day's activities..." rows={3} className="resize-none" />
            </div>

            <Separator />

            {/* Quick Facts */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Facts</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'hotel', label: '🏨 Hotel' },
                  { name: 'meals', label: '🍽️ Meals' },
                  { name: 'transfers', label: '🚐 Transfers' },
                  { name: 'sightseeing', label: '🗺️ Sightseeing' },
                  { name: 'activities', label: '🎯 Activities' },
                  { name: 'notes', label: '📝 Notes' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <Label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</Label>
                    <Input {...register(name as any)} className="h-9" />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Images</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => append({ url: '', altText: '', position: fields.length })}
                >
                  <Plus className="h-3 w-3" /> Add Image
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                  No images added yet
                </p>
              )}

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      {...register(`images.${idx}.url`)}
                      placeholder="Image URL (Cloudinary)"
                      className="h-9 flex-1"
                    />
                    <Input
                      {...register(`images.${idx}.altText`)}
                      placeholder="Alt text"
                      className="h-9 w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="h-9">Cancel</Button>
          <Button form="day-form" type="submit" disabled={loading} className="h-9 bg-slate-900 hover:bg-slate-800">
            {loading ? 'Saving...' : initialData ? 'Update Day' : 'Add Day'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}