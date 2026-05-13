'use client';

import { useState, useCallback } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { TaskFilter, TaskQueryParams, TaskPriority, TaskType } from '@/types/task.types';

// ─── Filter tab config ────────────────────────────────────────────────────────
const FILTER_TABS: { value: TaskFilter; label: string; color?: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'today',     label: 'Today',     color: 'amber'  },
  { value: 'upcoming',  label: 'Upcoming',  color: 'blue'   },
  { value: 'overdue',   label: 'Overdue',   color: 'red'    },
  { value: 'completed', label: 'Completed', color: 'green'  },
];

const TAB_ACTIVE: Record<string, string> = {
  all:       'bg-primary text-primary-foreground',
  today:     'bg-amber-500 text-white',
  upcoming:  'bg-blue-600 text-white',
  overdue:   'bg-red-600 text-white',
  completed: 'bg-green-600 text-white',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface TaskFiltersProps {
  params:       TaskQueryParams;
  onFilter:     (filter: TaskFilter) => void;
  onSearch:     (search: string) => void;
  onPriority:   (priority?: TaskPriority) => void;
  onType:       (type?: TaskType) => void;
  onReset:      () => void;
  totalResults: number;
}

export default function TaskFilters({
  params, onFilter, onSearch, onPriority, onType, onReset, totalResults,
}: TaskFiltersProps) {
  const [searchVal, setSearchVal] = useState(params.search ?? '');
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilters = !!(params.priority || params.type || params.search);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch(searchVal);
    if (e.key === 'Escape') { setSearchVal(''); onSearch(''); }
  }, [searchVal, onSearch]);

  const clearSearch = () => { setSearchVal(''); onSearch(''); };

  const activeFilterCount = [params.priority, params.type].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = params.filter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onFilter(tab.value)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
                isActive
                  ? TAB_ACTIVE[tab.value] + ' shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search + filter row */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchVal}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search tasks..."
            className="pl-9 pr-8"
          />
          {searchVal && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Advanced filters popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { onReset(); setFilterOpen(false); }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>

              <Separator />

              {/* Priority filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </label>
                <Select
                  value={params.priority ?? 'all'}
                  onValueChange={(v) => onPriority(v === 'all' ? undefined : v as TaskPriority)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="HIGH">🔴 High</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="LOW">⚪ Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Task Type
                </label>
                <Select
                  value={params.type ?? 'all'}
                  onValueChange={(v) => onType(v === 'all' ? undefined : v as TaskType)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="TASK">📋 Task</SelectItem>
                    <SelectItem value="MEETING">🤝 Meeting</SelectItem>
                    <SelectItem value="FOLLOW_UP">📞 Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={() => setFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={onReset} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">Active:</span>
          {params.search && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              Search: "{params.search}"
              <button onClick={clearSearch}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {params.priority && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              {params.priority}
              <button onClick={() => onPriority(undefined)}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {params.type && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1">
              {params.type.replace('_', ' ')}
              <button onClick={() => onType(undefined)}><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {totalResults} task{totalResults !== 1 ? 's' : ''} found
      </p>
    </div>
  );
}