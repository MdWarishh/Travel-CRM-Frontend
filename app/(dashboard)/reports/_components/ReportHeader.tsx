'use client';
// app/(dashboard)/reports/_components/ReportHeader.tsx

import { X } from 'lucide-react';

interface DateRange { from: string; to: string }
interface Props { dateRange: DateRange; onChange: (d: DateRange) => void }

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: '7D',    days: 7 },
  { label: '30D',   days: 30 },
  { label: '90D',   days: 90 },
  { label: '1Y',    days: 365 },
];

export function ReportHeader({ dateRange, onChange }: Props) {
  const applyPreset = (days: number) => {
    const to   = new Date();
    const from = new Date();
    if (days > 0) from.setDate(from.getDate() - days);
    onChange({
      from: from.toISOString().split('T')[0],
      to:   to.toISOString().split('T')[0],
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Business intelligence dashboard</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Quick presets */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <input
          type="date" value={dateRange.from}
          onChange={(e) => onChange({ ...dateRange, from: e.target.value })}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
        <span className="text-slate-400 text-xs">→</span>
        <input
          type="date" value={dateRange.to}
          onChange={(e) => onChange({ ...dateRange, to: e.target.value })}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />

        {(dateRange.from || dateRange.to) && (
          <button
            onClick={() => onChange({ from: '', to: '' })}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}