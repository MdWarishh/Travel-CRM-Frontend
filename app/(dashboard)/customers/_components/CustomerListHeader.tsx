'use client';

import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  total?: number;
  onCreateClick: () => void;
}

export function CustomerListHeader({ total, onCreateClick }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          {total !== undefined && (
            <p className="text-sm text-muted-foreground">{total} total clients</p>
          )}
        </div>
      </div>

      <Button onClick={onCreateClick} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        New Customer
      </Button>
    </div>
  );
}