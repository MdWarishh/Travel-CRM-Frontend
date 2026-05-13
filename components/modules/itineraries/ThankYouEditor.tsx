'use client';

import { useForm } from 'react-hook-form';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThankYouPayload, ItineraryThankYou } from '@/types/itinerary.types';

interface Props {
  defaultValues?: ItineraryThankYou | null;
  onSave: (data: ThankYouPayload) => Promise<void>;
  loading?: boolean;
}

export function ThankYouEditor({ defaultValues, onSave, loading }: Props) {
  const { register, handleSubmit, watch } = useForm<ThankYouPayload>({
    defaultValues: {
      message: defaultValues?.message ?? '',
      backgroundImageUrl: defaultValues?.backgroundImageUrl ?? '',
      companyName: defaultValues?.companyName ?? '',
      companyAddress: defaultValues?.companyAddress ?? '',
      companyEmail: defaultValues?.companyEmail ?? '',
      companyPhone: defaultValues?.companyPhone ?? '',
      companyWebsite: defaultValues?.companyWebsite ?? '',
      findUsText: defaultValues?.findUsText ?? '',
    },
  });

  const bgUrl = watch('backgroundImageUrl');

  return (
    <Card className="border border-slate-200 shadow-none">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-slate-500" />
          Thank You Page
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          {/* Preview */}
          {bgUrl && (
            <div
              className="h-28 rounded-xl overflow-hidden bg-slate-800 relative"
              style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-sm font-semibold opacity-80">Background Preview</p>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Thank You Message</Label>
            <Textarea
              {...register('message')}
              placeholder="We look forward to making your journey unforgettable..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Background Image URL</Label>
            <Input {...register('backgroundImageUrl')} placeholder="https://cloudinary.com/..." className="h-9" />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Company Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'companyName', label: 'Company Name', placeholder: 'Your Travel Co.' },
                { name: 'companyPhone', label: 'Phone', placeholder: '+91 98765 43210' },
                { name: 'companyEmail', label: 'Email', placeholder: 'hello@travelco.com' },
                { name: 'companyWebsite', label: 'Website', placeholder: 'https://travelco.com' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <Label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</Label>
                  <Input {...register(name as any)} placeholder={placeholder} className="h-9 text-sm" />
                </div>
              ))}
              <div className="col-span-2">
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Address</Label>
                <Input {...register('companyAddress')} placeholder="123, Travel Street, Mumbai" className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Find Us Text</Label>
                <Textarea
                  {...register('findUsText')}
                  placeholder="We're open Mon–Sat, 9am–7pm..."
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white">
            {loading ? 'Saving...' : 'Save Thank You Page'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}