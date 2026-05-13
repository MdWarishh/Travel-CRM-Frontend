'use client';

import { Search, X, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VENDOR_TYPE_OPTIONS, SORT_OPTIONS } from './vendor.constants';
import { VendorQueryParams } from '@/types/vendors';

interface VendorFiltersProps {
  filters: VendorQueryParams;
  onChange: (f: VendorQueryParams) => void;
  onReset: () => void;
}

export function VendorFilters({ filters, onChange, onReset }: VendorFiltersProps) {
  const activeCount = [filters.type, filters.status, filters.isPreferred]
    .filter((v) => !!v).length;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
      <div className="flex flex-wrap gap-2.5 items-center">

        {/* 🔍 Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search name, city, contact..."
            className="w-full pl-8 pr-3 h-9 text-sm bg-slate-50 border border-slate-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
              placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* 🧩 TYPE FILTER */}
        <Select
          value={filters.type || 'ALL'}
          onValueChange={(v) =>
            onChange({ ...filters, type: v === 'ALL' ? '' : (v as any) })
          }
        >
          <SelectTrigger className="w-40 h-9 text-sm bg-slate-50 border-slate-200">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>

            {VENDOR_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.emoji} {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 📊 STATUS FILTER */}
        <Select
          value={filters.status || 'ALL'}
          onValueChange={(v) =>
            onChange({ ...filters, status: v === 'ALL' ? '' : (v as any) })
          }
        >
          <SelectTrigger className="w-36 h-9 text-sm bg-slate-50 border-slate-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">✅ Active</SelectItem>
            <SelectItem value="INACTIVE">⏸ Inactive</SelectItem>
            <SelectItem value="BLACKLISTED">🚫 Blacklisted</SelectItem>
          </SelectContent>
        </Select>

        {/* 🔽 SORT */}
        <Select
          value={filters.sortBy || 'name'}
          onValueChange={(v) => onChange({ ...filters, sortBy: v as any })}
        >
          <SelectTrigger className="w-36 h-9 text-sm bg-slate-50 border-slate-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ⭐ Preferred */}
        <button
          onClick={() =>
            onChange({
              ...filters,
              isPreferred: filters.isPreferred === 'true' ? '' : 'true',
            })
          }
          className={`h-9 flex items-center gap-1.5 px-3 text-xs font-medium rounded-lg border transition-all
            ${
              filters.isPreferred === 'true'
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'
            }`}
        >
          <Star className={`w-3 h-3 ${filters.isPreferred === 'true' ? 'fill-amber-400 text-amber-400' : ''}`} />
          Preferred
        </button>

        {/* ❌ CLEAR */}
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="h-9 flex items-center gap-1.5 px-3 text-xs font-medium text-slate-400
              hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent
              hover:border-red-100 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear
            <span className="ml-0.5 bg-red-100 text-red-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}