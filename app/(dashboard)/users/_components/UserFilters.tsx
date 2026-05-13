'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserQueryParams, SystemRole, UserStatus } from '@/types/users';

interface Props {
  filters: UserQueryParams;
  onChange: (filters: UserQueryParams) => void;
}

export function UserFilters({ filters, onChange }: Props) {
  const hasActive =
    filters.search || filters.role || filters.status || filters.department;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search name or email..."
          className="pl-9"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.role ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...filters, role: v === 'all' ? undefined : (v as SystemRole), page: 1 })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="MANAGER">Manager</SelectItem>
          <SelectItem value="AGENT">Agent</SelectItem>
          <SelectItem value="VENDOR">Vendor</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...filters, status: v === 'all' ? undefined : (v as UserStatus), page: 1 })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={`${filters.sortBy ?? 'createdAt'}_${filters.sortOrder ?? 'desc'}`}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split('_') as [UserQueryParams['sortBy'], UserQueryParams['sortOrder']];
          onChange({ ...filters, sortBy, sortOrder });
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt_desc">Newest First</SelectItem>
          <SelectItem value="createdAt_asc">Oldest First</SelectItem>
          <SelectItem value="name_asc">Name A-Z</SelectItem>
          <SelectItem value="name_desc">Name Z-A</SelectItem>
          <SelectItem value="lastLogin_desc">Last Login</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ page: 1, limit: 20 })}
          className="gap-1 text-gray-500 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}