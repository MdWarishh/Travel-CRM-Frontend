'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { itinerariesService } from '@/services/itineraries.service';
import { CreateItineraryPayload } from '@/types/itinerary.types';

type FormValues = {
  title: string;
  customerId: string;
  isTemplate: boolean;
  status: string;
  destination: string;
  startPoint: string;
  endPoint: string;
  durationLabel: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  numberOfTravelers: string;
  totalPrice: string;
  heroImageUrl: string;
  inclusions: string;
  exclusions: string;
  notes: string;
};

export default function NewItineraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { status: 'DRAFT', isTemplate: false },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload: CreateItineraryPayload = {
        title: values.title,
        isTemplate,
        status: values.status as any,
        customerId: isTemplate ? null : (values.customerId || null),
        destination: values.destination || undefined,
        startPoint: values.startPoint || undefined,
        endPoint: values.endPoint || undefined,
        durationLabel: values.durationLabel || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        totalDays: values.totalDays ? Number(values.totalDays) : undefined,
        numberOfTravelers: values.numberOfTravelers ? Number(values.numberOfTravelers) : undefined,
        totalPrice: values.totalPrice ? Number(values.totalPrice) : undefined,
        heroImageUrl: values.heroImageUrl || undefined,
        inclusions: values.inclusions || undefined,
        exclusions: values.exclusions || undefined,
        notes: values.notes || undefined,
      };

      const created = await itinerariesService.create(payload);
      toast.success('Itinerary created!');
      router.push(`/itineraries/${created.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/itineraries">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">New Itinerary</h1>
            <p className="text-xs text-slate-500">Fill in the details to create your itinerary</p>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white h-9 gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Creating...' : 'Create & Continue'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Basic Info */}
        <Card className="border border-slate-200 shadow-none">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {/* Template toggle */}
            <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-lg">
              <div>
                <p className="text-sm font-medium text-violet-800">Reusable Template</p>
                <p className="text-xs text-violet-600 mt-0.5">
                  Templates don't need a customer — use for Manali, Goa, Kashmir packages
                </p>
              </div>
              <Switch
                checked={isTemplate}
                onCheckedChange={(v) => {
                  setIsTemplate(v);
                  setValue('isTemplate', v);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g. Manali Honeymoon Package 4N/5D"
                  className={`h-9 ${errors.title ? 'border-red-300' : ''}`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              {!isTemplate && (
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Customer ID</Label>
                  <Input
                    {...register('customerId')}
                    placeholder="Customer UUID"
                    className="h-9 font-mono text-sm"
                  />
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Status</Label>
                <Select defaultValue="DRAFT" onValueChange={(v) => setValue('status', v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="FINALIZED">Finalized</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Duration Label</Label>
                <Input {...register('durationLabel')} placeholder="e.g. 2N/3D" className="h-9" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card className="border border-slate-200 shadow-none">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Destination</Label>
                <Input {...register('destination')} placeholder="e.g. Manali, Himachal Pradesh" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Total Days</Label>
                <Input type="number" {...register('totalDays')} placeholder="5" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Start Point</Label>
                <Input {...register('startPoint')} placeholder="e.g. Delhi" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">End Point</Label>
                <Input {...register('endPoint')} placeholder="e.g. Delhi" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Start Date</Label>
                <Input type="date" {...register('startDate')} className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">End Date</Label>
                <Input type="date" {...register('endDate')} className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Number of Travelers</Label>
                <Input type="number" {...register('numberOfTravelers')} placeholder="2" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Total Price (₹)</Label>
                <Input type="number" {...register('totalPrice')} placeholder="25000" className="h-9" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Hero Image URL</Label>
                <Input {...register('heroImageUrl')} placeholder="https://cloudinary.com/..." className="h-9" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inclusions / Exclusions */}
        <Card className="border border-slate-200 shadow-none">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Inclusions & Exclusions</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">✅ Inclusions</Label>
              <Textarea
                {...register('inclusions')}
                placeholder="• Hotel stay on twin-sharing basis&#10;• Daily breakfast & dinner&#10;• All transfers by AC vehicle"
                rows={4}
                className="resize-none text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">❌ Exclusions</Label>
              <Textarea
                {...register('exclusions')}
                placeholder="• Airfare&#10;• Personal expenses&#10;• Travel insurance"
                rows={4}
                className="resize-none text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">📝 Notes</Label>
              <Textarea
                {...register('notes')}
                placeholder="Any additional notes for this itinerary..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-8">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Creating...' : 'Create Itinerary'}
          </Button>
        </div>
      </div>
    </div>
  );
}