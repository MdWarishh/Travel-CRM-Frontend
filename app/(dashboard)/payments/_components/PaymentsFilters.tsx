'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, CalendarRange } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { UnifiedPaymentsQueryParams } from '@/types/payment';

interface Props {
  filters: UnifiedPaymentsQueryParams;
  onChange: (filters: UnifiedPaymentsQueryParams) => void;
}

export default function PaymentsFilters({ filters, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.type,
    filters.source,
    filters.status,
    filters.method,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  const update = (key: keyof UnifiedPaymentsQueryParams, value: string | undefined) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const clearAll = () => {
    onChange({ page: 1, limit: filters.limit, sort: 'latest' });
  };

  return (
    <div className="space-y-3">
      {/* Search + sort + filter toggle row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, vendor, reference..."
            className="pl-9 h-9 bg-background"
            value={filters.search ?? ''}
            onChange={(e) => update('search', e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => update('search', undefined)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          value={filters.sort ?? 'latest'}
          onValueChange={(v) => update('sort', v)}
        >
          <SelectTrigger className="w-[140px] h-9 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="highest">Highest amount</SelectItem>
            <SelectItem value="lowest">Lowest amount</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 px-1 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearAll}>
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 rounded-lg border bg-muted/30">
          {/* Type */}
          <Select
            value={filters.type ?? 'all'}
            onValueChange={(v) => update('type', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INCOMING">Incoming</SelectItem>
              <SelectItem value="OUTGOING">Outgoing</SelectItem>
            </SelectContent>
          </Select>

          {/* Source */}
          <Select
            value={filters.source ?? 'all'}
            onValueChange={(v) => update('source', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="BOOKING">Booking</SelectItem>
              <SelectItem value="INVOICE">Invoice</SelectItem>
              <SelectItem value="TICKET">Flight Deal</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(v) => update('status', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Method */}
          <Select
            value={filters.method ?? 'all'}
            onValueChange={(v) => update('method', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From */}
          <Input
            type="date"
            className="h-8 bg-background text-xs"
            value={filters.startDate ? filters.startDate.split('T')[0] : ''}
            onChange={(e) =>
              update('startDate', e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined)
            }
          />

          {/* Date To */}
          <Input
            type="date"
            className="h-8 bg-background text-xs"
            value={filters.endDate ? filters.endDate.split('T')[0] : ''}
            onChange={(e) =>
              update('endDate', e.target.value ? `${e.target.value}T23:59:59.000Z` : undefined)
            }
          />
        </div>
      )}
    </div>
  );
}