// app/invoice/_components/InvoiceFilters.tsx

'use client';

import { InvoiceStatus } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/invoiceUtils';

interface Filters {
  search: string;
  status: string;
  sort: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  ...Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
];

const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_high', label: 'Amount: High → Low' },
  { value: 'amount_low', label: 'Amount: Low → High' },
];

export function InvoiceFilters({ filters, onChange }: Props) {
  const hasActiveFilters = filters.search || (filters.status && filters.status !== 'all');

  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const clearAll = () =>
    onChange({ search: '', status: 'all', sort: 'newest' });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-52">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search invoice # or client..."
          className="pl-9"
        />
      </div>

      <Select value={filters.status || 'all'} onValueChange={(v) => update('status', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.sort || 'newest'} onValueChange={(v) => update('sort', v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
          <X className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}