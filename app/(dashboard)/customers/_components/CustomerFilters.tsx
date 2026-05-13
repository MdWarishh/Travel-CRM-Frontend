'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerListParams } from '@/types/customer.types';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'VIP', value: 'vip' },
  { label: 'Repeat', value: 'repeat' },
  { label: 'Recent', value: 'recent' },
] as const;

interface Props {
  params: CustomerListParams;
  onChange: (updates: Partial<CustomerListParams>) => void;
}

export function CustomerFilters({ params, onChange }: Props) {
  const [search, setSearch] = useState(params.search ?? '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    onChange({ search: debouncedSearch || undefined });
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={params.filter === f.value || (!params.filter && f.value === '') ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ filter: f.value as CustomerListParams['filter'] })}
            className="text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Sort */}
      <Select
        value={params.sort ?? 'latest'}
        onValueChange={(v) => onChange({ sort: v as CustomerListParams['sort'] })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="name_asc">Name A–Z</SelectItem>
          <SelectItem value="name_desc">Name Z–A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}