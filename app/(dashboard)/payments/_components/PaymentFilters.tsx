'use client';

import { Search, SlidersHorizontal, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { PaymentsQueryParams, PaymentMode, PaymentStatus } from '@/types/payment';

interface PaymentFiltersProps {
  filters: PaymentsQueryParams;
  onFilterChange: (key: keyof PaymentsQueryParams, value: string) => void;
  onReset: () => void;
  onExport: () => void;
  isExporting: boolean;
}

const STATUS_OPTIONS: { value: PaymentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIALLY_PAID', label: 'Partial' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const MODE_OPTIONS: { value: PaymentMode | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Modes' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Card' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
];

export function PaymentFilters({
  filters,
  onFilterChange,
  onReset,
  onExport,
  isExporting,
}: PaymentFiltersProps) {
  const activeFilterCount = [
    filters.status,
    filters.mode,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          className="pl-9 h-9 text-sm"
          value={filters.search ?? ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Status */}
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(v) => onFilterChange('status', v === 'ALL' ? '' : v)}
        >
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort ?? 'latest'}
          onValueChange={(v) => onFilterChange('sort', v)}
        >
          <SelectTrigger className="h-9 w-[145px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 relative">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="end">
            <div className="space-y-4">
              <p className="text-sm font-medium">Advanced Filters</p>

              {/* Mode */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                <Select
                  value={filters.mode ?? 'ALL'}
                  onValueChange={(v) => onFilterChange('mode', v === 'ALL' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From Date</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={filters.startDate ?? ''}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={filters.endDate ?? ''}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                />
              </div>

              <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={onReset}>
                Reset All Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={onExport}
          disabled={isExporting}
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </div>
  );
}