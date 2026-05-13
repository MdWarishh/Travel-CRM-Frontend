'use client';

import { useForm } from 'react-hook-form';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ThemePayload, ItineraryTheme } from '@/types/itinerary.types';

const FONT_OPTIONS = [
  'Inter', 'Plus Jakarta Sans', 'DM Sans', 'Outfit',
  'Sora', 'Nunito', 'Lato', 'Poppins',
];

const PRESET_THEMES: { name: string; values: ThemePayload }[] = [
  { name: 'Ocean Blue', values: { primaryColor: '#1a56db', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#f59e0b', fontFamily: 'Plus Jakarta Sans' } },
  { name: 'Forest', values: { primaryColor: '#065f46', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#f59e0b', fontFamily: 'DM Sans' } },
  { name: 'Royal Plum', values: { primaryColor: '#4c1d95', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#f59e0b', fontFamily: 'Outfit' } },
  { name: 'Slate Dark', values: { primaryColor: '#0f172a', backgroundColor: '#ffffff', textColor: '#0f172a', accentColor: '#ef4444', fontFamily: 'Sora' } },
  { name: 'Rose Gold', values: { primaryColor: '#9f1239', backgroundColor: '#fff7f7', textColor: '#1a1a1a', accentColor: '#f59e0b', fontFamily: 'Nunito' } },
];

interface Props {
  defaultValues?: ItineraryTheme | null;
  onSave: (data: ThemePayload) => Promise<void>;
  loading?: boolean;
}

export function ThemeEditor({ defaultValues, onSave, loading }: Props) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<ThemePayload>({
    defaultValues: {
      primaryColor: defaultValues?.primaryColor ?? '#1a56db',
      backgroundColor: defaultValues?.backgroundColor ?? '#ffffff',
      textColor: defaultValues?.textColor ?? '#111827',
      accentColor: defaultValues?.accentColor ?? '#f59e0b',
      fontFamily: defaultValues?.fontFamily ?? 'Plus Jakarta Sans',
    },
  });

  const values = watch();

  const applyPreset = (preset: ThemePayload) => {
    reset(preset);
  };

  return (
    <Card className="border border-slate-200 shadow-none">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-500" />
          PDF Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
          {/* Preset chips */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.values)}
                  className="inline-flex items-center gap-2 text-xs border border-slate-200 rounded-full px-3 py-1 hover:border-slate-400 transition-colors"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-slate-300"
                    style={{ background: preset.values.primaryColor }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview strip */}
          <div
            className="h-10 rounded-lg flex items-center px-4 gap-3 text-xs font-medium transition-all"
            style={{ background: values.primaryColor, color: '#fff' }}
          >
            <span style={{ color: values.accentColor }}>✦</span>
            <span style={{ fontFamily: values.fontFamily }}>Preview · {values.fontFamily}</span>
            <span
              className="ml-auto h-5 px-2 rounded-full flex items-center text-[11px]"
              style={{ background: values.accentColor, color: '#000' }}
            >
              Accent
            </span>
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'primaryColor', label: 'Primary Color' },
              { name: 'backgroundColor', label: 'Background' },
              { name: 'textColor', label: 'Text Color' },
              { name: 'accentColor', label: 'Accent Color' },
            ].map(({ name, label }) => (
              <div key={name}>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    {...register(name as keyof ThemePayload)}
                    className="h-9 w-12 rounded-md border border-slate-200 cursor-pointer p-0.5"
                  />
                  <Input {...register(name as keyof ThemePayload)} className="h-9 font-mono text-sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Font */}
          <div>
            <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Font Family</Label>
            <Select
              defaultValue={defaultValues?.fontFamily ?? 'Plus Jakarta Sans'}
              onValueChange={(v) => setValue('fontFamily', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white">
            {loading ? 'Saving...' : 'Save Theme'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}