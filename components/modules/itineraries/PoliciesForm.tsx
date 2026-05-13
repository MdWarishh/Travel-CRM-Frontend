'use client';

import { useForm } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PolicyPayload, ItineraryPolicy } from '@/types/itinerary.types';

interface Props {
  defaultValues?: ItineraryPolicy | null;
  onSave: (data: PolicyPayload) => Promise<void>;
  loading?: boolean;
}

const FIELDS = [
  { name: 'bookingPolicy', label: '📋 Booking Policy', placeholder: 'e.g. 50% advance required at booking...' },
  { name: 'cancellationPolicy', label: '🔄 Cancellation Policy', placeholder: 'e.g. 100% refund if cancelled 15+ days prior...' },
  { name: 'paymentTerms', label: '💳 Payment Terms', placeholder: 'e.g. Balance due 7 days before travel...' },
  { name: 'otherPolicies', label: '📌 Other Policies', placeholder: 'Any additional terms...' },
] as const;

export function PoliciesForm({ defaultValues, onSave, loading }: Props) {
  const { register, handleSubmit } = useForm<PolicyPayload>({
    defaultValues: {
      bookingPolicy: defaultValues?.bookingPolicy ?? '',
      cancellationPolicy: defaultValues?.cancellationPolicy ?? '',
      paymentTerms: defaultValues?.paymentTerms ?? '',
      otherPolicies: defaultValues?.otherPolicies ?? '',
    },
  });

  return (
    <Card className="border border-slate-200 shadow-none">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          Policies
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          {FIELDS.map(({ name, label, placeholder }) => (
            <div key={name}>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</Label>
              <Textarea
                {...register(name)}
                placeholder={placeholder}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          ))}
          <Button type="submit" disabled={loading} className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white">
            {loading ? 'Saving...' : 'Save Policies'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}